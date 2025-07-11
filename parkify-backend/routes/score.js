const express = require("express");
const router = express.Router();
const Score = require("../models/Score");

router.get("/top", async (req, res) => {
    try {
        const topScores = await Score.find().sort({ score: -1 }).limit(10);
        res.json(topScores);
    } catch (err) {
        res.status(500).json({ error: "Error fetching scores" });
    }
});

// POST /api/score/update - Increment score for a user
router.post("/update", async (req, res) => {
    const { username, points } = req.body;

    if (!username || typeof points !== "number") {
        return res.status(400).json({ error: "Username and points are required" });
    }

    try {
        const updatedScore = await Score.findOneAndUpdate(
            { username },
            { $inc: { score: points } },
            { new: true, upsert: true }
        );
        res.json({ message: "Score updated", data: updatedScore });
    } catch (err) {
        console.error("Error updating score:", err);
        res.status(500).json({ error: "Failed to update score" });
    }
});


module.exports = router;
