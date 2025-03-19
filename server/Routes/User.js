const express = require("express");
const {handleLogin,handleSignup}= require("../Controller/user")
const router = express.Router();

router.post(("/signup"),handleSignup)
router.post(("/login"),handleLogin)

module.exports = router;