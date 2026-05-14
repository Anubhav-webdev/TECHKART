      import express from "express";
import bcrypt from "bcrypt";
import { User } from "../../Schema/userSchema.js";

const router = express.Router();

/* ======================================================
   SIGNUP
====================================================== */
router.post("/signup", async (req, res) => {
  const { username, email, phone, password } = req.body;

  try {
    // Normalize inputs to lowercase for consistency
    const normalizedUsername = String(username || "").trim().toLowerCase();
    const normalizedEmail = String(email || "").trim().toLowerCase();
    
    if (!normalizedUsername || !normalizedEmail || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const exists = await User.findOne({
      $or: [{ email: normalizedEmail }, { phone }, { username: normalizedUsername }]
    });

    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }


    const user = await User.create({
      username: normalizedUsername,
      email: normalizedEmail,
      phone,
      password,
      role: "user"
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ======================================================
   LOGIN (ADMIN + USER)
====================================================== */
router.post("/login", async (req, res) => {
  const { identifier, password } = req.body;

  try {
    const id = String(identifier).trim().toLowerCase();

/* ---------- ADMIN LOGIN ---------- */
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "").toLowerCase();
const ADMIN_USERNAME = (process.env.ADMIN_USERNAME || "").toLowerCase();
const ADMIN_PHONE = (process.env.ADMIN_PHONE || "").toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (
  id === ADMIN_EMAIL ||
  id === ADMIN_USERNAME ||
  id === ADMIN_PHONE
) {
  if (password !== ADMIN_PASSWORD) {
    return res.status(400).json({ message: "Invalid admin password" });
  }

  return res.status(200).json({
    message: "Admin login successful",
    user: {
      id: "admin",
      username: "NeoPhoenix",
      email: ADMIN_EMAIL,
      phone: ADMIN_PHONE,
      role: "admin"
    }
  });
}


    /* ---------- USER LOGIN ---------- */
    // Normalize username identifier to match schema normalization (username is lowercase in schema)
    const normalizedId = id.toLowerCase();
    
    const user = await User.findOne({
      $or: [
        { username: normalizedId },
        { email: normalizedId },
        { phone: identifier?.toString().trim() }
      ]
    });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role || "user",
        product: user.product || []
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ======================================================
   USER COUNT (ADMIN DASHBOARD)
====================================================== */
router.get("/count", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    res.status(200).json({ totalUsers });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ======================================================
   GET ALL USERS (NO PASSWORDS)
====================================================== */
router.get("/all", async (req, res) => {
  try {
    const users = await User.find({})
      .select("username email phone role orders createdAt");

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;