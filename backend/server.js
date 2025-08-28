require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");

// Routes
const productRoutes = require("./routers/product.routes");
const orderRoutes = require("./routers/order.routes");
const authRoutes = require("./routers/auth.routes");
const cartRouts = require("./routers/cart.routes");
const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;

// Connect to DB and then start server
(async () => {
  try {
    console.log("MONGO_URI:", process.env.MONGO_URI || "undefined");
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });

    console.log("✅ MongoDB connected:", mongoose.connection.host);

    // Mount routes only after DB is connected
    app.use("/api/products", productRoutes);
    app.use("/api/orders", orderRoutes);
    app.use("/api/auth", authRoutes);
    app.use("/api/cart", cartRouts);

    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
})();
