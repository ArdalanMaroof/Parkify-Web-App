const express = require('express');
const router = express.Router();
const Score = require('../models/Score');
const User = require('../models/User');

router.get('/top', async (req, res) => {
  try {
    console.log('📤 Fetching top scores...');
    const topScores = await Score.aggregate([
      {
        $group: {
          _id: { email: '$email', username: '$username' },
          totalScore: { $sum: '$score' },
        },
      },
      { $sort: { totalScore: -1 } },
      { $limit: 10 },
    ]);

    console.log('✅ Top scores calculated:', topScores);
    res.json(
      topScores.map((user) => ({
        _id: user._id.email,
        username: user._id.username,
        score: user.totalScore,
      }))
    );
  } catch (err) {
    console.error('❌ Error fetching top scores:', err);
    res.status(500).json({ error: 'Error fetching top scores' });
  }
});

router.post('/add', async (req, res) => {
  const { email, username, score, action } = req.body;

  console.log('📥 Incoming score submission:', { email, username, score, action });

  try {
    if (!email || !score || !action) {
      return res.status(400).json({ error: 'Email, score, and action are required' });
    }

    const newScore = new Score({ email, username, score, action });
    await newScore.save();

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.totalScore = (user.totalScore || 0) + score;
    user.totalBalance = user.totalScore * 0.01;
    const savedUser = await user.save();
    console.log('✅ User updated with new score:', {
      email: savedUser.email,
      totalScore: savedUser.totalScore,
      totalBalance: savedUser.totalBalance,
    });

    res.status(201).json({
      message: 'Score saved successfully',
      data: {
        email: savedUser.email,
        totalScore: savedUser.totalScore,
        totalBalance: savedUser.totalBalance,
      },
    });
  } catch (err) {
    console.error('❌ Error saving score or updating user:', {
      message: err.message,
      stack: err.stack,
      code: err.code,
    });
    res.status(500).json({ error: 'Error saving score', message: err.message });
  }
});

router.get('/user/:email', async (req, res) => {
  const email = req.params.email.toLowerCase();

  try {
    const user = await User.findOne({ email }).select('email username totalScore totalBalance');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('✅ User data fetched:', {
      email: user.email,
      username: user.username,
      totalScore: user.totalScore,
      totalBalance: user.totalBalance,
    });

    res.json({
      email: user.email,
      username: user.username,
      totalScore: user.totalScore || 0,
      totalBalance: user.totalBalance || 0,
    });
  } catch (err) {
    console.error('❌ Error fetching user score:', {
      message: err.message,
      stack: err.stack,
      code: err.code,
    });
    res.status(500).json({ error: 'Error fetching user score', message: err.message });
  }
});

module.exports = router;