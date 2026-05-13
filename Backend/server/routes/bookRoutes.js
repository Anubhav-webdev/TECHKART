import express from "express";
import mongoose from "mongoose";

import Book from "../../Schema/bookSchema.js";

const router = express.Router();


// ==========================================
// ADD BOOK
// ==========================================
router.post("/add", async (req, res) => {
     try {
          const book = await Book.create(req.body);

          return res.status(201).json({
               message: "Book added successfully",
               book,
          });
     } catch (err) {
          console.error("ADD BOOK ERROR:", err);

          return res.status(500).json({
               message: "Error adding book",
               error: err.message,
          });
     }
});


// ==========================================
// GET ALL BOOKS
// ==========================================
router.get("/", async (req, res) => {
     try {
          const books = await Book.find().sort({
               createdAt: -1,
          });

          return res.status(200).json(books);
     } catch (err) {
          console.error("GET BOOKS ERROR:", err);

          return res.status(500).json({
               message: "Error fetching books",
               error: err.message,
          });
     }
});


// ==========================================
// GET SINGLE BOOK
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
                    message: "Invalid book ID",
               });
          }

          const book = await Book.findById(
               req.params.id
          );

          if (!book) {
               return res.status(404).json({
                    message: "Book not found",
               });
          }

          return res.status(200).json(book);
     } catch (err) {
          console.error("GET SINGLE BOOK ERROR:", err);

          return res.status(500).json({
               message: "Error fetching book",
               error: err.message,
          });
     }
});


// ==========================================
// UPDATE BOOK
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
                    message: "Invalid book ID",
               });
          }

          const updated = await Book.findByIdAndUpdate(
               req.params.id,
               req.body,
               {
                    new: true,
                    runValidators: true,
               }
          );

          if (!updated) {
               return res.status(404).json({
                    message: "Book not found",
               });
          }

          return res.status(200).json({
               message: "Book updated successfully",
               book: updated,
          });
     } catch (err) {
          console.error("UPDATE BOOK ERROR:", err);

          return res.status(500).json({
               message: "Error updating book",
               error: err.message,
          });
     }
});


// ==========================================
// DELETE BOOK
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
                    message: "Invalid book ID",
               });
          }

          const deleted = await Book.findByIdAndDelete(
               req.params.id
          );

          if (!deleted) {
               return res.status(404).json({
                    message: "Book not found",
               });
          }

          return res.status(200).json({
               message: "Book deleted successfully",
          });
     } catch (err) {
          console.error("DELETE BOOK ERROR:", err);

          return res.status(500).json({
               message: "Error deleting book",
               error: err.message,
          });
     }
});

export default router;