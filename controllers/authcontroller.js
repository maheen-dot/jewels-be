const bcrypt = require("bcryptjs");
const User = require("../models/user");
const sendEmail = require("../utils/sendEmail");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret"; 
const crypto = require("crypto");

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
     // Generate JWT Token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role || "user" },
      JWT_SECRET,
      { expiresIn: "7d" } // or "1h", "30m", etc.
    );
   console.log("Generated JWT Token:", token);  
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: "strict",
    });

    res.status(200).json({ message: "Login successful", 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || "user", // Default to 'user' if role is not set
      },
      token, // Include token in response
     });
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
{/*const forgotPasswordOtp = async (req, res) => {
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
*/}

// ===================== FORGOT PASSWORD =====================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetToken = hashedToken;
    user.resetTokenExpires = Date.now() + 15 * 60 * 1000; // 15 mins
    await user.save();

    const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
    const resetLink = `${CLIENT_URL}/reset-password/${resetToken}`
    //const resetLink = `http://localhost:5173/reset-password/${resetToken}`; // Frontend route

    await sendEmail(
      email,
      "Reset Your Jewels Password",
      `Click the link to reset your password:\n\n${resetLink}\n\nLink expires in 15 minutes.`
    );

    res.status(200).json({ message: "Reset link sent to email" });
  } catch (error) {
    console.error("Forgot Password Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
// ===================== Reset PASSWORD =====================
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params; // from URL
    const { newPassword } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset Password Error:", error.message);
    res.status(500).json({ message: "Server error during password reset" });
  }
};

// ===================== RESEND OTP =====================


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
  forgotPassword,
  resetPassword,
  resendOtp,
};
