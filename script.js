// Sample doctors data
 
const doctors = [
  { name: "Dr. Ananya Sharma", spec: "Cardiology", city: "Delhi", rating: 4.8, fee: 800, exp: "12 yrs" },
  { name: "Dr. Rohan Verma", spec: "Dermatology", city: "Mumbai", rating: 4.6, fee: 600, exp: "8 yrs" },
  { name: "Dr. Priya Nair", spec: "Neurology", city: "Bangalore", rating: 4.9, fee: 1200, exp: "15 yrs" },
  { name: "Dr. Karan Mehta", spec: "Pediatrics", city: "Udaipur", rating: 4.7, fee: 500, exp: "10 yrs" },
  { name: "Dr. Sneha Iyer", spec: "Cardiology", city: "Jaipur", rating: 4.5, fee: 900, exp: "9 yrs" }
];

let selectedDoctor = null;

function renderDoctors(list) {
  const container = document.getElementById('doctorsContainer');
  container.innerHTML = '';
  if (list.length === 0) {
    container.innerHTML = '<p>No doctors found.</p>';
    return;
  }
  list.forEach(doc => {
    const card = document.createElement('div');
    card.className = 'doctor-card';
    card.innerHTML = `
      <div class="doc-top">
        <div class="doc-avatar" style="background:#DCFCE7;color:#059669;">${doc.name.split(' ').map(n => n[0]).join('')}</div>
        <div>
          <div class="doc-name">${doc.name}</div>
          <div class="doc-spec">${doc.spec} • ${doc.city}</div>
          <div class="doc-rating">⭐ ${doc.rating}</div>
        </div>
      </div>
      <div class="doc-badges">
        <span class="badge badge-green">${doc.exp} experience</span>
        <span class="badge badge-blue">₹${doc.fee} fee</span>
      </div>
      <div class="doc-divider"></div>
      <div class="doc-footer">
        <div class="doc-meta">Available today</div>
        <button class="btn-book" onclick='openBookModal(${JSON.stringify(doc)})'>Book Now</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function filterDoctors() {
  const searchVal = document.getElementById('searchInput').value.toLowerCase();
  const spec = document.getElementById('specSelect').value;
  const city = document.getElementById('cityInput').value.toLowerCase();
  const filtered = doctors.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchVal) || doc.spec.toLowerCase().includes(searchVal);
    const matchesSpec = spec === '' || doc.spec === spec;
    const matchesCity = city === '' || doc.city.toLowerCase().includes(city);
    return matchesSearch && matchesSpec && matchesCity;
  });
  renderDoctors(filtered);
}

function openBookModal(doc) {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please login first to book an appointment');
    window.location.href = 'auth.html';
    return;
  }
  selectedDoctor = doc;
  document.getElementById('bookDoctorInfo').innerText = `${doc.name} - ${doc.spec}`;
  document.getElementById('bookMessage').innerText = '';
  document.getElementById('bookModal').classList.add('open');
}

function closeBookModal() {
  document.getElementById('bookModal').classList.remove('open');
}

async function confirmBooking() {
  const date = document.getElementById('bookDate').value;
  const time = document.getElementById('bookTime').value;
  const msgBox = document.getElementById('bookMessage');

  if (!date) {
    msgBox.style.color = 'red';
    msgBox.innerText = 'Please select a date';
    return;
  }

  const token = localStorage.getItem('token');
  try {
    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        doctorName: selectedDoctor.name,
        specialty: selectedDoctor.spec,
        date: date,
        time: time
      })
    });
    const data = await res.json();
    if (res.ok) {
      msgBox.style.color = 'green';
      msgBox.innerText = 'Appointment booked successfully!';
      setTimeout(() => { closeBookModal(); }, 1500);
    } else {
      msgBox.style.color = 'red';
      msgBox.innerText = data.error || 'Booking failed';
    }
  } catch (err) {
    msgBox.style.color = 'red';
    msgBox.innerText = 'Something went wrong. Try again.';
  }
}

function openAiChat() {
  document.getElementById('aiModal').classList.add('open');
  const chatBody = document.getElementById('chatBody');
  if (chatBody.children.length === 0) {
    addMessage("Hi! I'm your AI health assistant. Describe your symptoms and I'll suggest a specialist.", 'ai');
  }
}

function closeAiChat() {
  document.getElementById('aiModal').classList.remove('open');
}

function addMessage(text, sender) {
  const chatBody = document.getElementById('chatBody');
  const msg = document.createElement('div');
  msg.className = `msg ${sender}`;
  msg.innerHTML = `<div class="msg-bubble">${text}</div>`;
  chatBody.appendChild(msg);
  chatBody.scrollTop = chatBody.scrollHeight;
}

function getAiReply(text) {
  const lower = text.toLowerCase();
  if (lower.includes('heart') || lower.includes('chest') || lower.includes('dil')) {
    return "Based on your symptoms, I'd recommend seeing a Cardiologist. We have specialists available today.";
  } else if (lower.includes('skin') || lower.includes('rash') || lower.includes('twacha')) {
    return "This sounds like a skin-related issue. A Dermatologist would be the right specialist for you.";
  } else if (lower.includes('head') || lower.includes('brain') || lower.includes('sar dard')) {
    return "For headaches or nervous system issues, I'd suggest consulting a Neurologist.";
  } else if (lower.includes('child') || lower.includes('baby') || lower.includes('bachcha')) {
    return "For child healthcare concerns, please consult one of our Pediatricians.";
  } else {
    return "Thanks for sharing. Could you describe your symptoms in more detail so I can suggest the right specialist?";
  }
}

function sendAiMessage() {
  const input = document.getElementById('aiInput');
  const text = input.value.trim();
  if (!text) return;
  addMessage(text, 'user');
  input.value = '';
  setTimeout(() => {
    addMessage(getAiReply(text), 'ai');
  }, 500);
}

function updateNavForLoggedInUser() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (token && user) {
    const navActions = document.getElementById('navActions');
    if (navActions) {
      navActions.innerHTML = `
        <span style="color:var(--gray-600); font-weight:500;">Hi, ${user.name}</span>
        <button class="btn-outline" onclick="logout()">Log Out</button>
      `;
    }
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.reload();
}

document.addEventListener('DOMContentLoaded', () => {
  renderDoctors(doctors);
  updateNavForLoggedInUser();
  const aiInput = document.getElementById('aiInput');
  if (aiInput) {
    aiInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendAiMessage();
    });
  }
});
