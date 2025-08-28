const express = require("express");
const Router = express.Router;
const { body, validationResult } = require("express-validator");
const Order = require("../models/order.js");
const Product = require("../models/product.js");
const { authRequired } = require("../middleware/auth.js");

const router = Router();

router.post(
  "/",
  [
    body("items").isArray({ min: 1 }),
    body("customer.name").notEmpty(),
    body("customer.email").isEmail(),
    body("customer.address").notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { items, customer } = req.body;
    // Validate products + compute totals
    const productIds = items.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: productIds } });
    const map = new Map(products.map((p) => [p._id.toString(), p]));

    const normalized = items.map((i) => {
      const p = map.get(i.productId);
      normalized.push({
        product: p._id,
        name: p.name,
        price: p.price,
        qty: Number(i.qty),
        image: p.images?.[0] || p.image || "",
        color: i.color || "",
        size: i.size || "",
      });
      if (!p) throw new Error("Invalid product");
      return {
        product: p._id,
        name: p.name,
        price: p.price,
        qty: i.qty,
        image: p.image,
      };
    });

    const subtotal = normalized.reduce((s, i) => s + i.price * i.qty, 0);
    const shipping = subtotal > 100 ? 0 : 8; // simple rule
    const total = subtotal + shipping;

    const order = await Order.create({
      items: normalized,
      subtotal,
      shipping,
      total,
      customer,
    });
    res.json({ id: order._id, total, status: order.status });
  }
);

router.get("/", authRequired, async (req, res) => {
  // Example: list orders for authenticated user (admin gets all)
  const filter = req.user.role === "admin" ? {} : { user: req.user.id };
  const orders = await Order.find(filter).sort({ createdAt: -1 });
  res.json(orders);
});
module.exports = router;
