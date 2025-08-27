const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const { errorHandler } = require("./middleware/errorMiddleware");
const TimeoutMiddleware = require("./middleware/TimeoutMiddleware");
const loggerMiddleware = require("./middleware/loggerMiddleware");
const path = require("path");

dotenv.config();
const app = express();

// ---------------- Visitor Counter ----------------
let totalVisitors = 0;

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Add timeout and logging middleware
app.use(TimeoutMiddleware());
app.use(loggerMiddleware);

//  Count all **non-API page hits** as visitors
app.post("/api/visitor", (req, res) => {
  totalVisitors++;
  res.json({ success: true });
});

// ---------------- Database ----------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ---------------- Basic Route ----------------
app.get("/", (req, res) => {
  res.send("Jewels E-Commerce API is running...");
});

// ---------------- Routes ----------------
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const designRoutes = require("./routes/designRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const adminRoutes = require("./routes/adminRoutes");
const contactRoutes = require("./routes/contactRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/designs", designRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/contact", contactRoutes);




app.get("/api/visitor", (req, res) => {
  res.json({ totalVisitors });
});

// Serve static images from /uploads with long caching
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    setHeaders: (res) => {
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    },
  })
);

// ---------------- 404 Handler ----------------
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ---------------- Error Handling ----------------
app.use(errorHandler);

// ---------------- Server ----------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});
