const express = require("express");
const router = express.Router();

// Import all auth controller functions
const {
  signup,
  login,
  verifyOtp,
  forgotPassword,
  resetPassword,
  resendOtp,
} = require("../controllers/authcontroller");

// ==================== ROUTES ====================

// Signup - Create account and send OTP
router.post("/signup", signup);

// Login - Authenticate user
router.post("/login", login);

// Verify OTP - Activate account
router.post("/verify-otp", verifyOtp);

// Forgot Password - Send OTP for password reset
router.post("/forgot-password", forgotPassword);

// Reset Password - Using OTP
router.post("/reset-password/:token", resetPassword);

//resend otp    
router.post("/resend-otp", resendOtp);


// ==================== EXPORT ROUTER ====================
module.exports = router;
