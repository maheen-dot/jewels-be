const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const { errorHandler } = require("./middleware/errorMiddleware"); // Add error handling

// Routes
const authRoutes = require("./routes/auth");
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require("./routes/orderRoutes");
//const editorRoutes = require('./routes/EditorRoutes');
const designRoutes = require('./routes/designRoutes'); // Import Design model
const reviewRoutes = require('./routes/reviewRoutes');

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json({limit: '50mb'})); // Increased limit for large JSON payloads
app.use(express.urlencoded({ limit: '50mb', extended: true })); // Increased limit for large JSON payloads

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Basic Route
app.get("/", (req, res) => {
  res.send("Jewels E-Commerce API is running...");
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
//app.use('/api/Editor', editorRoutes);
app.use("/api/designs", designRoutes); // Add design routes
app.use("/api/reviews",reviewRoutes);
// 404 Handler (Must be after all routes)
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Error Handling Middleware (Must be last!)
app.use(errorHandler);

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});