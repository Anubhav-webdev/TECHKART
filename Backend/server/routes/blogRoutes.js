import express from "express";
import Blog from "../../Schema/blogSchema.js";

const router = express.Router();

router.post("/add", async (req, res) => {
     try {
          const blog = await Blog.create(req.body);
          res.status(201).json({ message: "Blog added successfully", blog });
     } catch (err) {
          res.status(500).json({ message: "Error adding blog", error: err.message });
     }
});

router.get("/", async (req, res) => {
     try {
          const blogs = await Blog.find().sort({ createdAt: -1 });
          res.status(200).json(blogs);
     } catch (err) {
          res.status(500).json({ message: "Error fetching blogs", error: err.message });
     }
});

router.put("/update/:id", async (req, res) => {
     try {
          const updated = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
          if (!updated) return res.status(404).json({ message: "Blog not found" });
          res.json(updated);
     } catch (err) {
          res.status(500).json({ message: "Error updating blog", error: err.message });
     }
});

router.delete("/delete/:id", async (req, res) => {
     try {
          const deleted = await Blog.findByIdAndDelete(req.params.id);
          if (!deleted) return res.status(404).json({ message: "Blog not found" });
          res.json({ message: "Blog deleted successfully" });
     } catch (err) {
          res.status(500).json({ message: "Error deleting blog", error: err.message });
     }
});

export default router;
