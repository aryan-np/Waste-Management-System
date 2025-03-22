const Otp = require("../Model/otp");

const validateOtpMiddleware = async (req, res, next) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({
            status: false,
            msg: "Email and OTP are required"
        });
    }

    try {
        const existingRequest = await Otp.findOne({ email });

        if (!existingRequest) {
            return res.status(404).json({
                status: false,
                msg: "No OTP request found for this email"
            });
        }

        if (!existingRequest.valid) {
            return res.status(401).json({
                status: false,
                msg: "OTP has already been used or is expired"
            });
        }

        if (existingRequest.otp !== otp) {
            return res.status(401).json({
                status: false,
                msg: "Invalid OTP"
            });
        }

        // OTP is valid, mark it as used (optional)
        existingRequest.valid = false;
        await existingRequest.save();

        // Proceed to the next middleware or route handler
        next();
    } catch (error) {
        return res.status(500).json({
            status: false,
            msg: "Server error",
            error: error.message
        });
    }
};

module.exports = validateOtpMiddleware;
