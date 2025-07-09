const mongoose = require("mongoose");

// Shared color schema for both metal and gem colors
const colorDetailSchema = new mongoose.Schema({
  id: String,             // mesh name like "Gem 1" or "Metal Body"
  materialType: String,   // material like "Emerald" or "Gold"
  color: String           // hex code like "#50C878"
}, { _id: false });

// Schema for each item in the cart
const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  category: {
    type: String,
    enum: ["Rings", "Necklaces", "Ear Rings", "Bangles"],
    required: true
  },
  quantity: { type: Number, default: 1, min: 1, max: 10 },
  bodyColors: { type: [colorDetailSchema], default: [] },
  gemColors: { type: [colorDetailSchema], default: [] },
  ringSize: { type: Number, min: 4, max: 12 },
  chainLength: { type: String }
});

// schema for the entire cart
const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    items: [cartItemSchema]
  },
  { timestamps: true }
);


module.exports = mongoose.model("Cart", cartSchema);
