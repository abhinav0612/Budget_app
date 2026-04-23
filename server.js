require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const User = require('./models/User');
const Transaction = require('./models/Transaction');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection (FIXED)
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB Connection Error:', err));

// Test Route
app.get('/', (req, res) => {
  res.send('API is running');
});


// ================= ROUTES ================= //

// 1. Register
app.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = new User({ name, email, password });
    await newUser.save();

    res.status(201).json({
      message: 'User registered successfully',
      userId: newUser._id
    });

  } catch (err) {
    res.status(500).json({ message: 'Error registering user', error: err.message });
  }
});


// 2. Login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    res.json({
      message: 'Login successful',
      userId: user._id,
      name: user.name
    });

  } catch (err) {
    res.status(500).json({ message: 'Error logging in', error: err.message });
  }
});


// 3. Add Transaction
app.post('/add-transaction', async (req, res) => {
  try {
    const { userId, type, amount, date } = req.body;

    const transaction = new Transaction({
      userId,
      type,
      amount,
      date: date ? new Date(date) : new Date()
    });

    await transaction.save();

    res.status(201).json({
      message: 'Transaction added successfully',
      transaction
    });

  } catch (err) {
    res.status(500).json({ message: 'Error adding transaction', error: err.message });
  }
});


// 4. Get Transactions
app.get('/transactions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const transactions = await Transaction.find({ userId }).sort({ date: -1 });

    res.json(transactions);

  } catch (err) {
    res.status(500).json({ message: 'Error fetching transactions', error: err.message });
  }
});


// Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));