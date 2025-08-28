require("dotenv/config");
const mongoose = require("mongoose");
const Product = require("../models/product.js");

const products = [
  {
    name: "Minimal Sneaker",
    slug: "minimal-sneaker",
    description: "Ultra-clean silhouette in monochrome.",
    price: 89,
    image: "https://picsum.photos/seed/sneaker1/800/800?grayscale",
    category: "shoes",
    tags: ["minimal", "blackwhite"],
    stock: 24,
    rating: 4.6,
  },
  {
    name: "Monochrome Hoodie",
    slug: "monochrome-hoodie",
    description: "Soft fleece, sharp lines.",
    price: 65,
    image: "https://picsum.photos/seed/hoodie1/800/800?grayscale",
    category: "apparel",
    tags: ["hoodie"],
    stock: 40,
    rating: 4.4,
  },
  {
    name: "White Tee",
    slug: "white-tee",
    description: "Heavyweight cotton, crisp and clean.",
    price: 25,
    image: "https://picsum.photos/seed/tee1/800/800?grayscale",
    category: "apparel",
    tags: ["tee"],
    stock: 100,
    rating: 4.8,
  },
  {
    name: "Black Denim",
    slug: "black-denim",
    description: "Straight cut, deep black.",
    price: 59,
    image: "https://picsum.photos/seed/denim1/800/800?grayscale",
    category: "apparel",
    tags: ["denim"],
    stock: 35,
    rating: 4.2,
  },
  {
    name: "Contrast Backpack",
    slug: "contrast-backpack",
    description: "Structured storage with bold contrast.",
    price: 72,
    image: "https://picsum.photos/seed/bag1/800/800?grayscale",
    category: "accessories",
    tags: ["bag"],
    stock: 18,
    rating: 4.1,
  },
  {
    name: "Studio Cap",
    slug: "studio-cap",
    description: "Clean cap with subtle texture.",
    price: 22,
    image: "https://picsum.photos/seed/cap1/800/800?grayscale",
    category: "accessories",
    tags: ["cap"],
    stock: 50,
    rating: 4.0,
  },
];

await Product.updateOne(
  { slug: "air-lite-01" },
  {
    $set: {
      name: "Air Lite 01",
      brand: "Monochrome Lab",
      description: "Cushioned ride with breathable sidewall.",
      price: 200,
      category: "shoes",
      tags: ["running", "women"],
      images: [
        "https://picsum.photos/seed/airlite01a/1200/800?grayscale",
        "https://picsum.photos/seed/airlite01b/1200/800?grayscale",
      ],
      variants: [
        {
          color: "Black/Stone",
          images: [
            "https://picsum.photos/seed/airlite01c/1200/800?grayscale",
            "https://picsum.photos/seed/airlite01d/1200/800?grayscale",
          ],
          sizes: [
            { label: "US 6", stock: 10 },
            { label: "US 7", stock: 0 },
            { label: "US 8", stock: 8 },
            { label: "US 9", stock: 5 },
          ],
        },
        {
          color: "White/Gum",
          images: ["https://picsum.photos/seed/airlite01e/1200/800?grayscale"],
          sizes: [
            { label: "US 6", stock: 4 },
            { label: "US 7", stock: 7 },
            { label: "US 8", stock: 0 },
            { label: "US 9", stock: 2 },
          ],
        },
      ],
      specs: { Upper: "Mesh", Midsole: "Foam", Outsole: "Rubber", Drop: "8mm" },
    },
  },
  { upsert: true }
);
