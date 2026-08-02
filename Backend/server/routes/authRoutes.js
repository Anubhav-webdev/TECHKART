import express from "express";
import bcrypt from "bcrypt";
import { User } from "../../Schema/userSchema.js";

const router = express.Router();

/* ======================================================
   SIGNUP
====================================================== */
router.post("/signup", async (req, res) => {
     try {
          console.log("Signup Body:", req.body);

          const {
               username,
               email,
               phone,
               password,
          } = req.body;

          const normalizedUsername = String(
               username || ""
          )
               .trim()
               .toLowerCase();

          const normalizedEmail = String(
               email || ""
          )
               .trim()
               .toLowerCase();

          const normalizedPhone = String(
               phone || ""
          ).trim();

          // Validation
          if (
               !normalizedUsername ||
               !normalizedEmail ||
               !normalizedPhone ||
               !password
          ) {
               return res.status(400).json({
                    message:
                         "All fields are required",
               });
          }

          // Existing user check
          const exists = await User.findOne({
               $or: [
                    {
                         email: normalizedEmail,
                    },
                    {
                         phone: normalizedPhone,
                    },
                    {
                         username:
                              normalizedUsername,
                    },
               ],
          });

          if (exists) {
               let field = "account";

               if (exists.username === normalizedUsername) {
                    field = "username";
               } else if (exists.email === normalizedEmail) {
                    field = "email";
               } else if (exists.phone === normalizedPhone) {
                    field = "phone";
               }

               return res.status(400).json({
                    message: `A user with this ${field} already exists`,
               });
          }

          // Create user
          // Password auto-hashed by schema
          const user = await User.create({
               username: normalizedUsername,
               email: normalizedEmail,
               phone: normalizedPhone,
               password,
               role: "user",
          });

          return res.status(201).json({
               message:
                    "User created successfully",
               user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
               },
          });
     } catch (err) {
          console.log(
               "SIGNUP ERROR:",
               err
          );

          return res.status(500).json({
               message: "Server error",
               error: err.message,
          });
     }
});

/* ======================================================
   LOGIN
====================================================== */
router.post("/login", async (req, res) => {
     try {
          console.log("Login Body:", req.body);

          const { identifier, password } =
               req.body;

          const id = String(
               identifier || ""
          )
               .trim()
               .toLowerCase();

          /* ---------- ADMIN LOGIN ---------- */

          const ADMIN_EMAIL = (
               process.env.ADMIN_EMAIL || ""
          ).toLowerCase();

          const ADMIN_USERNAME = (
               process.env.ADMIN_USERNAME || ""
          ).toLowerCase();

          const ADMIN_PHONE = (
               process.env.ADMIN_PHONE || ""
          ).toLowerCase();

          const ADMIN_PASSWORD =
               process.env.ADMIN_PASSWORD;

          if (
               id === ADMIN_EMAIL ||
               id === ADMIN_USERNAME ||
               id === ADMIN_PHONE
          ) {
               if (
                    password !== ADMIN_PASSWORD
               ) {
                    return res.status(400).json({
                         message:
                              "Invalid admin password",
                    });
               }

               return res.status(200).json({
                    message:
                         "Admin login successful",
                    user: {
                         id: "admin",
                         username:
                              "NeoPhoenix",
                         email: ADMIN_EMAIL,
                         phone: ADMIN_PHONE,
                         role: "admin",
                    },
               });
          }

          /* ---------- USER LOGIN ---------- */

          const user = await User.findOne({
               $or: [
                    {
                         username: id,
                    },
                    {
                         email: id,
                    },
                    {
                         phone: identifier
                              ?.toString()
                              .trim(),
                    },
               ],
          });

          if (!user) {
               return res.status(400).json({
                    message:
                         "User not found",
               });
          }

          const isMatch =
               await bcrypt.compare(
                    password,
                    user.password
               );

          if (!isMatch) {
               return res.status(400).json({
                    message:
                         "Invalid password",
               });
          }

          return res.status(200).json({
               message:
                    "Login successful",
               user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    phone: user.phone,
                    role:
                         user.role || "user",
               },
          });
     } catch (err) {
          console.log(
               "LOGIN ERROR:",
               err
          );

          return res.status(500).json({
               message: "Server error",
               error: err.message,
          });
     }
});

/* ======================================================
   USER COUNT
====================================================== */
router.get("/count", async (req, res) => {
     try {
          const totalUsers =
               await User.countDocuments();

          return res.status(200).json({
               totalUsers,
          });
     } catch (err) {
          console.log(err);

          return res.status(500).json({
               message: "Server error",
               error: err.message,
          });
     }
});

/* ======================================================
   GET ALL USERS
====================================================== */
router.get("/all", async (req, res) => {
     try {
          const users = await User.find({})
               .select("username email phone role orders wishlist cart createdAt");

          return res.status(200).json(users);
     } catch (err) {
          console.log(err);

          return res.status(500).json({
               message: "Server error",
               error: err.message,
          });
     }
});

export default router;