const express = require("express");

const {handleLogin,handleChangePassword,handleSignup,handleSignupOtp,handleRouteSelection,handleGetSchedules,handleGetUserProfile,handleChangeRoute,handleGetAllRoutes,handleLogout}= require("../Controller/user")
const {handleForgotPassword,handleResetPassword,handleGetCollectionNotification,verifyOtp}= require("../Controller/mail")
const {isAuthenticated}=require('../Middleware/auth')
const validateOtpMiddleware = require("../Middleware/validateOtp")
const ContactMessage = require('../Model/ContactMessage');
const router = express.Router();

router.post("/signup",handleSignup);
router.post("/login",handleLogin);
router.post("/select-route",isAuthenticated, handleRouteSelection);
router.post("/changePassword",isAuthenticated, handleChangePassword);

router.post('/forgotPassword',handleForgotPassword);

router.post('/validateSignupOtp',validateOtpMiddleware,handleSignupOtp);
router.post("/resetPassword", handleResetPassword);

router.get('/schedules/:routeName',handleGetSchedules);
router.get('/profile',isAuthenticated,handleGetUserProfile);
router.get('/getAllRoutes',handleGetAllRoutes)
router.post('/changeRoute',handleChangeRoute);

router.get('/getCollectionNotification/:routeName',handleGetCollectionNotification)
router.post('/logout', handleLogout);

router.post("/verifyOtp", verifyOtp);
router.post('/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
console.log("function called");

    // Basic validation
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Please provide name, email, and message.' });
    }

    // Save to database
    const newMessage = new ContactMessage({ name, email, message });
    await newMessage.save();
    console.log("saved message");
    

    return res.status(201).json({ message: 'Your message has been received. Thank you!' });
  } catch (error) {
    console.error('Failed to save contact message:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;