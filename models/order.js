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
  slug: { type: String, required: true },
  imagePath: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  finalPrice: { type: Number, required: true, min: 0 },
  gemColors: { type: [colorSchema], default: [] },      
  bodyColors: { type: [colorSchema], default: [] },     
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  fullName: String,
  email: String,
  address: String,
  city: String,
  zipCode: String,
  items: [orderItemSchema],
  totalAmount: Number,
  status: { 
    type: String, 
    enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
    default: "Pending"
  },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Done", "Refunded"],
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

// Middleware to generate custom orderId
orderSchema.pre("save", async function(next) {
  if (!this.orderId) {
    this.orderId = "ORD-" + Date.now().toString().slice(-6);  
  }
  next();
});



module.exports = mongoose.model("Order", orderSchema);