const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../Model/User');
const VehicleRoute = require('../Model/vehicle');

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
    const { userId, name, email, dueAmount } = req.body;
    console.log(userId);
    console.log(name);
    
    
    const user = await User.findById(userId);
    if (!user) return res.status(404).send('User not found');

    if (name) user.name = name;
    if (email) user.email = email;
    if (dueAmount !== undefined) user.dueAmount = dueAmount;

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

    if (!routeName || !Array.isArray(locations) || locations.length === 0) {
      return res.status(400).send('Route name and at least one location are required');
    }

    const newRoute = new VehicleRoute({
      routeName,
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
  validateAdminLogin
};
