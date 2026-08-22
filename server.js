
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const JWT_SECRET = process.env.JWT_SECRET || 'medicare_secret_key';

// Schemas
const doctorSchema = new mongoose.Schema({
  name: String,
  specialization: String,
  experience: String,
  fee: String,
  rating: Number,
  avail: String,
  initials: String,
  color: String,
  textColor: String,
  badges: [String]
});
const Doctor = mongoose.model('Doctor', doctorSchema);

const bookingSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.Mixed },
  patientName: String,
  phone: String,
  age: String,
  date: String,
  slot: String,
  reason: String,
  createdAt: { type: Date, default: Date.now }
});
const Booking = mongoose.model('Booking', bookingSchema);

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

// Doctors
app.get('/api/doctors', async (req, res) => {
  let doctors = await Doctor.find();
  if (doctors.length === 0) {
    await Doctor.insertMany([
      { name: "Dr. Priya Sharma", specialization: "Cardiologist", experience: "12 yrs", fee: "₹800", rating: 4.9, avail: "Today", initials: "PS", color: "#E1F5EE", textColor: "#0F6E56", badges: ["MBBS, MD", "Apollo Hospital", "Available Today"] },
      { name: "Dr. Rahul Mehta", specialization: "Neurologist", experience: "9 yrs", fee: "₹900", rating: 4.7, avail: "Tomorrow", initials: "RM", color: "#E6F1FB", textColor: "#185FA5", badges: ["MBBS, DM", "AIIMS Delhi", "Available Tomorrow"] },
      { name: "Dr. Anjali Singh", specialization: "Pediatrician", experience: "7 yrs", fee: "₹600", rating: 4.8, avail: "Today", initials: "AS", color: "#FAEEDA", textColor: "#854F0B", badges: ["MBBS, DCH", "Fortis Hospital", "Available Today"] },
      { name: "Dr. Vikram Patel", specialization: "Orthopedic", experience: "15 yrs", fee: "₹1000", rating: 4.6, avail: "This Week", initials: "VP", color: "#FAECE7", textColor: "#993C1D", badges: ["MBBS, MS", "Max Hospital", "This Week"] },
      { name: "Dr. Neha Gupta", specialization: "Dermatologist", experience: "6 yrs", fee: "₹700", rating: 4.9, avail: "Today", initials: "NG", color: "#E1F5EE", textColor: "#0F6E56", badges: ["MBBS, MD", "Medanta", "Available Today"] },
      { name: "Dr. Arjun Das", specialization: "General Physician", experience: "10 yrs", fee: "₹500", rating: 4.5, avail: "Today", initials: "AD", color: "#E6F1FB", textColor: "#185FA5", badges: ["MBBS", "City Hospital", "Available Today"] },
      { name: "Dr. Meera Iyer", specialization: "Gynecologist", experience: "11 yrs", fee: "₹850", rating: 4.8, avail: "Tomorrow", initials: "MI", color: "#EAF3DE", textColor: "#3B6D11", badges: ["MBBS, MS", "Apollo Hospital", "Available Tomorrow"] },
      { name: "Dr. Sameer Bose", specialization: "Psychiatrist", experience: "8 yrs", fee: "₹950", rating: 4.7, avail: "This Week", initials: "SB", color: "#EEEDFE", textColor: "#534AB7", badges: ["MBBS, MD", "NIMHANS", "This Week"] }
    ]);
  }
  res.json(await Doctor.find());
});

// Bookings
app.post('/api/bookings', async (req, res) => {
  const { doctorId, patientName, phone, age, date, slot, reason } = req.body;
  if (!patientName || !phone || !date || !slot) {
    return res.status(400).json({ error: 'Saari details bharo!' });
  }
  const booking = new Booking({ doctorId, patientName, phone, age, date, slot, reason });
  await booking.save();
  res.status(201).json(booking);
});

app.get('/api/bookings', async (req, res) => {
  res.json(await Booking.find());
});

// Auth
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Saari fields bharo!' });
  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ error: 'Ye email pehle se registered hai.' });
  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ name, email, password: hashed });
  await user.save();
  const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ token, user: { name: user.name, email: user.email } });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return res.status(401).json({ error: 'Email registered nahi hai.' });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: 'Galat password.' });
  const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { name: user.name, email: user.email } });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("MongoDB connection error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
