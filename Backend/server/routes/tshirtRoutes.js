import express from "express";
import mongoose from "mongoose";

import TShirt from "../../Schema/tShirtsSchema.js";

const router = express.Router();


// ==========================================
// ADD T-SHIRT
// ==========================================
router.post("/add", async (req, res) => {
     try {
          const tshirt = await TShirt.create(req.body);

          return res.status(201).json({
               message: "T-shirt added successfully",
               tshirt,
          });
     } catch (err) {
          console.error("ADD TSHIRT ERROR:", err);

          return res.status(500).json({
               message: "Failed to add T-shirt",
               error: err.message,
          });
     }
});


// ==========================================
// GET ALL T-SHIRTS
// ==========================================
router.get("/", async (req, res) => {
     try {
          const tshirts = await TShirt.find().sort({
               createdAt: -1,
          });

          return res.status(200).json(tshirts);
     } catch (err) {
          console.error("GET TSHIRTS ERROR:", err);

          return res.status(500).json({
               message: "Failed to fetch T-shirts",
               error: err.message,
          });
     }
});


// ==========================================
// GET SINGLE T-SHIRT
// ==========================================
router.get("/:id", async (req, res) => {
     try {
          // Validate MongoDB ID
          if (
               !mongoose.Types.ObjectId.isValid(
                    req.params.id
               )
          ) {
               return res.status(400).json({
                    message: "Invalid T-shirt ID",
               });
          }

          const tshirt = await TShirt.findById(
               req.params.id
          );

          if (!tshirt) {
               return res.status(404).json({
                    message: "T-shirt not found",
               });
          }

          return res.status(200).json(tshirt);
     } catch (err) {
          console.error("GET SINGLE TSHIRT ERROR:", err);

          return res.status(500).json({
               message: "Failed to fetch T-shirt",
               error: err.message,
          });
     }
});


// ==========================================
// UPDATE T-SHIRT
// ==========================================
router.put("/update/:id", async (req, res) => {
     try {
          // Validate MongoDB ID
          if (
               !mongoose.Types.ObjectId.isValid(
                    req.params.id
               )
          ) {
               return res.status(400).json({
                    message: "Invalid T-shirt ID",
               });
          }

          const updated = await TShirt.findByIdAndUpdate(
               req.params.id,
               req.body,
               {
                    new: true,
                    runValidators: true,
               }
          );

          if (!updated) {
               return res.status(404).json({
                    message: "T-shirt not found",
               });
          }

          return res.status(200).json({
               message: "T-shirt updated successfully",
               tshirt: updated,
          });
     } catch (err) {
          console.error("UPDATE TSHIRT ERROR:", err);

          return res.status(500).json({
               message: "Failed to update T-shirt",
               error: err.message,
          });
     }
});


// ==========================================
// DELETE T-SHIRT
// ==========================================
router.delete("/delete/:id", async (req, res) => {
     try {
          // Validate MongoDB ID
          if (
               !mongoose.Types.ObjectId.isValid(
                    req.params.id
               )
          ) {
               return res.status(400).json({
                    message: "Invalid T-shirt ID",
               });
          }

          const deleted = await TShirt.findByIdAndDelete(
               req.params.id
          );

          if (!deleted) {
               return res.status(404).json({
                    message: "T-shirt not found",
               });
          }

          return res.status(200).json({
               message: "T-shirt deleted successfully",
          });
     } catch (err) {
          console.error("DELETE TSHIRT ERROR:", err);

          return res.status(500).json({
               message: "Failed to delete T-shirt",
               error: err.message,
          });
     }
});

export default router;