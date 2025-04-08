const express = require("express");

const {handleLogin,handleSignup,handleSignupOtp,handleRouteSelection,handleGetSchedules,handleGetUserProfile,handleChangeRoute,handleGetAllRoutes,handleLogout}= require("../Controller/user")
const {handleForgotPassword,handleResetPassword,handleGetCollectionNotification}= require("../Controller/mail")
const {isAuthenticated}=require('../Middleware/auth')
const validateOtpMiddleware = require("../Middleware/validateOtp")

const router = express.Router();

router.post("/signup",handleSignup);
router.post("/login",handleLogin);
router.post("/select-route",isAuthenticated, handleRouteSelection);

router.post('/forgotPassword',handleForgotPassword);

router.post('/validateSignupOtp',validateOtpMiddleware,handleSignupOtp);
router.post("/resetPassword", validateOtpMiddleware, handleResetPassword);

router.get('/schedules/:routeName',handleGetSchedules);
router.get('/profile',isAuthenticated,handleGetUserProfile);
router.get('/getAllRoutes',handleGetAllRoutes)
router.post('/changeRoute',handleChangeRoute);

router.get('/getCollectionNotification/:routeName',handleGetCollectionNotification)
router.post('/logout', handleLogout);

module.exports = router;