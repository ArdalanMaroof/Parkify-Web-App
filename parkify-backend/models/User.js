const mongoose = require('mongoose');
//const { authConnection } = require('../db');

const userSchema = new mongoose.Schema({
  //username: { type: String, required: true },
  email: {type: String, required: true, unique: true, lowercase: true }, 
  password: {type: String, required: true},
  name: {type: String, required: true },
  isFirstLogin: { type: Boolean, default: true },
  phoneNumber: String,
  vehicleNumber: String,
  score: { type: Number, default: 0 }, // Use totalScore instead of score
  //balance: { type: Number, default: 0 }, // Use totalBalance instead of balance
}, { timestamps: true});

//const User = authConnection.model("User", UserSchema);
module.exports = mongoose.model('User', userSchema);
