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
    isRead: {
      type: Boolean,
      default: false, // every new message is unread
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Messages", contactSchema);
