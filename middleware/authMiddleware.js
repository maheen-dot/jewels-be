const jwt = require("jsonwebtoken");
const User = require("../models/user");

const verifyToken = (req, res) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    throw new Error("Access denied. No token provided.");
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    throw new Error("Invalid authorization header format.");
  }

  const token = parts[1];
  return jwt.verify(token, process.env.JWT_SECRET);
};

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

// Admin-only
const admin = (req, res, next) => {
  if (req.user.role === "admin") next();
  else res.status(403).json({ message: "Admin access only" });
};

module.exports = { verifyToken, protect, admin };
