const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  productType: { type: String, enum: ["Ring", "Necklace", "Earring", "Bangle"], required: true },
  quantity: { type: Number, default: 1, min: 1, max: 10 },
  customization: {
    metalType: { type: String, required: true },
    metalColor: { type: String, required: true },
    gemstones: [{
      name: { type: String, required: true },
      color: { type: String, required: true },
      position: { type: String } // "main", "side", "pendant", etc.
    }],
    // Product-specific fields
    ringSize: { type: Number, min: 4, max: 12 },       // For rings
    chainLength: { type: Number },                     // For necklaces
  }
});

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [cartItemSchema]
}, { timestamps: true });

module.exports = mongoose.model("Cart", cartSchema);