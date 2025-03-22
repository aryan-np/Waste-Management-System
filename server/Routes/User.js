const express = require("express");
const {handleLogin,handleSignup,handleSignupOtp}= require("../Controller/user")

const {handleForgotPassword,handleResetPassword}= require("../Controller/mail")
const validateOtpMiddleware = require("../Middleware/validateOtp")

const router = express.Router();

router.post("/signup",handleSignup);
router.post("/login",handleLogin);
// router.post("/validateSignup",handleSignupValidation)
router.post('/forgotPassword',handleForgotPassword);
// router.post('/validateForgotPasswordOtp',handleForgotPasswordOtp);
router.post("/resetPassword", validateOtpMiddleware, handleResetPassword);
// router.post('/validateSignupOtp',handleSignupOtp);

module.exports = router;