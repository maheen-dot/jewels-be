const mongoose = require("mongoose");
const Order = require("../models/order");
const Product = require("../models/Product");
const ApiError = require("../utils/ApiError");

// POST /api/orders/checkout
exports.checkout = async (req, res) => {
  try {
    const { fullName, email, address, city, zipCode, items } = req.body;

    if (!items || items.length === 0) {
      throw new ApiError(400, "Cart is empty");
    }

    const totalAmount = items.reduce(
      (acc, item) => acc + item.finalPrice * item.quantity,
      0
    );

    const newOrder = new Order({
      userId: req.userId,
      fullName,
      email,
      address,
      city,
      zipCode,
      items: items.map((item) => ({
        productType: item.category,
        productId: item.productId,
        name: item.name,
        slug: item.slug,
        imagePath: item.imagePath,
        quantity: item.quantity,
        finalPrice: item.finalPrice,
        gemColors: item.gemColors || [],
        bodyColors: item.bodyColors || [],
      })),
      totalAmount,
      status: "Pending" // Default status
    });

    await newOrder.save();

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      orderId: newOrder._id,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Checkout failed"
    });
  }
};

// GET /api/orders - User's orders
exports.getOrdersByUser = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) throw new ApiError(401, "Unauthorized");

    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .populate("items.productId", "name price images");

    res.json({ 
      success: true, 
      data: orders 
    });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch orders"
    });
  }
};

// GET /api/orders/:id - Single order (user or admin)
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("userId", "name email")
      .populate("items.productId", "name price images");

    if (!order) throw new ApiError(404, "Order not found");

    // Authorization check
    if (req.user.role !== "admin" && order.userId._id.toString() !== req.user.userId) {
      throw new ApiError(403, "Forbidden");
    }

    res.json({
      success: true,
      data: {
        ...order.toObject(),
        user: order.userId
      }
    });
  } catch (error) {
    console.error("Get order error:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch order"
    });
  }
};

// ADMIN-ONLY ENDPOINTS =========================================

// GET /api/admin/orders - All orders with search, filter, pagination
exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    
    // Status filter
    if (status) query.status = status;
    
    // Search functionality
    if (search) {
      const isMongoId = mongoose.Types.ObjectId.isValid(search);
      
      query.$or = [
        { fullName: { $regex: search, $options: "i" } }, // Case-insensitive name search
        { email: { $regex: search, $options: "i" } },    // Case-insensitive email search
        ...(isMongoId ? [{ _id: search }] : [])          // Search by order ID if valid ObjectId
      ];
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: Number(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error("Admin get orders error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders"
    });
  }
};

// PUT /api/admin/orders/:id/status - Update status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

    if (!validStatuses.includes(status)) {
      throw new ApiError(400, "Invalid status value");
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate("userId", "name email");

    if (!order) throw new ApiError(404, "Order not found");

    res.json({
      success: true,
      message: "Status updated",
      data: {
        _id: order._id,
        status: order.status,
        updatedAt: order.updatedAt
      }
    });
  } catch (error) {
    console.error("Update status error:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update status"
    });
  }
};