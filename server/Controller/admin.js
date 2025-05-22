const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../Model/User');
const VehicleRoute = require('../Model/vehicle');

const {validateEmail}=require("../Controller/user")
const nodemailer = require('nodemailer');
// -------------------- User Handlers --------------------

// Add User
const handleAddUser = async (req, res) => {
  try {
    const { name, email, password, role = 'user',dueAmount } = req.body;

    if (!name || !email || !password) {
      return res.status(400).send('Name, email, and password are required');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).send('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      dueAmount
    });

    await newUser.save();
    res.status(201).send('User created successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Modify User
const handleModifyUser = async (req, res) => {
  try {
    const { userId, name, email,password, dueAmount } = req.body;
    console.log(userId);
    console.log(name);
    // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
    
    const user = await User.findById(userId);
    if (!user) return res.status(404).send('User not found');

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password=hashedPassword;
    if (dueAmount) user.dueAmount = dueAmount;

    await user.save();
    res.status(200).send('User updated successfully');
  } catch (error) {
    res.status(500).send('Server error');
  }
};

// Delete User
const handleDeleteUser = async (req, res) => {
  try {
    const { userId } = req.body;

    const result = await User.findByIdAndDelete(userId);
    if (!result) return res.status(404).send('User not found');

    res.status(200).send('User deleted successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Get All Users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Search User
const searchUser = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).send('Name query parameter is required');

    const users = await User.find({
      name: { $regex: name, $options: 'i' }
    }).select('-password');

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// -------------------- Route Handlers --------------------

// Add Route
const handleAddRoute = async (req, res) => {
  try {
    const { routeName, locations, schedule } = req.body;

    // Validate input
    if (!routeName || !Array.isArray(locations) || locations.length === 0) {
      return res.status(400).send('Route name and at least one location are required');
    }

    // Check for duplicate route name
    const existingRoute = await VehicleRoute.findOne({ routeName: routeName.trim() });
    if (existingRoute) {
      return res.status(409).send('A route with this name already exists');
    }

    // Save new route
    const newRoute = new VehicleRoute({
      routeName: routeName.trim(),
      locations,
      schedule
    });

    await newRoute.save();
    res.status(201).send('Route added successfully');
    
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};


// Modify Route
const handleModifyRoute = async (req, res) => {
  try {
    const { routeId, routeName, locations, schedule } = req.body;

    const route = await VehicleRoute.findById(routeId);
    if (!route) return res.status(404).send('Route not found');

    if (routeName) route.routeName = routeName;
    if (Array.isArray(locations)) route.locations = locations;
    if (Array.isArray(schedule)) route.schedule = schedule;

    await route.save();
    res.status(200).send('Route updated successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Delete Route
const handleDeleteRoute = async (req, res) => {
  try {
    const { routeId } = req.body;

    const result = await VehicleRoute.findByIdAndDelete(routeId);
    if (!result) return res.status(404).send('Route not found');

    res.status(200).send('Route deleted successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Get All Routes
const getAllRoutes = async (req, res) => {
  try {
    const routes = await VehicleRoute.find();
    res.status(200).json(routes);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Search Route
const searchRoute = async (req, res) => {
  try {
    const { location } = req.body;
    if (!location) return res.status(400).send('Location query parameter is required');

    const routes = await VehicleRoute.find({
      locations: { $regex: location, $options: 'i' }
    });

    if (routes.length === 0) return res.status(404).send('No routes found for the given location');

    res.status(200).json(routes);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// -------------------- Admin Login --------------------

const validateAdminLogin = async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const userNum = await User.countDocuments();
      const routeNum = await VehicleRoute.countDocuments();

      res.status(200).json({
        message: 'Admin Login',
        totalUsers: userNum,
        totalRoutes: routeNum
      });
    } else {
      res.status(403).send('Unauthorized access');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};
const otpStore = {}; 
const handleAdminSignup = async (req, res) => {
  console.log("handleAdminSignup");
  
  const { name, email, password, otp } = req.body;

  // Step 1: If no OTP provided, assume it's first step (Send OTP)
  if (!otp) {
    const { valid, reason } = await validateEmail(email);
    if (!valid) return res.status(400).json({ error: reason });

    const existingUser = await User.findOne({ email });

if (existingUser) {
  if (existingUser.role === 'user') {
    await User.deleteOne({ email }); // Delete the normal user to allow admin creation
  } else {
    return res.status(409).json({ error: "Admin already exists." });
  }
}
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(generatedOtp);
    
    otpStore[email] = { otp: generatedOtp, expires: Date.now() + 5 * 60 * 1000 }; // 5 min expiry

    // Send OTP (simplified)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"Waste Management" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is: ${generatedOtp}`
    });

    return res.status(200).json({ message: "OTP sent to email." });
  }

  // Step 2: If OTP is provided, verify and create admin
  const record = otpStore[email];
  if (!record || record.otp !== otp || Date.now() > record.expires) {
    return res.status(400).json({ error: "Invalid or expired OTP." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newAdmin = new User({
    name,
    email,
    password: hashedPassword,
    role:"admin"
  });

  await newAdmin.save();
  delete otpStore[email];

  res.status(201).json({ message: "Admin created successfully." });
};
// -------------------- Exports --------------------

module.exports = {
  // User
  handleAddUser,
  handleModifyUser,
  handleDeleteUser,
  getAllUsers,
  searchUser,

  // Routes
  handleAddRoute,
  handleModifyRoute,
  handleDeleteRoute,
  getAllRoutes,
  searchRoute,

  // Admin
  validateAdminLogin,
  handleAdminSignup
};
