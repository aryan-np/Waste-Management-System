const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");


require('dotenv').config();
const User = require('../Model/User');
const Otp = require('../Model/otp')

const{sendMail,validateEmail,generateOtpMail} = require("./mail")
const VehicleRoute = require("../Model/vehicle"); // VehicleRoute model


const JWT_SECRET = process.env.JWT_SECRET;

const handleLogin = async (req, res) => {
    try {
        console.log("Incoming login request:", req.body);

        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Both email and password are required" });
        }

        // Check if the user exists
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(400).json({ message: "User not found" });
        }

        // Compare the entered password with the stored hashed password
        const isMatch = await bcrypt.compare(password, existingUser.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate JWT Token
        const token = jwt.sign(
            { userId: existingUser._id, email: existingUser.email }, // Payload
            JWT_SECRET, // Secret key
            { expiresIn: "1h" } // Token expires in 1 hour
        );
        res.setHeader("Authorization", `Bearer ${token}`);

        console.log("Login successful, token generated");
        res.status(200).json({ message: "Login successful", token });

    } catch (err) {
        console.error("Error in login:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};


// Step 1: Handle Signup - Send OTP
const handleSignup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Validate email
        const emailCheck = await validateEmail(email);
        if (!emailCheck.valid) {
            return res.status(400).json({ message: emailCheck.reason });
        }

        // Invalidate previous OTPs
        await Otp.updateMany({ email }, { valid: false });

        // Generate new OTP and send email
        const { otp, otpMail } = generateOtpMail();
        await sendMail(email, "Signup Verification OTP", otpMail);

        // Save OTP in DB
        const newOtp = new Otp({ email, otp, valid: true });
        await newOtp.save();

        res.status(200).json({ status: true, message: "OTP sent to email for verification" });

    } catch (error) {
        console.error("Error in signup:", error);
        res.status(500).json({ status: false, message: "Server error" });
    }
};

// Step 2: Handle Signup OTP Verification & User Registration
const handleSignupOtp = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ status: true, message: "User registered successfully" });

    } catch (error) {
        console.error("Error in OTP verification/signup:", error);
        res.status(500).json({ status: false, message: "Server error" });
    }
};


// Endpoint to handle route selection by email and route name
const handleRouteSelection = async (req, res) => {
    const { email, routeName } = req.body;  // Get email and routeName from request body

    try {
        // Find the user by email
        const user = await User.findOne({ email });

        // If user not found
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Find the route by route name
        const route = await VehicleRoute.findOne({ routeName });

        // If route not found
        if (!route) {
            return res.status(404).json({ message: "Route not found" });
        }

        // Update the user with the selected route
        user.selectedRoute = route._id; // Store the route ID in the user document
        await user.save();

        res.status(200).json({ message: "Route selected successfully", user });
    } catch (error) {
        console.error("Error selecting route:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};



module.exports = { handleLogin, handleSignup,handleSignupOtp,handleRouteSelection };
