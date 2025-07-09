const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  link: { 
    type: String, 
    required: true, 
    unique: true 
  },
  category: { 
    type: String, 
    required: true,
    enum: ["Rings", "Necklaces", "Bangles", "Ear Rings"] 
  },
  price: { 
    type: Number, 
    required: true,
    min: 0 
  },
  image: { 
    type: String, 
    required: true 
  },
  model: { 
    type: String, 
    required: true 
  },
  isRing: { 
    type: Boolean, 
    default: false 
  },
  sizes: { 
    type: [Number], 
    default: [] 
  },
  description: { 
    type: String, 
    required: true 
  },
  materials: { 
    type: [String], 
    default: [],
    enum: ["Gold", "Silver", "Black", "Rose Gold", "Platinum", "Metal", "Copper"] 
  }
}, {
  timestamps: true
});

// Ensure unique index for link
productSchema.index({ link: 1 }, { unique: true });

module.exports = mongoose.model("Product", productSchema);