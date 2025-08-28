const bcrypt = require("bcryptjs");
const User = require("../models/user");
const sendEmail = require("../utils/sendEmail");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret"; 
const crypto = require("crypto");

// Helper to generate OTP
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

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

    // Try sending email but don't let failure send duplicate responses
    try {
      await sendEmail(email, "Your Jewels OTP Code", `Your OTP is: ${otp}`);
    } catch (emailErr) {
      console.error("Failed to send OTP email:", emailErr.message);
      // Do NOT send another response here, user is already created
    }

    // Always send success response after saving user
    return res.status(201).json({ message: "Signup successful, OTP sent to email" });

  } catch (error) {
    console.error("Signup Error:", error.message);
    if (!res.headersSent) { 
      // prevent sending response twice
      return res.status(500).json({ message: "Server error during signup" });
    }
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    if (!user.isActive) {
    return res.status(403).json({ success: false, message: "Account is deactivated. Contact support." }); 
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (!user.isVerified) {
      return res.status(200).json({
        success: true,
        isVerified: false,
        message: "Please verify your OTP",
        userId: user._id,
        email: user.email
      });
    }

    // if verified
    const token = jwt.sign({ userId: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified   
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

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
      return;
  } catch (error) {
    console.error("OTP Verification Error:", error.message);
    res.status(500).json({ message: "Server error during OTP verification" });
  }
};

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

// user to fetch his profile 
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select(
      "name email address contactNumber role isVerified"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//user to update his profile
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update allowed fields
    user.name = req.body.name || user.name;
    user.address = req.body.address || user.address;
    user.contactNumber = req.body.contactNumber || user.contactNumber;

    // If user also wants to update password
    if (req.body.password) {
      user.password = req.body.password; // hashing will apply if you use pre-save middleware
    }

    const updatedUser = await user.save();

    res.json({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      address: updatedUser.address,
      contactNumber: updatedUser.contactNumber,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  signup,
  login,
  verifyOtp,
  forgotPassword,
  resetPassword,
  resendOtp,
  getUserProfile,
  updateUserProfile, 
};


