const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

//  Import models and routes
const FreeParking = require("./models/FreeParking");
const authRoutes = require("./routes/auth");
const scoreRoutes = require("./routes/score");
const confirmedParkingRoutes = require('./routes/confirmedParkingRoutes');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const checkoutRoutes = require("./routes/checkoutSession");


app.use(express.json());

//  Use routes
app.use("/api/auth", authRoutes);
app.use("/api/score", scoreRoutes);
app.use('/api/confirmed-parking', confirmedParkingRoutes);
app.use("/api", checkoutRoutes);

console.log("scoreRoutes =", scoreRoutes);
console.log("typeof scoreRoutes =", typeof scoreRoutes);
console.log(" ConfirmedParking route mounted at /api/confirmed-parking");



// GET all parking spots
app.get("/api/free-parking", async (req, res) => {
  try {
    const spots = await FreeParking.find({}).lean();

    // Remove duplicates server-side (as a safeguard)
    const uniqueSpots = Array.from(
      new Map(spots.map((spot) => [spot._id.toString(), spot])).values()
    );
    console.log('Returning unique spots:', uniqueSpots.length);
    res.json(uniqueSpots);
  } catch (err) {
    console.error('Error fetching free parking spots:', err);
    res.status(500).json({ error: "Server error" });
  }
});

//  PUT to update hasSpots and availableSpots
app.put("/api/free-parking/:id", async (req, res) => {
  try {
    const updated = await FreeParking.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          hasSpots: req.body.hasSpots,
          availableSpots: req.body.availableSpots,
        }
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Spot not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("PUT error:", err);
    res.status(500).json({ error: "Failed to update parking spot" });
  }
});
app.use((req, res, next) => {
  console.warn(` Unknown route hit: ${req.method} ${req.originalUrl}`);
  res.status(404).send('Not Found');
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
