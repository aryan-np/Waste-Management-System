const User = require('../Model/User');
const bcrypt = require("bcrypt");

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


const handleSignup = async (req, res) => {
    try {
        console.log("Incoming request:", req.body); // Log request body

        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if the user already exists
        let existingUser = await User.findOne({ email });
        console.log("Existing user check:", existingUser); // Debug existing user

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash the password before saving
        const salt = await bcrypt.genSalt(10); // Generate salt for bcrypt hashing
        const hashedPassword = await bcrypt.hash(password, salt); // Hash the password with the salt

        // Create a new user with hashed password
        const newUser = new User({
            name,
            email,
            password: hashedPassword // Store the hashed password
        });

        // Save the new user to the database
        await newUser.save();
        console.log("User created successfully");
        res.status(201).json({ message: "User created successfully" });

    } catch (err) {
        console.error("Error in signup:", err); // Log detailed error
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

module.exports = { handleLogin, handleSignup };
