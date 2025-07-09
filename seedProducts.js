// /backend/seedProducts.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./models/Product");
const availableProducts = require("./data/availableProducts");

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log(" MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

const seedProducts = async () => {
  try {
    const existing = await Product.find();
    if (existing.length) {
      console.log(" Products already exist. Skipping seeding.");
      process.exit(0);
    }

    const cleanProducts = availableProducts.map(({ id, ...rest }) => rest);
    const inserted = await Product.insertMany(cleanProducts);

    console.log(`Inserted ${inserted.length} products`);
    process.exit(0);
  } catch (error) {
    console.error("Error inserting products:", error);
    process.exit(1);
  }
};

seedProducts();
