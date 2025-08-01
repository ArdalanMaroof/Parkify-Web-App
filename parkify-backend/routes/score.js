const express = require("express");
const router = express.Router();
const Score = require("../models/Score");
const User = require('../models/User');

//  GET /top - Return top 10 users by total score
router.get("/top", async (req, res) => {
    try {
        //For debugging
        console.log("📤 Fetching top scores...");
        const topUsers = await User.find({})
      .select('email name score')
      .sort({ score: -1 })
      .limit(10)
      .lean();

        console.log("✅ Top scores calculated:", topUsers);

        res.json(
            topUsers.map(user => ({
            _id: user.email,
            username: user.name,
            score: user.score || 0,
        })));
    } catch (err) {
        console.error('❌ Error fetching top scores:', err);
        res.status(500).json({ error: "Error fetching top scores" });
    }
});

//to record each point-earning action
router.post("/add", async (req, res) => {
    const { email, score, action } = req.body;

    //For debugging
    console.log('📥 Incoming score submission:', { email, score, action });

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

    user.score = (user.score || 0) + score;
    user.balance = user.score * 0.01;
    const savedUser = await user.save();
    console.log('✅ User updated with new score:', {
      email: savedUser.email,
      score: savedUser.score,
      balance: savedUser.balance,
    });

    res.status(201).json({
      message: 'Score saved successfully',
      data: {
        email: savedUser.email,
        score: savedUser.score,
        balance: savedUser.balance,
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
// GET /user/:email - Return total score for a specific user
router.get("/user/:email", async (req, res) => {
    const email = req.params.email.toLowerCase();

    try {
        const user = await User.findOne({ email }).select('email username totalScore totalBalance');
    console.log(user, 'user')

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('✅ User data fetched:', {
      email: user.email,
      username: user.username,
      score: user.score,
      balance: user.balance,
    });

    res.json({
      email: user.email,
      username: user.username,
      score: user.score || 0,
      balance: user.balance || 0,
    });

       
    } catch (err) {
        console.error('❌ Error fetching user score:', {
      message: err.message,
      stack: err.stack,
      code: err.code,
    });


        res.status(500).json({ error: 'Error fetching user score', message: err.message});
    }
});

module.exports = router;
