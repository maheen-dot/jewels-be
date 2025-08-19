const jwt = require("jsonwebtoken");
const User = require("../models/user");

// Core token verification
const verifyToken = (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ message: "Invalid authorization header format." });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

// Protect middleware (attach user details from DB if needed)
const protect = async (req, res, next) => {
  verifyToken(req, res, async (err) => {
    if (err) return; // already handled above
    next();
  });
};

// Admin-only middleware
const admin = (req, res, next) => {
  if (req.user && (req.user.role === "admin" || req.user.role === "superadmin")) {
    next();
  } else {
    res.status(403).json({ message: "Admin access only." });
  }
};

module.exports = { verifyToken, protect, admin };
