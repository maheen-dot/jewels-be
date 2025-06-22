const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const authRoutes = require("./routes/auth");

dotenv.config();

const app = express();

// ✅ Configure CORS properly
app.use(cors({
  origin: "http://localhost:5173", // your frontend URL
  credentials: true,               // allow cookies
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

app.get("/", (req, res) => {
  res.send("Server is running...");
});

app.use("/api/auth", authRoutes);

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on http://localhost:${process.env.PORT || 5000}`);
});
