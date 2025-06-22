  const jwt = require("jsonwebtoken");

  function verifyToken(req, res, next) {
    const token = req.header("Authorization");

    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // Attach the user data to the request object
      next();
    } catch (err) {
      res.status(400).json({ message: "Invalid token." });
    }
  }

  module.exports = verifyToken;
