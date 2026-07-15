// ------------------------------------------------------------
// 📦 Imports & Configuration
// ------------------------------------------------------------
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./connect.js";

// Routes
import productRoutes from "./server/routes/productRoutes.js";
import authRoutes from "./server/routes/authRoutes.js";
import billingRoutes from "./server/routes/billingRoutes.js";
import blogRoutes from "./server/routes/blogRoutes.js";
import bookRoutes from "./server/routes/bookRoutes.js";
import electronics from "./server/routes/electronics.js";
import tshirtRoutes from "./server/routes/tshirtRoutes.js";
import newsRoutes from "./server/routes/newsRoutes.js";
import geocodeRoutes from "./server/routes/geocodeRoutes.js";
import userRoutes from "./server/routes/userRoutes.js";
import feedbackRoutes from "./server/routes/feedbackRoutes.js";
import visitRoutes from "./server/routes/visitRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 7000;

// ------------------------------------------------------------
// ⚙️ CORS FIX
// ------------------------------------------------------------
// ------------------------------------------------------------
// ⚙️ Middleware
// ------------------------------------------------------------

app.use(cors({
     origin: true,
     credentials: true,
     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// ------------------------------------------------------------
// ⚙️ Middleware
// ------------------------------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ------------------------------------------------------------
// 🖼 Static Files
// ------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// uploads
const uploadsPath = path.resolve(__dirname, "uploads");

if (!fs.existsSync(uploadsPath)) {
     fs.mkdirSync(uploadsPath, { recursive: true });
}

app.use("/uploads", express.static(uploadsPath));

// assets
const assetsPath = path.resolve(__dirname, "..", "E-frontend", "src", "assets");

if (fs.existsSync(assetsPath)) {
     app.use("/assets", express.static(assetsPath));
}

// product images
const productImagesPath = path.resolve(
     __dirname,
     "..",
     "E-frontend",
     "public",
     "productImages"
);

if (fs.existsSync(productImagesPath)) {
     app.use("/productImages", express.static(productImagesPath));
}

// ------------------------------------------------------------
// 🛣 API Routes
// ------------------------------------------------------------
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/electronics", electronics);
app.use("/api/tshirts", tshirtRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/geocode", geocodeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/visits", visitRoutes);

// ------------------------------------------------------------
// ✅ Health Check Route
// ------------------------------------------------------------
app.get("/", (req, res) => {
     res.status(200).json({
          success: true,
          message: "TechKart API Running 🚀"
     });
});

// ------------------------------------------------------------
// ❌ Route Not Found Handler
// ------------------------------------------------------------
app.use((req, res) => {
     res.status(404).json({
          success: false,
          message: `Route not found: ${req.originalUrl}`
     });
});

// ------------------------------------------------------------
// ❌ Global Error Handler
// ------------------------------------------------------------
app.use((err, req, res, next) => {
     console.error("SERVER ERROR:", err);

     res.status(500).json({
          success: false,
          message: "Internal server error",
          error: err.message
     });
});

// ------------------------------------------------------------
// 🧠 Database Connection + Server Start
// ------------------------------------------------------------
(async () => {
     try {
          await connectDB();

          console.log("✅ MongoDB Connected");

          app.listen(PORT, () => {
               console.log(`🚀 Server running on port ${PORT}`);
          });

     } catch (err) {
          console.error("❌ Database connection failed");
          console.error(err);
     }
})();

// ------------------------------------------------------------
// 🔥 Debugging Handlers
// ------------------------------------------------------------
process.on("uncaughtException", (err) => {
     console.error("UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (reason) => {
     console.error("UNHANDLED REJECTION:", reason);
});