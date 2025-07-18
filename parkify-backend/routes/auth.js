const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/**
 * @route   POST /api/auth/signup
 * @desc    Create a new user account
 * @access  Public
 */
router.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;
    console.log("📨 Signup request body:", req.body);

    // Validate required fields
    if (!name || !email || !password) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {

      // Check if email already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
    }
        // Hash password before storing
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user document
        const newUser = new User({
            username: name, //User name as a username
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            isFirstLogin: true,
            score: 0,
            balance: 0,

        });

        // Save user to the database
        const savedUser = await newUser.save();
        console.log("✅ User created:", savedUser);

        // Return response (excluding password)
        res.status(201).json({
            message: "User created successfully",
            data: {
                id: savedUser._id,
                username: savedUser.username,
                name: savedUser.name,
                email: savedUser.email,
            },
        });

    } catch (err) {
        // Handle database/server errors
        console.error("❌ Error saving user:", err);
        res.status(500).json({
            error: "Signup failed",
            message: err.message,
            stack: err.stack
        });
    }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return JWT
 * @access  Public
 */
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    // Check for required fields
    if (!email || !password) {
        return res.status(400).json({
            message: "Missing email or password"
        });
    }

    try {
        // Find user by email
        const foundUser = await User.findOne({ email: email.toLowerCase() });
        console.log("👉 Found user:", foundUser); // Debug log

        // If user not found
        if (!foundUser) {
            return res.status(404).json({
                message: "User doesn't exist"
            });
        }

        // Compare password with hashed password
        const matchPassword = await bcrypt.compare(password, foundUser.password);
        console.log("👉 Input password:", password);
        console.log("👉 Hashed in DB:", foundUser.password);

        if (!matchPassword) {
            return res.status(401).json({
                message: "User credentials incorrect"
            });
        }


        // Ensure isFirstLogin is explicitly set
        const isFirstLogin = foundUser.isFirstLogin !== undefined ? foundUser.
        isFirstLogin : true;
        console.log("👉 isFirstLogin for response:", isFirstLogin); // Debug: Log isFirstLogin value
        
        // Generate JWT token with 1-hour expiry
        const accessToken = jwt.sign(
            {
                username: foundUser.username,
                name: foundUser.name,
                email: foundUser.email,
                id: foundUser._id,
                isFirstLogin: isFirstLogin

            },
            process.env.SECRET_KEY,
            { expiresIn: "1h" }
        );

        // Log response for debugging
        console.log("👉 Login response:", {
            token: accessToken,
            data: {
                id: foundUser._id,
                username: foundUser.username,
                name: foundUser.name,
                email: foundUser.email,
                isFirstLogin: isFirstLogin
            },
            message: "User successfully logged in."
        });

        // Return token and user info
        return res.status(200).json({
            token: accessToken,
            data: {
                id: foundUser._id,
                username: foundUser.username,
                name: foundUser.name,
                email: foundUser.email,
                isFirstLogin: isFirstLogin
            },
            message: "User successfully logged in."
        });

    } catch (err) {
        // Handle login errors
         console.error("❌ Login error:", err);
        return res.status(500).json({
            message: "Login error",
            error: err.message
        });
    }
});


/**
 * @route   GET /api/auth/profile
 * @desc    Get user profile data
 * @access  Private
 */

// Route to get the user's profile data
router.get("/profile", async (req, res) => {

     // Extract token from the Authorization header
  const token = req.headers.authorization?.split(' ')[1];

  // If no token is provided, respond with 401 Unauthorized
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    // Verify the token using the secret key
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

     // Find the user in the database using the email from the decoded token
    // Exclude the password field from the returned user object
    const user = await User.findById(decoded.id).select('-password');

    console.log("👉 Profile fetched:", user); // Debug log

    // If user not found, respond with 404
    if (!user) return res.status(404).json({ message: "User not found" });

    // Return the user data
    res.status(200).json({
      message: "Profile fetched successfully",
      data: {
        username: user.username,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        vehicleNumber: user.vehicleNumber,
        isFirstLogin: user.isFirstLogin,
        score: user.score || 0,
        balance: user.balance || 0,
      },
    });
  } catch (err) {


    console.error("❌ Profile fetch error:", err);
    // If token verification fails or any other error occurs, respond with 500
    res.status(500).json({ message: "Invalid token", error: err.message });
  }
});


/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile data
 * @access  Private
 */

// Route to update the user's profile information
router.put("/profile", async (req, res) => {
    console.log(req.body, "Show Success ")
     // Extract the token from the Authorization header (format: "Bearer <token>")
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {

    // Verify and decode the JWT using the server's secret key
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    // Extract the new profile data from the request body
    const { name, email, phoneNumber, vehicleNumber } = req.body;

    // Find the user by the decoded email and update the profile fields
    const updatedUser = await User.findByIdAndUpdate(
        decoded.id ,
      { name, email: email.toLowerCase(), phoneNumber, vehicleNumber, isFirstLogin: false },
      { new: true, runValidators: true, select: '-password' }
    );


    console.log("👉 Updated user:", updatedUser); // Debug log
     // If no user is found with that email, return a not found error
    if (!updatedUser) return res.status(404).json({ message: "User not found" });
    
    // Send back a success message with the updated user data
    res.status(200).json({
      message: "Profile updated successfully",
      data: {
        username: updatedUser.username,
        name: updatedUser.name,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        vehicleNumber: updatedUser.vehicleNumber,
        isFirstLogin: updatedUser.isFirstLogin,
        score: updatedUser.score || 0,
        balance: updatedUser.balance || 0,
      },
    });
} catch (err) {

    console.error("❌ Profile update error:", err);

    // Catch any errors (e.g. invalid token, DB errors) and return a 500 error
    res.status(500).json({ message: "Error updating profile", error: err.message });
  }

});


/**
 * @route   POST /api/auth/cashout
 * @desc    Process user cash-out request
 * @access  Private
 */
router.post("/cashout", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { amount, paymentMethod, paymentDetails } = req.body;
    if (!amount || !paymentMethod || !paymentDetails) {
      return res.status(400).json({ message: "Amount, payment method, and details are required" });
    }

    const amountNum = parseFloat(amount);
    const pointsPerDollar = 100; // 100 points = $1
    const pointsRequired = amountNum * pointsPerDollar;

    // Get user's total points from Score collection
    const scores = await Score.aggregate([
      { $match: { email: user.email } },
      { $group: { _id: null, total: { $sum: "$score" } } }
    ]);

    const totalPoints = scores.length > 0 ? scores[0].total : 0;

    if (totalPoints < pointsRequired) {
      return res.status(400).json({ message: "Insufficient points for cash-out" });
    }

    if (amountNum < 1) {
      return res.status(400).json({ message: "Minimum cash-out amount is $1" });
    }

    // In a real app, you would:
    // 1. Deduct points from user's total
    // 2. Process payment to bank account
    // For simulation, we'll just return success

    res.status(200).json({
      message: "Cash-out request processed successfully",
      data: {
        pointsDeducted: pointsRequired,
        newPointsBalance: totalPoints - pointsRequired,
        amountTransferred: amountNum
      },
    });
  } catch (err) {
    console.error("❌ Cash-out error:", err);
    res.status(500).json({ message: "Cash-out failed", error: err.message });
  }
});



module.exports = router;
