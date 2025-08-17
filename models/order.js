const mongoose = require("mongoose");

const colorSchema = new mongoose.Schema({
  id: String,
  materialType: String,
  color: String
}, { _id: false });

const orderItemSchema = new mongoose.Schema({
  productType: { type: String, required: true },
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Product",
    required: true 
  },
  name: { type: String, required: true },
  image: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  finalPrice: { type: Number, required: true, min: 0 },
  gemColors: { type: [colorSchema], default: [] },      
  bodyColors: { type: [colorSchema], default: [] },     
}, { _id: false });

const orderSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  zipCode: { type: String, required: true },
  items: { 
    type: [orderItemSchema], 
    required: true,
    validate: [arrayLimit, "Order must have at least 1 item"]
  },
  totalAmount: { 
    type: Number, 
    required: true,
    min: 0 
  },
  status: { 
    type: String, 
    required: true,
    enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
    default: "Pending"
  },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Completed", "Failed", "Refunded"],
    default: "Pending"
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true } 
});

// Custom validator for items array
function arrayLimit(val) {
  return val.length > 0;
}

// Add text index for search functionality
orderSchema.index({
  "fullName": "text",
  "email": "text",
  "items.name": "text"
});

// Virtual for formatted order date
orderSchema.virtual("formattedDate").get(function() {
  return this.createdAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
});

module.exports = mongoose.model("Order", orderSchema);