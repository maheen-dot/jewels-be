     models/Contact.js
const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      match: [/.+\@.+\..+/, "Please enter a valid email"], // basic validation
    },
    message: {
      type: String,
      required: true,
      minlength: 5,
    },
  },
  { timestamps: true } // adds createdAt & updatedAt
);

module.exports = mongoose.model("Contact", contactSchema);
