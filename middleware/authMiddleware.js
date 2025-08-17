const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  const parts = authHeader.split(" ");
  const token = parts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user details from token
    req.user = decoded;
    req.userId = decoded.userId;
    req.role = decoded.role || "user"; // default role is 'user' if not set in token

    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid token." });
  }
}

module.exports = verifyToken;
