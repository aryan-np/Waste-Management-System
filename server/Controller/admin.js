const mongoose = require('mongoose');
const User = require('../Model/User');
const VehicleRoute = require('../Model/vehicle');

const handleModifyUser = async (req, res) => {
  try {
    const { userId, name, email, dueAmount } = req.body;

    const user = await User.findById(userId);
    console.log(user);

    if (!user) {
      return res.status(404).send('User not found');
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (dueAmount !== undefined) user.dueAmount = dueAmount;

    await user.save();
    res.status(200).send('User updated successfully');
  } catch (error) {
    res.status(500).send('Server error');
  }
};

const validateAdminLogin = async (req, res) => {
  try {
    console.log(req.user);
    if (req.user.role === 'admin') {
      res.send('Admin Login');
    } else {
      res.status(403).send('Unauthorized access');
    }
  } catch (error) {
    res.status(500).send('Server error');
  }
};

const handleModifyRoute = async (req, res) => {
  try {
    const { routeId, routeName, locations, schedule } = req.body;

    const route = await VehicleRoute.findById(routeId);
    if (!route) {
      return res.status(404).send('Route not found');
    }

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

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

const getAllRoutes = async (req, res) => {
  try {
    const routes = await VehicleRoute.find();
    res.status(200).json(routes);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

const searchUser = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) {
      return res.status(400).send('Name query parameter is required');
    }

    const users = await User.find({
      name: { $regex: name, $options: 'i' }
    }).select('-password');

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Search Route Handler
const searchRoute = async (req, res) => {
  try {
    const { location } = req.query; // Get the location query parameter

    // Check if location query parameter is provided
    if (!location) {
      return res.status(400).send('Location query parameter is required');
    }

    // Search for routes where any location matches the query location (case-insensitive)
    const routes = await VehicleRoute.find({
      locations: { $regex: location, $options: 'i' } // Using regex for case-insensitive matching
    });

    // If no routes found
    if (routes.length === 0) {
      return res.status(404).send('No routes found for the given location');
    }

    // Return the found routes
    res.status(200).json(routes);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

module.exports = {
  validateAdminLogin,
  handleModifyUser,
  handleModifyRoute,
  getAllUsers,
  getAllRoutes,
  searchUser,
  searchRoute
};
