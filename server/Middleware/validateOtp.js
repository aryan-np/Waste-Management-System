const Otp = require("../Model/otp");
const validateOtpMiddleware = async (req, res, next) => {
    const { email, otp } = req.body;
    console.log("Received email:", email);
    console.log("Received OTP:", otp);

    if (!email || !otp) {
        return res.status(400).json({ status: false, msg: "Email and OTP are required" });
    }

    try {
        // Find the OTP document where the email matches and valid is true
        const existingRequest = await Otp.findOne({ email, valid: true });

        console.log("Existing OTP Request:", existingRequest);

        if (!existingRequest) {
            return res.status(404).json({ status: false, msg: "No valid OTP request found for this email" });
        }

        console.log("Stored OTP:", existingRequest.otp, "Valid:", existingRequest.valid);

        if (Number(existingRequest.otp) !== Number(otp)) {
            return res.status(401).json({ status: false, msg: "Invalid OTP" });
        }
        console.log("validating the otp")
        // Invalidate the OTP after successful validation
        existingRequest.valid = false;
        await existingRequest.save();

        console.log("OTP validated successfully");

        next();
    } catch (error) {
        console.error("Server error:", error);
        return res.status(500).json({ status: false, msg: "Server error", error: error.message });
    }
};

module.exports = validateOtpMiddleware;
