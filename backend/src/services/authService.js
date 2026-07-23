import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const registerUser = async ({ name, email, phone, password }) => {
  // Check if email or phone already exists
  const existingUser = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { phone }]
  });

  if (existingUser) {
    const error = new Error("User with this email or phone number already exists.");
    error.statusCode = 400;
    throw error;
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new User({
    name,
    email: email.toLowerCase(),
    phone,
    password: hashedPassword
  });

  await newUser.save();

  // Return user without password
  const userObj = newUser.toObject();
  delete userObj.password;
  return userObj;
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 400;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 400;
    throw error;
  }

  // Generate JWT Token
  const jwtSecret = process.env.JWT_SECRET || "sheshield_secret_key";
  const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: "30d" });

  const userObj = user.toObject();
  delete userObj.password;

  return { user: userObj, token };
};

export const getUserProfile = async (userId) => {
  const user = await User.findById(userId)
    .populate("emergencyContacts")
    .select("-password");

  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }
  return user;
};

export const updateUserProfile = async (userId, { name, phone }) => {
  // Check if new phone already taken by another user
  if (phone) {
    const existing = await User.findOne({ phone, _id: { $ne: userId } });
    if (existing) {
      const error = new Error("This phone number is already in use by another account.");
      error.statusCode = 400;
      throw error;
    }
  }

  const updates = {};
  if (name) updates.name = name;
  if (phone) updates.phone = phone;

  const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true }).select("-password");
  if (!updatedUser) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }
  return updatedUser;
};

export const updateProfileImage = async (userId, imagePath) => {
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { profileImage: imagePath },
    { new: true }
  ).select("-password");

  if (!updatedUser) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }
  return updatedUser;
};
