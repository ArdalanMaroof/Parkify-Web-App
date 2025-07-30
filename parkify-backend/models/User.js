const mongoose = require('mongoose');
const { authConnection } = require('../db');

const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  name: String,
  phoneNumber: String,
  vehicleNumber: String,
  isFirstLogin: { type: Boolean, default: true },


  // other fields
});

const User = authConnection.model("User", UserSchema);
module.exports = User;
