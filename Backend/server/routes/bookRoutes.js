import express from "express";
import Book from "../../Schema/bookSchema.js";

const router = express.Router();

router.post("/add", async (req, res) => {
     try {
          const book = await Book.create(req.body);
          res.status(201).json({ message: "Book added successfully", book });
     } catch (err) {
          res.status(500).json({ message: "Error adding book", error: err.message });
     }
});

router.get("/", async (req, res) => {
     try {
          const books = await Book.find().sort({ createdAt: -1 });
          res.status(200).json(books);
     } catch (err) {
          res.status(500).json({ message: "Error fetching books", error: err.message });
     }
});

router.put("/update/:id", async (req, res) => {
     try {
          const updated = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
          if (!updated) return res.status(404).json({ message: "Book not found" });
          res.json(updated);
     } catch (err) {
          res.status(500).json({ message: "Error updating book", error: err.message });
     }
});

router.delete("/delete/:id", async (req, res) => {
     try {
          const deleted = await Book.findByIdAndDelete(req.params.id);
          if (!deleted) return res.status(404).json({ message: "Book not found" });
          res.json({ message: "Book deleted successfully" });
     } catch (err) {
          res.status(500).json({ message: "Error deleting book", error: err.message });
     }
});

export default router;
