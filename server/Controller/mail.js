const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require("bcrypt")
let mbv = require("mailboxvalidator-nodejs");
require('dotenv').config();

const User= require("../Model/User")
const Otp = require("../Model/otp")
const vehicleRoutes = require('../Model/vehicle')

// Send email function (only text)
const sendMail = async (to, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',  // You can change this to another email service
            auth: {
                user: process.env.EMAIL_USER,  // Your email
                pass: process.env.EMAIL_PASS   // Your app password
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,   // Sender's email address
            to: to,                         // Recipient's email address
            subject: subject,               // Subject line
            text: text                      // Plain text body
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response); // Log the success response
    } catch (err) {
        console.error('Error sending email: ', err); // Log error if any
    }
};


const validateEmail = async (email) => {
    
    // Step 1: Basic regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { valid: false, reason: "Invalid email format" };
    }

    // Step 2: API Validation
    mbv.MailboxValidator_init(process.env.EMAIL_VALIDATOR_API_KEY);

    try {
        const data = await mbv.MailboxValidator_single_query(email);
        console.log(email);
        // console.log(data);

        // Fix: Ensure ALL conditions are checked correctly
        if (
            data.is_smtp === true &&  // SMTP check
            data.is_verified === true && // Verified email
            data.is_domain === true && // Valid domain
            data.is_disposable !== true && // Not disposable
            data.is_high_risk !== true // Not high risk
        ) {
            return { valid: true, reason: "Email is valid" };
        }

        return { valid: false, reason: "Invalid or risky email" };
    } catch (error) {
        return { valid: false, reason: "API error: " + error.message };
    }
};

const handleForgotPassword = async (req, res) => {
    const { email } = req.body;
    const existingUser = await User.findOne({ email });
    console.log("Existing user check:", existingUser); // Debug existing user

    const verification = await validateEmail(email);
    console.log("HERE")

    try {
        // Invalidate all previous OTPs for the given email
        const updatedOtp = await Otp.updateMany({ email }, { valid: false });
        console.log("All previous OTPs invalidated");

        if (verification.valid) {
            if (existingUser) {
                console.log("DEBUG: Sending OTP email");

                const subject = "Request for PASSWORD RESET (DO NOT SHARE)";
                const { otp, otpMail } = generateOtpMail();
                await sendMail(email, subject, otpMail);

                const newOtp = new Otp({
                    email: email,
                    otp: otp,
                    valid: true,
                });

                await newOtp.save();
                res.status(200).json({
                    "status": true,
                    "msg": "Password reset email sent successfully",
                    "otp": otp
                });
            } else {
                res.status(404).json({
                    "status": false,
                    "msg": "USER NOT FOUND IN SYSTEM"
                });
            }
        } else {
            console.log("ERROR: Invalid email");
            res.status(400).json({
                "status": false,
                "msg": verification.reason
            });
        }
    } catch (error) {
        console.error("Error during OTP processing:", error);
        res.status(500).json({
            "status": false,
            "msg": "An error occurred while processing the OTP."
        });
    }
};




const generateOtpMail = ()=>{
    const otp = crypto.randomInt(100000,999999);
    const otpMail = `
            Dear User,  

            Your OTP is: **${otp}**  

            Please use this code to proceed. Do not share it with anyone.  

            Best regards,  
            Waste Management System
            `;
    return {otp,otpMail}
}

const validateOtp = async(otp,email)=>{
   const existingRequest =  await Otp.findOne({email})
   if(existingRequest.valid){
     if(otp===existingRequest.otp){ return true}
   }
   else return false;
}

const handleResetPassword= async (req,res)=>{
    const {email,newPassword} = req.body;
    const existingUser = await User.findOne({email});
    if(existingUser){
    const salt = await bcrypt.genSalt(10); // Generate salt for bcrypt hashing
    const hashedPassword = await bcrypt.hash(newPassword, salt); // Hash the password with the salt
    
  
    // Update the password field
    existingUser.password = hashedPassword;
    await existingUser.save(); // Save the updated user
        res.status(201).json({ message: "Password Updated successfully" });
    }
   else{
    return res.status(400).json({ message: "PAssword Update failed" });
   }
}
const handleGetCollectionNotification = async (req,res)=>{
    console.log("Route hit")
    const route = req.params.routeName;
    console.log(route)
    const routes =await vehicleRoutes.findOne({routeName:route})
    console.log(routes)
    const schedules = routes.schedule;
    console.log(schedules);
    res.status(200).json({"schedules":schedules}); 
}
// Export sendMail function to be used in other files
module.exports = { handleForgotPassword , validateEmail,sendMail,generateOtpMail,validateOtp,handleResetPassword,handleGetCollectionNotification}
