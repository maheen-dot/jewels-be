const mongoose = require("mongoose");

const colorDetailSchema = new mongoose.Schema({
  id: String,             // mesh name like "Gem 1" or "Metal Body"
  materialType: String,   // e.g., "Emerald", "Gold"
  color: String           // e.g., "#50C878"
}, { _id: false });

const DesignSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    name: {
      type: String,
      required: true
    },
    
    slug: {
      type: String,
      required: true
    },

    imagePath:{
      type: String,
      required: true
    },

    image: {
      type: Buffer,
      required: false
    },

    model: {
      type: String,
      required: true
    },

    description: {
      type: String,
      default: ""
    },

    bodyColors: {
      type: [colorDetailSchema],
      default: []
    },

    gemColors: {
      type: [colorDetailSchema],
      default: []
    },

    size: {
      type: String,
      default: null
    },

    price: {
      type: Number,
      required: true
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Design || mongoose.model("Design", DesignSchema);
