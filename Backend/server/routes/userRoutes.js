// ================== IMPORTS ==================
import express from "express";
import { User } from "../../Schema/userSchema.js";
import Product from "../../Schema/productSchema.js";
import Book from "../../Schema/bookSchema.js";
import TShirt from "../../Schema/tShirtsSchema.js";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// ================== DEMO EMAIL ==================
const sendOrderEmail = async (to, order) => {
  const demoRef = `EMAIL-REF-${Math.random()
    .toString(36)
    .substring(2, 10)
    .toUpperCase()}`;

  order.emailRef = demoRef;
  order.emailSent = false;
  return demoRef;
};

// ================== AVATAR UPLOAD ==================
const avatarsDir = path.resolve("uploads", "avatars");
if (!fs.existsSync(avatarsDir)) fs.mkdirSync(avatarsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: avatarsDir,
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// =================================================
// ================== HELPERS =======================
// =================================================
const findItem = async (id) => {
  let doc = await Product.findById(id).select("name stock price");
  if (doc) return doc;

  doc = await Book.findById(id).select("title stock price");
  if (doc) return doc;

  doc = await TShirt.findById(id).select("name stock price");
  if (doc) return doc;

  return null;
};

// =================================================
// ================== PLACE ORDER ===================
// =================================================
router.post("/:id/orders", async (req, res) => {
  const { items, billing, total } = req.body;

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Order items required" });
    }

    const orderItems = [];
    const insufficient = [];

    // -------- Build order items on SERVER --------
    for (const it of items) {
      if (!it?.product) continue;

      const product = await findItem(it.product);
      if (!product) {
        insufficient.push({
          product: it.product,
          reason: "Product not found",
        });
        continue;
      }

      const qty = Number(it.quantity) || 1;
      const stock = Number(product.stock || 0);

      if (stock < qty) {
        insufficient.push({
          product: it.product,
          name: product.name || product.title,
          available: stock,
          requested: qty,
        });
        continue;
      }

      orderItems.push({
        product: it.product,
        quantity: qty,
        price: Number(it.price) || product.price || 0,
        name: product.name || product.title || "Product Item",
      });
    }

    if (insufficient.length > 0) {
      return res.status(400).json({
        message: "Insufficient stock",
        details: insufficient,
      });
    }

    // -------- Create order --------
    const trackingRef = `ORD-${Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase()}`;

    const order = {
      items: orderItems,              // ✅ FIX #1
      billing,
      total,
      status: "placed",
      trackingRef,
      createdAt: new Date(),
    };

    user.orders.push(order);
    user.cart = [];
    await user.save();

    const createdOrder = user.orders[user.orders.length - 1];

    // -------- Demo email ref --------
    const emailRef = await sendOrderEmail(
      user.email || "demo@example.com",
      createdOrder
    );
    createdOrder.emailRef = emailRef;

    user.markModified("orders");
    await user.save();

    res.status(201).json({
      message: "Order placed successfully",
      order: createdOrder,
    });
  } catch (err) {
    console.error("Order error:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

// =================================================
// ================== TRACK ORDER ==================
// =================================================
router.get("/orders/track/:ref", async (req, res) => {
  try {
    const ref = (req.params.ref || "").trim();
    if (!ref) {
      return res.status(400).json({ message: "Tracking reference required" });
    }

    const user = await User.findOne(
      { "orders.trackingRef": ref },
      { "orders.$": 1, username: 1, email: 1 }
    );

    if (!user || !user.orders.length) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      order: user.orders[0],
      owner: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// =================================================
// ================== USER PROFILE ENDPOINTS ========
// =================================================

// Get user public profile (no password)
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: "User not found" });
    const u = user.toObject();
    if (!u.id && u._id) u.id = u._id;
    res.status(200).json({ user: u });
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user orders
router.get("/:id/orders", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('orders');
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ orders: user.orders || [] });
  } catch (err) {
    console.error("Get orders error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user addresses
router.get("/:id/addresses", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('addresses');
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ addresses: user.addresses || [] });
  } catch (err) {
    console.error("Get addresses error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Add an address
router.post("/:id/addresses", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const addr = req.body;
    if (!addr || !addr.address || !addr.label) return res.status(400).json({ message: "Invalid address" });
    user.addresses.push(addr);
    user.markModified('addresses');
    await user.save();
    res.status(200).json({ addresses: user.addresses });
  } catch (err) {
    console.error("Add address error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Remove an address
router.delete("/:id/addresses/:addressId", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.addresses.pull(req.params.addressId);
    await user.save();
    res.status(200).json({ addresses: user.addresses });
  } catch (err) {
    console.error("Remove address error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// =================================================
// ================== UPDATE ORDER STATUS ===========
// =================================================
router.put("/:id/orders/:orderId/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ message: "Status required" });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const order = user.orders.id(req.params.orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    user.markModified("orders");
    await user.save();

    res.status(200).json({ message: "Order status updated", order });
  } catch (err) {
    console.error("Update order status error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// =================================================
// ================== UPDATE USER PROFILE ===========
// =================================================
router.put('/:id', async (req, res) => {
  try {
    const update = {};
    const fields = ['username', 'email', 'phone', 'fullName', 'birthday'];
    for (const f of fields) if (req.body[f] !== undefined) update[f] = req.body[f];

    // Prevent password updates through this route
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const u = user.toObject(); if (!u.id && u._id) u.id = u._id;
    res.status(200).json({ message: 'Profile updated', user: u });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// =================================================
// ================== AVATAR UPLOAD =================
// =================================================
router.post('/:id/avatar', upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Save avatar path (serve via /uploads)
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    user.avatar = avatarUrl;
    await user.save();

    res.status(200).json({ message: 'Avatar uploaded', avatar: avatarUrl });
  } catch (err) {
    console.error('Avatar upload error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// =================================================
// ================== CART ENDPOINTS ==============
// =================================================
// These endpoints are required by CartContext (frontend) for JSON cart sync.
// Without them, frontend fetch(...).then(res=>res.json()) hits a 404 HTML page
// and throws: Unexpected token '<' ... is not valid JSON.
router.get('/:id/cart', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('cart');
    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.status(200).json({
      cart: user.cart || [],
    });
  } catch (err) {
    console.error('Get cart error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.put('/:id/cart', async (req, res) => {
  try {
    const { cart } = req.body || {};

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!Array.isArray(cart)) {
      return res.status(400).json({ message: 'cart must be an array' });
    }

    // Expected from frontend: [{ product: <id>, quantity: <number> }]
    const normalized = cart
      .filter(Boolean)
      .map((it) => ({
        product: it.product || it._id || it.id,
        quantity: Number(it.quantity) || 0,
      }))
