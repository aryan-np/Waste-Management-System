const express = require("express");
const {
  validateAdminLogin,
  handleAddUser,
  handleModifyUser,
  handleDeleteUser,
  getAllUsers,
  searchUser,
  handleAddRoute,
  handleModifyRoute,
  handleDeleteRoute,
  getAllRoutes,
  searchRoute
} = require("../Controller/admin.js");

const { isAuthenticated } = require("../Middleware/auth.js");

const router = express.Router();

// -------------------- Admin Authentication --------------------
router.get("/validateAdmin", isAuthenticated, validateAdminLogin);

// -------------------- User Routes --------------------
router.post("/addUser", isAuthenticated, handleAddUser);
router.post("/modifyUser", isAuthenticated, handleModifyUser);
router.post("/deleteUser", isAuthenticated, handleDeleteUser);
router.get("/getAllUsers", isAuthenticated, getAllUsers);
router.post("/searchUser", isAuthenticated, searchUser);

// -------------------- Route Management --------------------
router.post("/addRoute", isAuthenticated, handleAddRoute);
router.post("/modifyRoute", isAuthenticated, handleModifyRoute);
router.post("/deleteRoute", isAuthenticated, handleDeleteRoute);
router.get("/getAllRoutes", isAuthenticated, getAllRoutes);
router.post("/searchRoute", isAuthenticated, searchRoute);

module.exports = router;
