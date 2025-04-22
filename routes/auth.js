const express = require("express");
const router = express.Router();

// Import all auth controller functions
const {
  signup,
  login,
  verifyOtp,
  forgotPasswordOtp,
  resetPassword,
  resendOtp,
} = require("../controllers/authController");

// ==================== ROUTES ====================

// Signup - Create account and send OTP
router.post("/signup", signup);

// Login - Authenticate user
router.post("/login", login);

// Verify OTP - Activate account
router.post("/verify-otp", verifyOtp);

// Forgot Password - Send OTP for password reset
router.post("/forgot-password-otp", forgotPasswordOtp);

// Reset Password - Using OTP
router.post("/reset-password", resetPassword);

//resend otp    
router.post("/resend-otp", resendOtp);


// ==================== EXPORT ROUTER ====================
module.exports = router;
