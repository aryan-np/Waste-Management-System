const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");


require('dotenv').config();
const User = require('../Model/User');
const Otp = require('../Model/otp')
const vehicleRoutes = require('../Model/vehicle')

const{sendMail,validateEmail,generateOtpMail} = require("./mail")
const VehicleRoute = require("../Model/vehicle"); // VehicleRoute model
const { strict } = require("assert");


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

        const role = existingUser.role

        if (role==="user"){
        // Generate JWT Token
        const token = jwt.sign(
            { userId: existingUser._id, email: existingUser.email }, // Payload
            JWT_SECRET, // Secret key
            { expiresIn: "1h" } // Token expires in 1 hour
        );
        
        res.setHeader("Authorization",`Bearer ${token}`);
        res.cookie("Authorization", token, {
        httpOnly: true,
        strict:false,
        // domain: '127.0.0.1'
        path: '/', // This makes the cookie available to all paths
        maxAge: 3600000 // 1 hour
});
}else{

    const token = jwt.sign(
            { userId: existingUser._id, email: existingUser.email,role:"admin" }, // Payload
            JWT_SECRET, // Secret key
            { expiresIn: "1h" } // Token expires in 1 hour
        );
        
        res.setHeader("Authorization",`Bearer ${token}`);
       res.cookie("Authorization", token, {
    httpOnly: true,
    strict:false,
    // domain: '127.0.0.1', // Or '127.0.0.1' if that's what you're using
    path: '/', // This makes the cookie available to all paths
    maxAge: 3600000 // 1 hour
});
console.log("Logged in as Admin");

}
        console.log("Login successful, token generated");
        res.status(200).json({ message: "Login successful"});
        // res.redirect("localhost:5500/dashboard.html")
        

    } catch (err) {
        console.error("Error in login:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};


// Step 1: Handle Signup - Send OTP
const handleSignup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        console.log("Recieevd")
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

const handleGetSchedules = async (req,res)=>{
    const route = req.params.routeName;
    const routes =await vehicleRoutes.findOne({routeName:route})
    console.log(routes)
    // const schedules = routes.schedule;
    // console.log(schedules);
    res.status(200).json({"schedules":routes});  
    
}

const handleGetUserProfile = async (req,res)=>{
    console.log("CP1")
    try {
        // Get the token from cookies (named "Authorization")
        const token = req.cookies.Authorization;
        console.log("CP2 cookies")

        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No token found in cookies" });
        }

        // Verify and decode the JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Ensure JWT_SECRET is in .env
        const userId = decoded.userId; 

        // Find the user by ID
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Respond with user details
        res.status(200).json({
            "userName": user.name,
            "userEmail": user.email,
            "userRoute": await (VehicleRoute.findById(user.selectedRoute))
        });

    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}

const handleChangeRoute = async (req, res) => {
    try {
        const { email, newRouteName } = req.body;
        console.log("in change route function");
        
        console.log(newRouteName);
        // Find the new route by its name
        const newRoute = await vehicleRoutes.findOne({ routeName: newRouteName });
        console.log(newRoute);

        if (!newRoute) {
            return res.status(404).json({ message: "Route not found" });
        }

        // Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if user already has a route selected
        if (!user.selectedRoute) {
            // First time selecting a route
            user.selectedRoute = newRoute._id;
            await user.save();
            return res.status(200).json({ message: "Route selected for the first time", user });
        } else {
            // Route already selected, so we update (change)
            user.selectedRoute = newRoute._id;
            await user.save();
            return res.status(200).json({ message: "Route successfully updated", user });
        }
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


const handleGetAllRoutes=async (req,res)=>{
    res.json(await VehicleRoute.find())
}

const handleLogout = (req, res) => {
    res.clearCookie('Authorization', { path: '/', httpOnly: true, sameSite: 'Lax' });
    res.status(200).json({ message: 'Logged out successfully' });
};

module.exports = { handleLogin, handleSignup,handleSignupOtp,handleRouteSelection,handleGetSchedules,handleGetUserProfile,handleChangeRoute,handleGetAllRoutes,handleLogout};
