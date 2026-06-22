import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";
import { saveUploadedFile, deleteUploadedFile } from "../services/fileService.js";
import { setAuthCookie, clearAuthCookie } from "../utils/cookieHelper.js";

const JWT_SECRET = process.env.JWT_SECRET;

// ─────────────────────────────────────────
// CREATE NEW ACCOUNT (Self-registration)
// ─────────────────────────────────────────
export const createAccount = async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !username) {
      return res.status(400).json({ error: true, message: "Email and username are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: true, message: "Invalid email format" });
    }

    const isEmailTaken = await User.findOne({ where: { email } });
    if (isEmailTaken) {
      return res.status(400).json({ error: true, message: "Email already in use" });
    }

    const isUsernameTaken = await User.findOne({ where: { username } });
    if (isUsernameTaken) {
      return res.status(400).json({ error: true, message: "Username already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ email, password: hashedPassword, username });

    const accessToken = jwt.sign(
      { userId: newUser.id, email: newUser.email, username: newUser.username },
      JWT_SECRET,
      { expiresIn: process.env.TOKEN_EXPIRATION || '24h' }
    );

    setAuthCookie(res, accessToken); // ← was 6 lines

    return res.status(201).json({
      error: false,
      user: { id: newUser.id, email: newUser.email, username: newUser.username, imageUrl: newUser.imageUrl },
      message: "Registration successful",
    });
  } catch (error) {
    console.error("Create account error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

// ─────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: true, message: "Email and password are required" });
    }

    const user = await User.findOne({ where: { email } });

    let isPasswordValid = false;
    if (user) {
      isPasswordValid = await bcrypt.compare(password, user.password);
    }

    if (!user || !isPasswordValid) {
      return res.status(400).json({ error: true, message: "Invalid email or password" });
    }

    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, username: user.username },
      JWT_SECRET,
      { expiresIn: process.env.TOKEN_EXPIRATION || '24h' }
    );

    setAuthCookie(res, accessToken); // ← was 6 lines

    return res.status(200).json({
      error: false,
      user: { id: user.id, email: user.email, username: user.username, imageUrl: user.imageUrl },
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

// ─────────────────────────────────────────
// GET ALL USERS
// ─────────────────────────────────────────
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
    });
    return res.status(200).json({ error: false, users });
  } catch (error) {
    console.error("Get all users error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

// ─────────────────────────────────────────
// UPDATE USER
// ─────────────────────────────────────────
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, password, username } = req.body;

    const currentUser = await User.findByPk(id);
    if (!currentUser) {
      return res.status(404).json({ error: true, message: "User not found" });
    }

    const updateData = {};

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: true, message: "Invalid email format" });
      }
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail && existingEmail.id !== Number(id)) {
        return res.status(400).json({ error: true, message: "Email already in use" });
      }
      updateData.email = email;
    }

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    if (username) {
      const existingUsername = await User.findOne({ where: { username } });
      if (existingUsername && existingUsername.id !== Number(id)) {
        return res.status(400).json({ error: true, message: "Username already in use" });
      }
      updateData.username = username;
    }

    if (req.files && req.files.image) {
      try {
        const uploadedFilename = await saveUploadedFile(req.files.image); // ← was 60+ lines here
        if (currentUser.imageUrl) {
          deleteUploadedFile(currentUser.imageUrl);                        // ← was inline too
        }
        updateData.imageUrl = uploadedFilename;
      } catch (fileError) {
        return res.status(400).json({ error: true, message: fileError.message });
      }
    }

    const [updated] = await User.update(updateData, { where: { id } });
    if (!updated) {
      return res.status(404).json({ error: true, message: "User not found or not updated" });
    }

    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ["password"] },
    });

    return res.status(200).json({
      error: false,
      message: "User updated successfully",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        imageUrl: updatedUser.imageUrl,
      },
    });
  } catch (error) {
    console.error("Update user error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

// ─────────────────────────────────────────
// DELETE USER
// ─────────────────────────────────────────
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await User.destroy({ where: { id } });

    if (!deleted) {
      return res.status(404).json({ error: true, message: "User not found" });
    }

    return res.status(200).json({ error: false, message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

// ─────────────────────────────────────────
// VERIFY AUTH
// ─────────────────────────────────────────
export const verifyAuth = async (req, res) => {
  try {
    const fullUser = await User.findByPk(req.user.userId, {
      attributes: { exclude: ["password"] },
    });

    return res.status(200).json({
      error: false,
      user: {
        id: fullUser.id,
        email: fullUser.email,
        username: fullUser.username,
        imageUrl: fullUser.imageUrl,
      },
      message: "Authentication verified",
    });
  } catch (error) {
    console.error("Verify auth error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

// ─────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────
export const logout = async (req, res) => {
  try {
    clearAuthCookie(res); // ← was 5 lines

    return res.status(200).json({
      error: false,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};