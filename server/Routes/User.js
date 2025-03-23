const express = require("express");
const {handleLogin,handleSignup,handleSignupOtp}= require("../Controller/user")

const {handleForgotPassword,handleResetPassword}= require("../Controller/mail")
const validateOtpMiddleware = require("../Middleware/validateOtp")

const router = express.Router();

router.post("/signup",handleSignup);
router.post("/login",handleLogin);

router.post('/forgotPassword',handleForgotPassword);

router.post('/validateSignupOtp',validateOtpMiddleware,handleSignupOtp);
router.post("/resetPassword", validateOtpMiddleware, handleResetPassword);

module.exports = router;