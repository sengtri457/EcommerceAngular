// models/product.js
const mongoose = require("mongoose");

const sizeSchema = new mongoose.Schema(
  {
    label: { type: String, required: true }, // e.g. "US 8"
    stock: { type: Number, default: 0 },
  },
  { _id: false }
);

const variantSchema = new mongoose.Schema(
  {
    color: { type: String, required: true }, // e.g. "Black/Stone"
    images: [String], // color-specific gallery
    sizes: [sizeSchema],
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: String,
    brand: String,
    price: { type: Number, required: true },
    image: String, // main cover
    images: [String], // ✅ gallery
    category: String,
    tags: [String],
    stock: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    variants: [variantSchema], // ✅ color/size
    specs: { type: Map, of: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
