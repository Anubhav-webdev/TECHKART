import express from "express";
import TShirt from "../../Schema/tShirtsSchema.js";

const router = express.Router();

router.post("/add", async (req, res) => {
     try {
          const tshirt = await TShirt.create(req.body);
          res.status(201).json({ message: "T-shirt added", tshirt });
     } catch (err) {
          res.status(500).json({ error: err.message });
     }
});

router.get("/", async (req, res) => {
     try {
          const tshirts = await TShirt.find().sort({ createdAt: -1 });
          res.json(tshirts);
     } catch (err) {
          res.status(500).json({ error: err.message });
     }
});

router.put("/update/:id", async (req, res) => {
     try {
          const updated = await TShirt.findByIdAndUpdate(req.params.id, req.body, { new: true });
          res.json(updated);
     } catch (err) {
          res.status(500).json({ error: err.message });
     }
});

router.delete("/delete/:id", async (req, res) => {
     try {
          await TShirt.findByIdAndDelete(req.params.id);
          res.json({ message: "Deleted" });
     } catch (err) {
          res.status(500).json({ error: err.message });
     }
});

export default router;
