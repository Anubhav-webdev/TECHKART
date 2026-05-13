
import express from "express";
import Product from "../../Schema/productSchema.js";

const router = express.Router();

/* =========================================
   GET ALL PRODUCTS
========================================= */
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Failed to fetch products",
    });
  }
});

/* =========================================
   RESERVE PRODUCT STOCK
========================================= */
router.post("/:id/reserve", async (req, res) => {
  try {
    const { quantity = 1 } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        message: "Out of stock",
      });
    }

    product.stock -= quantity;

    await product.save();

    res.status(200).json({
      message: "Stock reserved",
      stock: product.stock,
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Reserve failed",
    });
  }
});

/* =========================================
   RELEASE PRODUCT STOCK
========================================= */
router.post("/:id/release", async (req, res) => {
  try {
    const { quantity = 1 } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    product.stock += quantity;

    await product.save();

    res.status(200).json({
      message: "Stock released",
      stock: product.stock,
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Release failed",
    });
  }
});

export default router;

