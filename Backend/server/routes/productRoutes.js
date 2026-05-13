import express from "express";
import Product from "../../Schema/productSchema.js";
import Book from "../../Schema/bookSchema.js";
import TShirt from "../../Schema/tShirtsSchema.js";

const router = express.Router();

// GET ALL PRODUCTS
router.get("/", async (req, res) => {
     try {
          console.log("📦 Fetching all products...");
          const products = await Product.find();
          const books = await Book.find();
          const tshirts = await TShirt.find();

          console.log(`✅ Found: ${products.length} products, ${books.length} books, ${tshirts.length} t-shirts`);

          const transformedItems = [...products, ...books, ...tshirts].map((item) => {
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
          console.error("❌ Products fetch error:", err);
          res.status(500).json({ message: "Server error", error: err.message });
     }
});
// GET TOTAL COUNT OF ALL PRODUCTS
router.get("/count", async (req, res) => {
     try {
          const [electronicsCount, booksCount, tshirtsCount] = await Promise.all([
               Product.countDocuments(),
               Book.countDocuments(),
               TShirt.countDocuments(),
          ]);

          const total = electronicsCount + booksCount + tshirtsCount;

          res.status(200).json({ total });
     } catch (err) {
          res.status(500).json({ message: "Server error", error: err.message });
     }
});

// RESERVE stock for an item (decrement if enough available) — supports Product, Book and TShirt
router.post('/:id/reserve', async (req, res) => {
     const qty = Math.max(1, Number(req.body.quantity) || 1);
     try {
          console.log(`🛒 Reserving ${qty} units of product ${req.params.id}...`);
          
          // Try each collection in order
          let updated = await Product.findOneAndUpdate(
               { _id: req.params.id, stock: { $gte: qty } },
               { $inc: { stock: -Math.abs(qty) } },
               { new: true }
          );
          if (updated) {
               console.log(`✅ Reserved from Product: ${updated._id}, remaining stock: ${updated.stock}`);
               return res.status(200).json({ message: 'Reserved', stock: updated.stock, type: 'product' });
          }

          updated = await Book.findOneAndUpdate(
               { _id: req.params.id, stock: { $gte: qty } },
               { $inc: { stock: -Math.abs(qty) } },
               { new: true }
          );
          if (updated) {
               console.log(`✅ Reserved from Book: ${updated._id}, remaining stock: ${updated.stock}`);
               return res.status(200).json({ message: 'Reserved', stock: updated.stock, type: 'book' });
          }

          updated = await TShirt.findOneAndUpdate(
               { _id: req.params.id, stock: { $gte: qty } },
               { $inc: { stock: -Math.abs(qty) } },
               { new: true }
          );
          if (updated) {
               console.log(`✅ Reserved from TShirt: ${updated._id}, remaining stock: ${updated.stock}`);
               return res.status(200).json({ message: 'Reserved', stock: updated.stock, type: 'tshirt' });
          }

          console.warn(`⚠️ Cannot reserve: insufficient stock or item not found for ${req.params.id}`);
          return res.status(400).json({ message: 'Insufficient stock or item not found' });
     } catch (err) {
          console.error('❌ Reserve endpoint error:', err);
          return res.status(500).json({ message: 'Server error', error: err.message });
     }
});

// RELEASE reserved stock for an item (increment) — supports Product, Book and TShirt
router.post('/:id/release', async (req, res) => {
     const qty = Math.max(1, Number(req.body.quantity) || 1);
     try {
          let updated = await Product.findOneAndUpdate(
               { _id: req.params.id },
               { $inc: { stock: Math.abs(qty) } },
               { new: true }
          );
          if (updated) return res.status(200).json({ message: 'Released', stock: updated.stock, type: 'product' });

          updated = await Book.findOneAndUpdate(
               { _id: req.params.id },
               { $inc: { stock: Math.abs(qty) } },
               { new: true }
          );
          if (updated) return res.status(200).json({ message: 'Released', stock: updated.stock, type: 'book' });

          updated = await TShirt.findOneAndUpdate(
               { _id: req.params.id },
               { $inc: { stock: Math.abs(qty) } },
               { new: true }
          );
          if (updated) return res.status(200).json({ message: 'Released', stock: updated.stock, type: 'tshirt' });

          return res.status(404).json({ message: 'Item not found' });
     } catch (err) {
          console.error('Release endpoint error:', err);
          return res.status(500).json({ message: 'Server error', error: err.message });
     }
});
export default router;








