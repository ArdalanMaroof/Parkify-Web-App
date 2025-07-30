const mongoose = require('mongoose');

const ScoreSchema = new mongoose.Schema({
  email: String,
  username: String,
  score: Number,
  action: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Score', ScoreSchema);