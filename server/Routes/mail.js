const express = require("express");
const {handleForgotPassword}= require("../Controller/mail")

const router = express.Router();

router.post('/forgotPassword',handleForgotPassword);


module.exports = router;