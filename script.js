// Sample doctors data
 


const API_BASE = '/api';
let allDoctors = [];
let filteredDoctors = [];
let selectedSlot = '';
let currentDoctor = null;

async function fetchDoctors() {
  const grid = document.getElementById('doctorsGrid');
  try {
    const response = await fetch(`${API_BASE}/doctors`);
    const doctors = await response.json();
    allDoctors = doctors;
    filteredDoctors = [...allDoctors];
    renderDoctors(filteredDoctors);
  } catch (error) {
    grid.innerHTML = `<p>Doctors load nahi ho paye. Page refresh karo.</p>`;
  }
}

function renderDoctors(list) {
  const grid = document.getElementById('doctorsGrid');
  const countEl = document.getElementById('docCount');
  if (countEl) countEl.textContent = `Showing ${list.length} doctor${list.length !== 1 ? 's' : ''}`;
  if (list.length === 0) {
    grid.innerHTML = `<p>Koi doctor nahi mila.</p>`;
    return;
  }
  grid.innerHTML = list.map(d => `
    <div class="doctor-card">
      <div class="doc-top">
        <div class="doc-avatar" style="background:${d.color};color:${d.textColor}">${d.initials}</div>
        <div class="doc-info">
          <div class="doc-name">${d.name}</div>
          <div class="doc-spec">${d.specialization}</div>
          <div class="doc-rating">⭐ ${d.rating}</div>
        </div>
      </div>
      <div class="doc-badges">
        ${d.badges.map((b, i) => `<span class="badge ${i===0?'badge-green':i===1?'badge-blue':'badge-amber'}">${b}</span>`).join('')}
      </div>
      <div class="doc-divider"></div>
      <div class="doc-footer">
        <div class="doc-meta">
          <div>${d.experience} experience</div>
          <div>Fee: ${d.fee}</div>
          <div style="color:var(--teal-400);font-weight:600">✓ ${d.avail}</div>
        </div>
        <button class="btn-book" onclick="openModal('${d._id}')">Book Now</button>
      </div>
    </div>
  `).join('');
}

function filterDoctors() {
  const name = (document.getElementById('searchInput')?.value || '').toLowerCase();
  const spec = document.getElementById('specSelect')?.value || '';
  const city = (document.getElementById('cityInput')?.value || '').toLowerCase();
  filteredDoctors = allDoctors.filter(d => {
    const matchName = !name || d.name.toLowerCase().includes(name) || d.specialization.toLowerCase().includes(name);
    const matchSpec = !spec || d.specialization === spec;
    return matchName && matchSpec;
  });
  renderDoctors(filteredDoctors);
}

function openModal(id) {
  currentDoctor = allDoctors.find(d => d._id === id);
  if (!currentDoctor) return;
  document.getElementById('modalName').textContent = currentDoctor.name;
  document.getElementById('modalSpec').textContent = currentDoctor.specialization;
  const av = document.getElementById('modalAvatar');
  av.textContent = currentDoctor.initials;
  av.style.background = currentDoctor.color;
  av.style.color = currentDoctor.textColor;
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('patDate').min = today;
  document.getElementById('patDate').value = today;
  document.getElementById('patName').value = '';
  document.getElementById('patPhone').value = '';
  document.getElementById('patAge').value = '';
  document.getElementById('patReason').value = '';
  document.getElementById('bookingForm').style.display = '';
  document.getElementById('successScreen').classList.remove('show');
  document.querySelectorAll('.slot.selected').forEach(s => s.classList.remove('selected'));
  selectedSlot = '';
  document.getElementById('modalOverlay').classList.add('open');
}

function closeModalDirect() {
  document.getElementById('modalOverlay').classList.remove('open');
}

function selectSlot(el) {
  if (el.classList.contains('unavailable')) return;
  document.querySelectorAll('.slot').forEach(s => s.classList.remove('selected'));
  el.classList.add('selected');
  selectedSlot = el.textContent;
}

