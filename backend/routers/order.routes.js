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
    body("items.*.productId").notEmpty().withMessage("productId is required"),
    body("items.*.qty").isInt({ min: 1 }).withMessage("qty must be >= 1"),
    body("customer.name").notEmpty(),
    body("customer.email").isEmail(),
    body("customer.address").notEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { items, customer } = req.body;

      // Validate products + compute totals
      const productIds = items.map((i) => String(i.productId));
      const products = await Product.find({ _id: { $in: productIds } });
      const map = new Map(products.map((p) => [p._id.toString(), p]));

      // Build normalized items WITHOUT referencing `normalized` inside itself
      const normalized = items.map((i) => {
        const pid = String(i.productId);
        const p = map.get(pid);
        if (!p) {
          throw new Error(`Invalid product: ${pid}`);
        }
        return {
          product: p._id,
          name: p.name,
          price: Number(p.price),
          qty: Number(i.qty),
          image: p.images?.[0] || p.image || "",
          color: i.color || "",
          size: i.size || "",
        };
      });

      const subtotal = normalized.reduce(
        (sum, it) => sum + it.price * it.qty,
        0
      );
      const shipping = subtotal > 100 ? 0 : 8; // simple rule
      const total = subtotal + shipping;

      const order = await Order.create({
        items: normalized,
        subtotal,
        shipping,
        total,
        customer,
      });

      return res.json({ id: order._id, total, status: order.status });
    } catch (err) {
      // If it's a validation problem we created above, send 400; otherwise 500
      if (String(err.message || "").startsWith("Invalid product")) {
        return res.status(400).json({ error: err.message });
      }
      console.error(err);
      return res.status(500).json({ error: "Unable to create order" });
    }
  }
);

router.get("/", authRequired, async (req, res) => {
  // Example: list orders for authenticated user (admin gets all)
  const filter = req.user.role === "admin" ? {} : { user: req.user.id };
  const orders = await Order.find(filter).sort({ createdAt: -1 });
  res.json(orders);
});
module.exports = router;
