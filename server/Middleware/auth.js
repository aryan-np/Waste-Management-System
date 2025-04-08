const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

const isAuthenticated = (req, res, next) => {
    // console.log('Incoming cookies:', req.cookies);
  // console.log('Incoming headers:', req.headers);
  
  const token = req.cookies.Authorization || 
                req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    console.error('No token found in:', {
      cookies: req.cookies,
      headers: req.headers
    });
    return res.status(401).json({ 
      message: "Authentication required",
      debug: {
        receivedCookies: req.cookies,
        receivedHeaders: req.headers
      }
    });
}
  
    
    

    if (!token) {
        console.log("Access denied. No token provided.")
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        console.log("AUthenticated") // Attach user data to request
        next(); // Proceed to the next middleware/controller
    } catch (error) {
        return res.status(403).json({ message: "Invalid or expired token." });
    }
};

module.exports = { isAuthenticated };
