import express from "express";
import mongoose from "mongoose";
import Product from "../../Schema/productSchema.js";

const router = express.Router();


// ========================================
// GET ALL PRODUCTS
// ========================================
router.get("/", async (req, res) => {
     try {
          const products = await Product.find().sort({ createdAt: -1 });

          const transformedItems = products.map((item) => {
               const obj = item.toObject();

               // Convert local image path to URL
               if (
                    obj.image &&
                    obj.image.startsWith("E-frontend/src/assets/")
               ) {
                    obj.image = `http://localhost:${
                         process.env.PORT || 7000
                    }/assets/${obj.image.replace(
                         "E-frontend/src/assets/",
                         ""
                    )}`;
               }

               // Convert gallery image paths
               if (Array.isArray(obj.gallery)) {
                    obj.gallery = obj.gallery.map((img) =>
                         img &&
                         img.startsWith("E-frontend/src/assets/")
                              ? `http://localhost:${
                                     process.env.PORT || 7000
                                }/assets/${img.replace(
                                     "E-frontend/src/assets/",
                                     ""
                                )}`
                              : img
                    );
               }

               return obj;
          });

          return res.status(200).json(transformedItems);
     } catch (err) {
          console.error("GET PRODUCTS ERROR:", err);

          return res.status(500).json({
               message: "Server error",
               error: err.message,
          });
     }
});


// ========================================
// GET PRODUCT COUNT
// ========================================
router.get("/count", async (req, res) => {
     try {
          const total = await Product.countDocuments();

          return res.status(200).json({
               total,
          });
     } catch (err) {
          console.error("COUNT ERROR:", err);

          return res.status(500).json({
               message: "Server error",
               error: err.message,
          });
     }
});


// ========================================
// ADD PRODUCT
// ========================================
router.post("/add", async (req, res) => {
     try {
          const electronics = await Product.create(req.body);

          return res.status(201).json({
               message: "Electronics added successfully",
               electronics,
          });
     } catch (err) {
          console.error("ADD PRODUCT ERROR:", err);

          return res.status(500).json({
               message: "Error adding electronics",
               error: err.message,
          });
     }
});


// ========================================
// GET ELECTRONICS
// ========================================
router.get("/electronics", async (req, res) => {
     try {
          const electronics = await Product.find().sort({
               createdAt: -1,
          });

          return res.status(200).json(electronics);
     } catch (err) {
          console.error("GET ELECTRONICS ERROR:", err);

          return res.status(500).json({
               message: "Error fetching electronics",
               error: err.message,
          });
     }
});


// ========================================
// UPDATE PRODUCT
// ========================================
router.put("/update/:id", async (req, res) => {
     try {
          // Validate MongoDB ID
          if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
               return res.status(400).json({
                    message: "Invalid product ID",
               });
          }

          const updated = await Product.findByIdAndUpdate(
               req.params.id,
               req.body,
               {
                    new: true,
               }
          );

          if (!updated) {
               return res.status(404).json({
                    message: "Electronics not found",
               });
          }

          return res.status(200).json(updated);
     } catch (err) {
          console.error("UPDATE PRODUCT ERROR:", err);

          return res.status(500).json({
               message: "Error updating electronics",
               error: err.message,
          });
     }
});


// ========================================
// DELETE PRODUCT
// ========================================
router.delete("/delete/:id", async (req, res) => {
     try {
          // Validate MongoDB ID
          if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
               return res.status(400).json({
                    message: "Invalid product ID",
               });
          }

          const deleted = await Product.findByIdAndDelete(
               req.params.id
          );

          if (!deleted) {
               return res.status(404).json({
                    message: "Electronics not found",
               });
          }

          return res.status(200).json({
               message: "Electronics deleted successfully",
          });
     } catch (err) {
          console.error("DELETE PRODUCT ERROR:", err);

          return res.status(500).json({
               message: "Error deleting electronics",
               error: err.message,
          });
     }
});


// ========================================
// RESERVE PRODUCT STOCK
// ========================================
router.post("/:id/reserve", async (req, res) => {
     try {
          // Validate MongoDB ID
          if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
               return res.status(400).json({
                    message: "Invalid product ID",
               });
          }

          const qty = Math.max(
               1,
               Number(req.body?.quantity) || 1
          );

          const updated = await Product.findOneAndUpdate(
               {
                    _id: req.params.id,
                    stock: { $gte: qty },
               },
               {
                    $inc: {
                         stock: -qty,
                    },
               },
               {
                    new: true,
               }
          );

          if (!updated) {
               return res.status(400).json({
                    message: "Insufficient stock or product not found",
               });
          }

          return res.status(200).json({
               message: "Stock reserved successfully",
               stock: updated.stock,
          });
     } catch (err) {
          console.error("RESERVE ERROR:", err);

          return res.status(500).json({
               message: "Reserve failed",
               error: err.message,
          });
     }
});


// ========================================
// RELEASE PRODUCT STOCK
// ========================================
router.post("/:id/release", async (req, res) => {
     try {
          // Validate MongoDB ID
          if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
               return res.status(400).json({
                    message: "Invalid product ID",
               });
          }

          const qty = Math.max(
               1,
               Number(req.body?.quantity) || 1
          );

          const updated = await Product.findByIdAndUpdate(
               req.params.id,
               {
                    $inc: {
                         stock: qty,
                    },
               },
               {
                    new: true,
               }
          );

          if (!updated) {
               return res.status(404).json({
                    message: "Product not found",
               });
          }

          return res.status(200).json({
               message: "Stock released successfully",
               stock: updated.stock,
          });
     } catch (err) {
          console.error("RELEASE ERROR:", err);

          return res.status(500).json({
               message: "Release failed",
               error: err.message,
          });
     }
});

export default router;