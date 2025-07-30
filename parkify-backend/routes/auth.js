const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  console.log('📨 Signup request body:', req.body);

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      isFirstLogin: true,
      totalScore: 0,
      totalBalance: 0,
    });

    const savedUser = await newUser.save();
    console.log('✅ User saved with initial values:', {
      _id: savedUser._id.toString(),
      email: savedUser.email,
      totalScore: savedUser.totalScore,
      totalBalance: savedUser.totalBalance,
    });

    res.status(201).json({
      message: 'User created successfully',
      data: {
        id: savedUser._id.toString(),
        name: savedUser.name,
        email: savedUser.email,
        totalScore: savedUser.totalScore,
        totalBalance: savedUser.totalBalance,
        createdAt: savedUser.createdAt,
      },
    });
  } catch (err) {
    console.error('❌ Error saving user:', {
      message: err.message,
      stack: err.stack,
      code: err.code,
    });
    res.status(500).json({
      error: 'Signup failed',
      message: err.message,
      stack: err.stack,
    });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Missing email or password' });
  }

  try {
    const foundUser = await User.findOne({ email: email.toLowerCase() });
    console.log('👉 Found user:', foundUser);

    if (!foundUser) {
      return res.status(404).json({ message: "User doesn't exist" });
    }

    const matchPassword = await bcrypt.compare(password, foundUser.password);
    if (!matchPassword) {
      return res.status(401).json({ message: 'User credentials incorrect' });
    }

    const isFirstLogin = foundUser.isFirstLogin !== undefined ? foundUser.isFirstLogin : true;

    const accessToken = jwt.sign(
      {
        name: foundUser.name,
        email: foundUser.email,
        id: foundUser._id.toString(),
        isFirstLogin: isFirstLogin,
      },
      process.env.SECRET_KEY,
      { expiresIn: '1h' }
    );

    console.log('👉 Login response:', {
      token: accessToken,
      data: {
        id: foundUser._id.toString(),
        name: foundUser.name,
        email: foundUser.email,
        isFirstLogin: isFirstLogin,
      },
      message: 'User successfully logged in.',
    });

    return res.status(200).json({
      token: accessToken,
      data: {
        id: foundUser._id.toString(),
        name: foundUser.name,
        email: foundUser.email,
        isFirstLogin: isFirstLogin,
      },
      message: 'User successfully logged in.',
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    return res.status(500).json({
      message: 'Login error',
      error: err.message,
    });
  }
});

router.get('/profile', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findOne({ email: decoded.email }).select('-password');
    console.log('👉 Profile fetched:', user);

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({
      ...user.toObject(),
      id: user._id.toString(),
      totalScore: user.totalScore,
      totalBalance: user.totalBalance,
    });
  } catch (err) {
    res.status(500).json({ message: 'Invalid token', error: err.message });
  }
});

router.put('/profile', async (req, res) => {
  console.log(req.body, 'Show Success ');
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const { name, phoneNumber, vehicleNumber } = req.body;

    const updatedUser = await User.findOneAndUpdate(
      { email: decoded.email },
      { name, phoneNumber, vehicleNumber, isFirstLogin: false },
      { new: true, runValidators: true, select: '-password' }
    );

    console.log('👉 Updated user:', updatedUser);
    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({
      message: 'Profile updated successfully',
      data: { ...updatedUser.toObject(), id: updatedUser._id.toString() },
    });
  } catch (err) {
    res.status(500).json({ message: 'Error updating profile', error: err.message });
  }
});

router.post('/cashout', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const { amount, paymentMethod, paymentDetails } = req.body;

    if (!amount || !paymentMethod || !paymentDetails) {
      return res.status(400).json({ message: 'Amount, payment method, and details are required' });
    }

    const amountNum = parseFloat(amount);
    const pointsPerDollar = 100;
    const pointsRequired = amountNum * pointsPerDollar;

    let user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.totalScore < pointsRequired) {
      return res.status(400).json({ message: 'Insufficient points for cash-out' });
    }

    if (amountNum < 10) {
      return res.status(400).json({ message: 'Minimum cash-out amount is $10' });
    }

    user.totalScore -= pointsRequired;
    user.totalBalance = user.totalScore * 0.01;
    await user.save();
    console.log('✅ User updated after cash-out:', {
      email: user.email,
      totalScore: user.totalScore,
      totalBalance: user.totalBalance,
    });

    res.status(200).json({
      message: 'Cash-out request processed successfully',
      data: {
        newPoints: user.totalScore,
        newBalance: user.totalBalance,
      },
    });
  } catch (err) {
    console.error('❌ Cash-out error:', {
      message: err.message,
      stack: err.stack,
      code: err.code,
    });
    res.status(500).json({ message: 'Cash-out failed', error: err.message });
  }
});

module.exports = router;