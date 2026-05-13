import express from "express";
import Product from "../../Schema/productSchema.js";


const router = express.Router();

// GET ALL PRODUCTS (Combined)
router.get("/", async (req, res) => {
     try {
          const products = await Product.find();


          const transformedItems = [...products,].map((item) => {
               const obj = item.toObject();

               if (obj.image?.startsWith("E-frontend/src/assets/")) {
                    obj.image = `http://localhost:${process.env.PORT || 7000}/assets/${obj.image.replace("E-frontend/src/assets/", "")}`;
               }

               if (Array.isArray(obj.gallery)) {
                    obj.gallery = obj.gallery.map((img) =>
                         img?.startsWith("E-frontend/src/assets/") ? `http://localhost:${process.env.PORT || 7000}/assets/${img.replace("E-frontend/src/assets/", "")}` : img
                    );
               }

               return obj;
          });

          res.status(200).json(transformedItems);
     } catch (err) {
          res.status(500).json({ message: "Server error", error: err.message });
     }
});

// Electronics CRUD
router.post("/add", async (req, res) => {
     try {
          const electronics = await Product.create(req.body);
          res.status(201).json({ message: "Electronics added successfully", electronics });
     } catch (err) {
          res.status(500).json({ message: "Error adding electronics", error: err.message });
     }
});

router.get("/electronics", async (req, res) => {
     try {
          const electronics = await Product.find().sort({ createdAt: -1 });
          res.status(200).json(electronics);
     } catch (err) {
          res.status(500).json({ message: "Error fetching electronics", error: err.message });
     }
});

router.put("/update/:id", async (req, res) => {
     try {
          const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
          if (!updated) return res.status(404).json({ message: "Electronics not found" });
          res.json(updated);
     } catch (err) {
          res.status(500).json({ message: "Error updating electronics", error: err.message });
     }
});

router.delete("/delete/:id", async (req, res) => {
     try {
          const deleted = await Product.findByIdAndDelete(req.params.id);
          if (!deleted) return res.status(404).json({ message: "Electronics not found" });
          res.json({ message: "Electronics deleted successfully" });
     } catch (err) {
          res.status(500).json({ message: "Error deleting electronics", error: err.message });
     }
});

export default router;
