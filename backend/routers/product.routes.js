// routers/product.routes.js
const express = require("express");
const Product = require("../models/product");
const { authRequired, adminOnly } = require("../middleware/auth");

const router = express.Router();
const toArray = (v) =>
  Array.isArray(v)
    ? v
    : typeof v === "string"
    ? v
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

const normalizeVariant = (v = {}) => ({
  color: typeof v.color === "string" ? v.color : "",
  images: toArray(v.images),
  sizes: Array.isArray(v.sizes)
    ? v.sizes
        .map((s) => ({
          label: String(s.label || ""),
          stock: Number(s.stock ?? 0),
        }))
        .filter((s) => s.label)
    : [],
});

const buildPayload = (body = {}) => {
  const payload = {
    name: body.name,
    slug: body.slug,
    description: body.description,
    brand: body.brand,
    price: Number(body.price),
    image: body.image,
    images: toArray(body.images), // ✅ ensure array
    category: body.category,
    tags: toArray(body.tags),
    stock: Number(body.stock ?? 0),
    rating: Number(body.rating ?? 0),
    specs:
      body.specs && typeof body.specs === "object" ? body.specs : undefined,
    variants: Array.isArray(body.variants)
      ? body.variants.map(normalizeVariant)
      : [],
  };
  Object.keys(payload).forEach(
    (k) => payload[k] === undefined && delete payload[k]
  );
  return payload;
};

router.get("/", async (req, res, next) => {
  try {
    const {
      q,
      category,
      min,
      max,
      sort = "createdAt",
      order = "desc",
      page = 1,
      limit = 12,
    } = req.query;

    // filter
    const query = {};
    if (q) query.$text = { $search: q };
    if (category) query.category = category;
    if (min || max) {
      query.price = {
        ...(min ? { $gte: Number(min) } : {}),
        ...(max ? { $lte: Number(max) } : {}),
      };
    }

    // whitelist sort fields to avoid injection
    const allowedSort = new Set(["createdAt", "price", "rating", "name"]);
    const sortField = allowedSort.has(String(sort))
      ? String(sort)
      : "createdAt";
    const sortDir = String(order).toLowerCase() === "asc" ? 1 : -1;
    const sortObj = { [sortField]: sortDir };

    // pagination
    const pageNum = Math.max(1, Number(page) || 1);
    const lim = Math.min(50, Math.max(1, Number(limit) || 12));
    const skip = (pageNum - 1) * lim;

    const [items, total] = await Promise.all([
      Product.find(query).sort(sortObj).skip(skip).limit(lim),
      Product.countDocuments(query),
    ]);

    res.json({ items, total, page: pageNum, pages: Math.ceil(total / lim) });
  } catch (e) {
    next(e);
  }
});
// Public detail
router.get("/:id", async (req, res, next) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ error: "Not found" });
    res.json(p);
  } catch (e) {
    next(e);
  }
});
// Admin: create
router.post("/", authRequired, adminOnly, async (req, res, next) => {
  try {
    const p = await Product.create(buildPayload(req.body));
    res.status(201).json(p);
  } catch (e) {
    next(e);
  }
});

// Admin: update
router.put("/:id", authRequired, adminOnly, async (req, res, next) => {
  try {
    const p = await Product.findByIdAndUpdate(
      req.params.id,
      buildPayload(req.body),
      { new: true }
    );
    if (!p) return res.status(404).json({ error: "Not found" });
    res.json(p);
  } catch (e) {
    next(e);
  }
});

// Admin: delete
router.delete("/:id", authRequired, adminOnly, async (req, res, next) => {
  try {
    const r = await Product.findByIdAndDelete(req.params.id);
    if (!r) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
