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




dotenv.config();

const app = express();
const PORT = process.env.PORT || 7000;

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
// ------------------------------------------------------------
// ⚙️ Middleware
// ------------------------------------------------------------
app.use(cors({
     origin: [
          "http://localhost:5173",
          "https://techkart-3jzp-j0nl6tvbx-neophoenix.vercel.app"
     ],
     credentials: true
}));
app.use(express.json());

app.get("/", (req, res) => {
     res.json({
          success: true,
          message: "Backend running successfully"
     });
});

// ------------------------------------------------------------
// 🖼 Serve Frontend Assets
// ------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const productImagesPath = path.resolve(__dirname, "..", "E-frontend", "public", "productImages");
if (fs.existsSync(productImagesPath)) {
     app.use("/productImages", express.static(productImagesPath));
}

const assetsPath = path.resolve(__dirname, "..", "E-frontend", "src", "assets");
if (fs.existsSync(assetsPath)) {
     app.use("/assets", express.static(assetsPath));
}

// Serve uploaded files (avatars, etc.)
const uploadsPath = path.resolve(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath, { recursive: true });
app.use("/uploads", express.static(uploadsPath));




// Routes
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

// ------------------------------------------------------------
// ❌ 404 HANDLER
// ------------------------------------------------------------
app.use((req, res) => {
     res.status(404).json({
          message: `Route not found: ${req.originalUrl}`
     });
});

// ------------------------------------------------------------
// 🧠 Database Connection
// ------------------------------------------------------------
(async () => {
     try {
          const ok = await connectDB();
          if (ok === false) {
               console.error('❌ Database connection failed (connect.js returned false). Check the logs above.');
          } else {
               console.log('✅ Database connected successfully');
          }
     } catch (err) {
          console.error('❌ Database connection attempt threw:', err && (err.stack || err));
     }

     // ------------------------------------------------------------
     // 🚀 Start Server
     // ------------------------------------------------------------
     app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
})();

// Global error handlers to aid local debugging
process.on('uncaughtException', (err) => {
     console.error('UNCAUGHT EXCEPTION:', err && (err.stack || err));
});
process.on('unhandledRejection', (reason) => {
     console.error('UNHANDLED REJECTION:', reason && (reason.stack || reason));
});
