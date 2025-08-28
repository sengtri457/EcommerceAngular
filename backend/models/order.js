const mongoose = require("mongoose");
const itemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: String,
    price: Number,
    qty: Number,
    image: String,
    color: String,
    size: String,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    items: [itemSchema],
    subtotal: Number,
    shipping: Number,
    total: Number,
    status: {
      type: String,
      enum: ["created", "paid", "shipped", "delivered"],
      default: "created",
    },
    customer: {
      name: String,
      email: String,
      address: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
