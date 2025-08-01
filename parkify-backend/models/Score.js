const mongoose = require('mongoose');
//const { authConnection } = require('../db');

const ScoreSchema = new mongoose.Schema({
    email: String,       // To identify user
    username: String,    // Display name
    score: Number,
    action: String,      // "spot_available", "marked_full", "parking_confirmed"
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

//const Score = authConnection.model('Score', ScoreSchema);
module.exports = mongoose.model('Score', ScoreSchema);
