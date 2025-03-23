const bcrypt = require("bcrypt");
const crypto = require("crypto");

const User = require('../Model/User');
const Otp = require('../Model/otp')

const{sendMail,validateEmail,generateOtpMail} = require("./mail")


const handleLogin = async (req, res) => {
    try {
        console.log("Incoming login request:", req.body); // Log request body

        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Both email and password are required" });
        }

        // Check if the user exists
        const existingUser = await User.findOne({ email });
        console.log("Existing user check:", existingUser); // Debug existing user

        if (!existingUser) {
            return res.status(400).json({ message: "User not found" });
        }

        // Compare the entered password with the stored hashed password
        const isMatch = await bcrypt.compare(password, existingUser.password);
        
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        console.log("Login successful");
        res.status(200).json({ message: "Login successful" });

    } catch (err) {
        console.error("Error in login:", err); // Log detailed error
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


module.exports = { handleLogin, handleSignup,handleSignupOtp };
