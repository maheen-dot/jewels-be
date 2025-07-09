const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    productType: { 
      type: String,
      enum: ["Ring", "Necklace", "Earring", "Bangle"],
      required: true 
    },
    name: { type: String, required: true },
    image: { type: String, required: true },
    basePrice: { type: Number, required: true },
    customization: {
      // Common for all products
      metalType: { type: String, required: true }, // "Gold", "Silver", etc.
      metalColor: { type: String, required: true }, // Hex code
      
      // Ring-specific
      ringSize: { 
        type: Number,
        required: function() { return this.productType === "Ring"; },
        min: 4,
        max: 12 
      },
      
      // Necklace-specific
      chainLength: {
        type: Number,
        required: function() { return this.productType === "Necklace"; }
      },
      
      // Gemstones (required for rings/necklaces, optional for others)
      gemstones: [{
        position: { type: String, required: true }, // "main", "side1", "side2"
        name: { type: String, required: true }, // "Sapphire", "Emerald"
        color: { type: String, required: true } // Hex code
      }]
    },
    quantity: { type: Number, min: 1, max: 10, default: 1 },
    finalPrice: { type: Number, required: true }
  }],
  shippingInfo: {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    zipCode: { type: String, required: true }
  },
  status: {
    type: String,
    enum: ["Confirmed", "Processing", "Shipped", "Delivered"],
    default: "Confirmed"
  }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);