const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    isFirstLogin: { type: Boolean, default: true },
    phoneNumber: String,
    vehicleNumber: String,
    totalScore: { type: Number, default: 0 }, // Use totalScore instead of score
    totalBalance: { type: Number, default: 0 }, // Use totalBalance instead of balance
    isFirstLogin: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
