// routers/cart.routes.js
const express = require("express");
const { authRequired } = require("../middleware/auth");
const Cart = require("../models/cart");
const Product = require("../models/product");

const router = express.Router();

// Get current user's cart
router.get("/", authRequired, async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate(
      "items.product"
    );
    res.json(cart || { user: req.user.id, items: [] });
  } catch (e) {
    next(e);
  }
});

// Replace cart (e.g., after login)
router.put("/", authRequired, async (req, res, next) => {
  try {
    const items = Array.isArray(req.body.items) ? req.body.items : [];
    // validate & normalize
    const productIds = items.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: productIds } });
    const map = new Map(products.map((p) => [String(p._id), p]));

    const normalized = items.map((i) => {
      const p = map.get(i.productId);
      if (!p) throw new Error("Invalid product");
      return { product: p._id, qty: Math.max(1, Number(i.qty || 1)) };
    });

    const cart = await Cart.findOneAndUpdate(
      { user: req.user.id },
      { $set: { items: normalized, updatedAt: new Date() } },
      { upsert: true, new: true }
    ).populate("items.product");

    res.json(cart);
  } catch (e) {
    next(e);
  }
});

// Add one item
router.post("/add", authRequired, async (req, res, next) => {
  try {
    const { productId, qty = 1 } = req.body;
    const p = await Product.findById(productId);
    if (!p) return res.status(400).json({ error: "Invalid product" });

    const cart =
      (await Cart.findOne({ user: req.user.id })) ||
      new Cart({ user: req.user.id, items: [] });
    const idx = cart.items.findIndex(
      (i) => String(i.product) === String(productId)
    );
    if (idx >= 0) cart.items[idx].qty += Number(qty);
    else cart.items.push({ product: p._id, qty: Number(qty) });

    cart.updatedAt = new Date();
    await cart.save();
    await cart.populate("items.product");
    res.json(cart);
  } catch (e) {
    next(e);
  }
});

// Remove item
router.delete("/item/:productId", authRequired, async (req, res, next) => {
  try {
    const productId = req.params.productId;
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.json({ user: req.user.id, items: [] });

    cart.items = cart.items.filter(
      (i) => String(i.product) !== String(productId)
    );
    cart.updatedAt = new Date();
    await cart.save();
    await cart.populate("items.product");
    res.json(cart);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
