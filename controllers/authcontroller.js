const bcrypt = require("bcryptjs");
const User = require("../models/user");
const sendEmail = require("../utils/sendEmail");

// Helper to generate OTP
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ===================== SIGNUP =====================
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes expiration time

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      otp,
      otpExpires,
    });

    await newUser.save();

    try {
      await sendEmail(email, "Your Jewels OTP Code", `Your OTP is: ${otp}`);
    } catch (emailErr) {
      console.error("Failed to send OTP email:", emailErr.message);
      return res
        .status(500)
        .json({ message: "Signup failed: Unable to send OTP email" });
    }

    res.status(201).json({ message: "Signup successful, OTP sent to email" });
  } catch (error) {
    console.error("Signup Error:", error.message);
    res.status(500).json({ message: "Server error during signup" });
  }
};

// ===================== LOGIN =====================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    if (!user.isVerified) {
      return res
        .status(403)
        .json({ message: "Account not verified. Please verify OTP." });
    }

    res.status(200).json({ message: "Login successful", userId: user._id });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ message: "Server error during login" });
  }
};

// ===================== VERIFY OTP =====================
const verifyOtp = async (req, res) => {
  try {
    console.log(req.body)

    const { email, otp } = req.body;

    const user = await User.findOne({ email, otp });
    if (!user) return res.status(400).json({ message: "Invalid OTP or email" });

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res
      .status(200)
      .json({ message: "OTP verified successfully, account activated" });
  } catch (error) {
    console.error("OTP Verification Error:", error.message);
    res.status(500).json({ message: "Server error during OTP verification" });
  }
};

// ===================== FORGOT PASSWORD - SEND OTP =====================
const forgotPasswordOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes expiration time

    await user.save();

    try {
      await sendEmail(
        email,
        "Jewels Password Reset OTP",
        `Your OTP is: ${otp}`
      );
    } catch (emailErr) {
      console.error("Failed to send OTP email:", emailErr.message);
      return res.status(500).json({ message: "Failed to send OTP email" });
    }

    res.status(200).json({ message: "OTP sent to email for password reset" });
  } catch (error) {
    console.error("Forgot Password OTP Error:", error.message);
    res.status(500).json({ message: "Server error during OTP send" });
  }
};

// ===================== RESET PASSWORD =====================
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email, otp });
    if (!user) return res.status(400).json({ message: "Invalid OTP or email" });

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = null;
    user.otpExpires = null;

    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset Password Error:", error.message);
    res.status(500).json({ message: "Server error during password reset" });
  }
};

const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if email is provided
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find the user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User is already verified" });
    }

    // Generate a new OTP
    const newOtp = generateOTP();
    const newOtpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes expiration time

    // Update OTP and expiry in database
    user.otp = newOtp;
    user.otpExpires = newOtpExpires;
    await user.save();

    // Send email
    try {
      await sendEmail(
        email,
        "Resend OTP - Your Jewels Account",
        `Your new OTP is: ${newOtp}`
      );
    } catch (emailError) {
      console.error("Email sending failed:", emailError.message);
      return res
        .status(500)
        .json({ message: "Failed to send OTP email. Please try again." });
    }

    res.status(200).json({ message: "New OTP sent successfully" });
  } catch (error) {
    console.error("Resend OTP Error:", error.message);
    res.status(500).json({ message: "Server error while resending OTP" });
  }
};

// ===================== EXPORT ALL FUNCTIONS =====================
module.exports = {
  signup,
  login,
  verifyOtp,
  forgotPasswordOtp,
  resetPassword,
  resendOtp,
};
