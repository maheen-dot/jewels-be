  const jwt = require("jsonwebtoken");

  function verifyToken(req, res, next) {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    console.log(authHeader)
    const parts = authHeader.split(" ");
    const token = parts[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      req.userId = decoded.userId;
      next();
    } catch (err) {
      res.status(400).json({ message: "Invalid token." });
    }
  }

  module.exports = verifyToken;
