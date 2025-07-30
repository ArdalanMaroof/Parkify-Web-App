const mongoose = require('mongoose');

const confirmedParkingSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  spotId: String,
  spotName: String,
  address: String,
  latitude: Number,
  longitude: Number,
  duration: { type: Number, default: 3600 },
  confirmedAt: { type: Date, default: Date.now },
  endsAt: Date,
  isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model('ConfirmedParking', confirmedParkingSchema);