const mongoose = require("mongoose");

const colorSchema = new mongoose.Schema({
  id: String,
  materialType: String,
  color: String
}, { _id: false });

const orderItemSchema = new mongoose.Schema({
  productType: String,
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  name: String,
  image: String,
  quantity: Number,
  finalPrice: Number,
  gemColors: [colorSchema],      
  bodyColors: [colorSchema],     
});

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  fullName: String,
  email: String,
  address: String,
  city: String,
  zipCode: String,
  items: [orderItemSchema],
  totalAmount: Number,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);
