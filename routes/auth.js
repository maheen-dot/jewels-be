const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware"); 

const {
  signup,
  login,
  verifyOtp,
  forgotPassword,
  resetPassword,
  resendOtp,
  getUserProfile,
  updateUserProfile
} = require("../controllers/authcontroller");

//Routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/verify-otp", verifyOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);   
router.post("/resend-otp", resendOtp)
router.get("/profile", verifyToken, getUserProfile);
router.put("/profile", verifyToken, updateUserProfile);

module.exports = router;
