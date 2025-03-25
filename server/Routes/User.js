const express = require("express");

const {handleLogin,handleSignup,handleSignupOtp,handleRouteSelection}= require("../Controller/user")
const {handleForgotPassword,handleResetPassword}= require("../Controller/mail")
const {isAuthenticated}=require('../Middleware/auth')
const validateOtpMiddleware = require("../Middleware/validateOtp")

const router = express.Router();

router.post("/signup",handleSignup);
router.post("/login",handleLogin);
router.post("/select-route",isAuthenticated, handleRouteSelection);

router.post('/forgotPassword',handleForgotPassword);

router.post('/validateSignupOtp',validateOtpMiddleware,handleSignupOtp);
router.post("/resetPassword", validateOtpMiddleware, handleResetPassword);

module.exports = router;