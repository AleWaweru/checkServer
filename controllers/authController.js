import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendVerificationEmail } from "../utils/verifyEmail.js";
import { jwtGenerator } from "../utils/jwtGenerator.js";
import { sendResetPasswordEmail } from "../utils/sendResetPasswordEmail.js";
const bcryptSalt = 10;
// Register
export const register = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    county,
    constituency,
    ward,
    role = "user",
  } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({
      firstName,
      lastName,
      email,
      password, // Will be hashed by Mongoose pre-save
      county,
      constituency,
      ward,
      role,
    });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    try {
      await sendVerificationEmail(newUser, token);
    } catch (error) {
      console.error("❌ Failed to send verification email:", error);
      return res
        .status(500)
        .json({ message: "Failed to send verification email" });
    }

    res.status(201).json({
      message: "User registered successfully. Please verify your email.",
    });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong", error: err.message });
  }
};

// Login
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.verified) {
      return res
        .status(403)
        .json({ message: "Please verify your email to login." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwtGenerator(user._id);
    user.token = token;
    await user.save();

    res.status(200).json({
      message: "Login successful",
      user,
      token,
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

// Google Sign Up
export const signUpGoogle = async (req, res) => {
  const { name, email, profilePicUrl, county, constituency, ward } = req.body;

  if (!email || !name || !county || !constituency || !ward) {
    return res
      .status(400)
      .json({ message: "Missing required Google account fields." });
  }

  try {
    const user = await User.findOne({ email });

    if (user) {
      const token = jwtGenerator(user._id);
      const { password, ...userData } = user.toObject();

      return res
        .status(200)
        .cookie("access_token", token, { httpOnly: true })
        .json({ ...userData, token });
    }

    // If user doesn't exist, reject login
    return res.status(403).json({
      message:
        "Google account not registered. Please register first to continue",
    });
  } catch (err) {
    console.error("Google login failed:", err);
    res
      .status(500)
      .json({ message: "Google login failed", error: err.message });
  }
};

export const verifyEmail = async (req, res) => {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.verified)
      return res.status(400).json({ message: "Email already verified" });

    user.verified = true;
    await user.save();

    res
      .status(200)
      .json({ message: "Email verified successfully. You can now log in." });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Invalid or expired token", error: err.message });
  }
};

export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "No user with that email." });

    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    await sendResetPasswordEmail(user, token);
    res.status(200).json({ message: "Password reset email sent." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error sending reset email", error: err.message });
  }
};

export const forgotPasswordRequestController = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email does not exist" });

    // Generate raw and hashed reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = await bcrypt.hash(resetToken, bcryptSalt);

    // Set the token and expiration on the user document
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000; // Token valid for 1 hour

    await user.save();
    const link = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}/${user._id}`;

    return res.status(200).json({ message: "Password reset link generated", link });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res) => {
  const { token, id, newPassword } = req.body;

  if (!token || !id || !newPassword) {
    return res.status(400).json({ message: "Missing token, user ID, or password" });
  }

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.resetPasswordToken || !user.resetPasswordExpires) {
      return res.status(400).json({ message: "Invalid or expired reset request" });
    }

    if (user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ message: "Reset token expired" });
    }

    const isValid = await bcrypt.compare(token, user.resetPasswordToken);
    if (!isValid) {
      return res.status(400).json({ message: "Invalid reset token" });
    }

    // Update the password and clear reset fields
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Password reset successfully. You can now login." });
  } catch (err) {
    res.status(500).json({ message: "Error resetting password", error: err.message });
  }
};

export const allUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password -resetPasswordToken -resetPasswordExpires -__v");

    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users", error: error.message });
  }
};

