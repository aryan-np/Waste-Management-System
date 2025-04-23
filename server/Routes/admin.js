const express = require("express");
const {
  validateAdminLogin,
  handleModifyUser,
  handleModifyRoute,
  getAllUsers,
  getAllRoutes,
  searchUser
} = require("../Controller/admin.js");

const { isAuthenticated } = require("../Middleware/auth.js");

const router = express.Router();

// Admin Authentication
router.get("/validateAdmin", isAuthenticated, validateAdminLogin);

// Modify user or route
router.post("/modifyUser", isAuthenticated, handleModifyUser);
router.post("/modifyRoute", isAuthenticated, handleModifyRoute);

// Get all users or routes
router.get("/getAllUsers", isAuthenticated, getAllUsers);
router.get("/getAllRoutes", isAuthenticated, getAllRoutes);

// Search user by name
router.get("/searchUser", isAuthenticated, searchUser);

module.exports = router;