async function confirmBooking() {
  const name = document.getElementById('patName').value.trim();
  const phone = document.getElementById('patPhone').value.trim();
  const date = document.getElementById('patDate').value;
  const age = document.getElementById('patAge').value;
  const reason = document.getElementById('patReason').value.trim();

  if (!name) { alert('Please enter your name.'); return; }
  if (!phone) { alert('Please enter your phone number.'); return; }
  if (!date) { alert('Please select a date.'); return; }
  if (!selectedSlot) { alert('Please select a time slot.'); return; }

  const bookingData = {
    doctorId: currentDoctor._id,
    patientName: name,
    phone: phone,
    age: age,
    date: date,
    slot: selectedSlot,
    reason: reason || 'General Consultation'
  };

  try {
    const response = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData)
    });
    if (!response.ok) throw new Error('Booking failed');
    const ref = `MCP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    showSuccess(ref, date);
  } catch (error) {
    alert('Booking fail ho gayi. Dobara try karo.');
  }
}

function showSuccess(ref, date) {
  document.getElementById('bookingRef').textContent = 'REF: ' + ref;
  const formattedDate = new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  document.getElementById('bookingSummary').innerHTML = `<strong>${currentDoctor.name}</strong> · ${formattedDate} · ${selectedSlot}<br>Fee: ${currentDoctor.fee}`;
  document.getElementById('bookingForm').style.display = 'none';
  document.getElementById('successScreen').classList.add('show');
}

function openAiChat() {
  document.getElementById('aiModal').classList.add('open');
  const chatBody = document.getElementById('chatBody');
  if (chatBody.children.length === 0) {
    addMessage("Namaste! Main aapka AI Health Assistant hoon. Apni symptoms batao, main sahi specialist suggest karunga.", 'ai');
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

const SYMPTOM_RULES = [
  { keywords: ['seene', 'chest', 'dil', 'heart', 'dhadkan', 'bp'], specialist: 'Cardiologist', reply: 'Aapke symptoms heart se related lag rahe hain. Cardiologist se milna best rahega.' },
  { keywords: ['sar', 'sir', 'headache', 'chakkar', 'dizziness'], specialist: 'Neurologist', reply: 'Ye neurological symptoms hain. Neurologist se milna theek rahega.' },
  { keywords: ['skin', 'twacha', 'rash', 'khujli', 'itching'], specialist: 'Dermatologist', reply: 'Ye skin ki problem lag rahi hai. Dermatologist se consult karo.' },
  { keywords: ['bachcha', 'child', 'baby', 'bachi'], specialist: 'Pediatrician', reply: 'Bachche ki health ke liye Pediatrician sahi hai.' },
  { keywords: ['haddi', 'bone', 'joint', 'ghutna', 'kamar', 'dard'], specialist: 'Orthopedic', reply: 'Ye haddiyo ya joints se related hai. Orthopedic se milna best rahega.' },
  { keywords: ['mahila', 'period', 'pregnancy', 'garbh'], specialist: 'Gynecologist', reply: 'Ye mahila health se related hai. Gynecologist se milna chahiye.' },
  { keywords: ['tension', 'anxiety', 'stress', 'neend'], specialist: 'Psychiatrist', reply: 'Mental health se related hai. Psychiatrist se milna faydemand rahega.' },
  { keywords: ['bukhar', 'fever', 'cold', 'khansi'], specialist: 'General Physician', reply: 'Ye aam symptoms hain. General Physician se milna theek rahega.' }
];

function analyzeSymptoms(text) {
  const lower = text.toLowerCase();
  let bestMatch = null;
  let maxScore = 0;
  for (const rule of SYMPTOM_RULES) {
    const score = rule.keywords.filter(kw => lower.includes(kw)).length;
    if (score > maxScore) { maxScore = score; bestMatch = rule; }
  }
  if (!bestMatch) return { reply: 'Thoda aur detail batao apni symptoms ke baare mein.', specialist: null };
  return bestMatch;
}

function sendAiMessage() {
  const input = document.getElementById('aiInput');
  const text = input.value.trim();
  if (!text) return;
  addMessage(text, 'user');
  input.value = '';
  setTimeout(() => {
    const { reply } = analyzeSymptoms(text);
    addMessage(reply, 'ai');
  }, 600);
}

document.addEventListener('DOMContentLoaded', () => {
  fetchDoctors();
  const aiInput = document.getElementById('aiInput');
  if (aiInput) {
    aiInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendAiMessage(); });
  }
});
