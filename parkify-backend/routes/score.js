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

// GET /user/:email - Return total score for a specific user
router.get("/user/:email", async (req, res) => {
    const email = req.params.email;

    try {
        const scores = await Score.find({ email });

        if (scores.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
        const username = scores[0].username;

        res.json({ email, username, score: totalScore });
    } catch (err) {
        console.error("❌ Error fetching user score:", err);
        res.status(500).json({ error: "Error fetching user score" });
    }
});


module.exports = router;
