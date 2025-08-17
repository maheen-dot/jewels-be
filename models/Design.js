const mongoose = require("mongoose");

const DesignSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    
    slug: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },

    // Separate body and gem colors
    bodyColors: {
      type: [String],
      default: [],
    },
    gemColors: {
      type: [String],
      default: [],
    },

    size: {
      type: String,
      default: null,
    },
    price: {
      type: Number,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.Design || mongoose.model("Design", DesignSchema);
