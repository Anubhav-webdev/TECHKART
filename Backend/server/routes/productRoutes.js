import express from "express";
import mongoose from "mongoose";

import Product from "../../Schema/productSchema.js";
import Book from "../../Schema/bookSchema.js";
import TShirt from "../../Schema/tShirtsSchema.js";

const router = express.Router();


// ==========================================
// GET ALL PRODUCTS
// ==========================================
router.get("/", async (req, res) => {
     try {
          const products = await Product.find().sort({ createdAt: -1 });

          const books = await Book.find().sort({ createdAt: -1 });

          const tshirts = await TShirt.find().sort({ createdAt: -1 });

          const transformedItems = [
               ...products,
               ...books,
               ...tshirts,
          ].map((item) => {
               const obj = item.toObject();

               // Convert local image paths
               if (
                    obj.image &&
                    obj.image.startsWith(
                         "E-frontend/src/assets/"
                    )
               ) {
                    obj.image = `http://localhost:${
                         process.env.PORT || 7000
                    }/assets/${obj.image.replace(
                         "E-frontend/src/assets/",
                         ""
                    )}`;
               }

               // Convert gallery paths
               if (Array.isArray(obj.gallery)) {
                    obj.gallery = obj.gallery.map((img) =>
                         img &&
                         img.startsWith(
                              "E-frontend/src/assets/"
                         )
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


// ==========================================
// GET TOTAL PRODUCT COUNT
// ==========================================
router.get("/count", async (req, res) => {
     try {
          const [
               electronicsCount,
               booksCount,
               tshirtsCount,
          ] = await Promise.all([
               Product.countDocuments(),
               Book.countDocuments(),
               TShirt.countDocuments(),
          ]);

          const total =
               electronicsCount +
               booksCount +
               tshirtsCount;

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


// ==========================================
// RESERVE STOCK
// ==========================================
router.post("/:id/reserve", async (req, res) => {
     try {
          // Validate MongoDB ID
          if (
               !mongoose.Types.ObjectId.isValid(
                    req.params.id
               )
          ) {
               return res.status(400).json({
                    message: "Invalid item ID",
               });
          }

          // Safe quantity parsing
          const qty = Math.max(
               1,
               Number(req.body?.quantity) || 1
          );

          // ==========================
          // PRODUCT
          // ==========================
          let updated = await Product.findOneAndUpdate(
               {
                    _id: req.params.id,
                    stock: { $gte: qty },
               },
               {
                    $inc: {
                         stock: -Math.abs(qty),
                    },
               },
               {
                    new: true,
               }
          );

          if (updated) {
               return res.status(200).json({
                    message: "Reserved successfully",
                    stock: updated.stock,
                    type: "product",
               });
          }

          // ==========================
          // BOOK
          // ==========================
          updated = await Book.findOneAndUpdate(
               {
                    _id: req.params.id,
                    stock: { $gte: qty },
               },
               {
                    $inc: {
                         stock: -Math.abs(qty),
                    },
               },
               {
                    new: true,
               }
          );

          if (updated) {
               return res.status(200).json({
                    message: "Reserved successfully",
                    stock: updated.stock,
                    type: "book",
               });
          }

          // ==========================
          // TSHIRT
          // ==========================
          updated = await TShirt.findOneAndUpdate(
               {
                    _id: req.params.id,
                    stock: { $gte: qty },
               },
               {
                    $inc: {
                         stock: -Math.abs(qty),
                    },
               },
               {
                    new: true,
               }
          );

          if (updated) {
               return res.status(200).json({
                    message: "Reserved successfully",
                    stock: updated.stock,
                    type: "tshirt",
               });
          }

          // ==========================
          // ITEM NOT FOUND
          // ==========================
          return res.status(400).json({
               message:
                    "Insufficient stock or item not found",
          });
     } catch (err) {
          console.error("RESERVE ERROR:", err);

          return res.status(500).json({
               message: "Reserve failed",
               error: err.message,
          });
     }
});


// ==========================================
// RELEASE STOCK
// ==========================================
router.post("/:id/release", async (req, res) => {
     try {
          // Validate MongoDB ID
          if (
               !mongoose.Types.ObjectId.isValid(
                    req.params.id
               )
          ) {
               return res.status(400).json({
                    message: "Invalid item ID",
               });
          }

          // Safe quantity parsing
          const qty = Math.max(
               1,
               Number(req.body?.quantity) || 1
          );

          // ==========================
          // PRODUCT
          // ==========================
          let updated = await Product.findOneAndUpdate(
               {
                    _id: req.params.id,
               },
               {
                    $inc: {
                         stock: Math.abs(qty),
                    },
               },
               {
                    new: true,
               }
          );

          if (updated) {
               return res.status(200).json({
                    message: "Released successfully",
                    stock: updated.stock,
                    type: "product",
               });
          }

          // ==========================
          // BOOK
          // ==========================
          updated = await Book.findOneAndUpdate(
               {
                    _id: req.params.id,
               },
               {
                    $inc: {
                         stock: Math.abs(qty),
                    },
               },
               {
                    new: true,
               }
          );

          if (updated) {
               return res.status(200).json({
                    message: "Released successfully",
                    stock: updated.stock,
                    type: "book",
               });
          }

          // ==========================
          // TSHIRT
          // ==========================
          updated = await TShirt.findOneAndUpdate(
               {
                    _id: req.params.id,
               },
               {
                    $inc: {
                         stock: Math.abs(qty),
                    },
               },
               {
                    new: true,
               }
          );

          if (updated) {
               return res.status(200).json({
                    message: "Released successfully",
                    stock: updated.stock,
                    type: "tshirt",
               });
          }

          // ==========================
          // ITEM NOT FOUND
          // ==========================
          return res.status(404).json({
               message: "Item not found",
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