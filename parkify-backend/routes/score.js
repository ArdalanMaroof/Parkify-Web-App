const express = require("express");
const router = express.Router();
const Score = require("../models/Score");

//  GET /top - Return top 10 users by total score
router.get("/top", async (req, res) => {
    try {
        //For debugging
        console.log("📤 Fetching top scores...");
        const topScores = await Score.aggregate([
            {
                $group: {
                    _id: { email: "$email", username: "$username" },
                    totalScore: { $sum: "$score" }
                }
            },
            { $sort: { totalScore: -1 } },
            { $limit: 10 }
        ]);

        console.log("✅ Top scores calculated:", topScores);

        res.json(topScores.map(user => ({
            _id: user._id.email,
            username: user._id.username,
            score: user.totalScore
        })));
    } catch (err) {
        res.status(500).json({ error: "Error fetching top scores" });
    }
});

//to record each point-earning action
router.post("/add", async (req, res) => {
    const { email, username, score, action } = req.body;

    //For debugging
    console.log("📥 Incoming score submission:");
    console.log("Email:", email);
    console.log("Username:", username);
    console.log("Score:", score);
    console.log("Action:", action);

    try {
        const newScore = new Score({ email, username, score, action });
        await newScore.save();
        console.log("✅ Score saved successfully to MongoDB");
        res.status(201).json({ message: "Score saved successfully" });
    } catch (err) {
        console.error("❌ Error saving score:", err);
        res.status(500).json({ error: "Error saving score" });
    }
});


// In routes/score.js - add a new route
router.get("/user/:email", async (req, res) => {
  try {
    const userScores = await Score.aggregate([
      { $match: { email: req.params.email } },
      { $group: { _id: "$email", totalScore: { $sum: "$score" } } }
    ]);

    if (userScores.length === 0) {
      return res.json({ totalScore: 0 });
    }

    res.json(userScores[0]);
  } catch (err) {
    res.status(500).json({ error: "Error fetching user scores" });
  }
});

module.exports = router;
