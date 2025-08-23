const User = require("../models/user");
const Product = require("../models/Product");
const ApiError = require("../utils/ApiError");
const Order = require("../models/order");
const mongoose = require("mongoose");
//const Visitor = require("../models/Visitors")


exports.getDashboardData = async (req, res) => {
  try {
   const totalOrders = await Order.countDocuments();
const totalSalesAgg = await Order.aggregate([
  { $group: { _id: null, total: { $sum: "$totalAmount" } } }
]);
const totalSales = totalSalesAgg[0]?.total || 0;

// Total visitors
//const totalVisitors = await Visitor.countDocuments();

// Sales Overview
const salesOverview = await Order.aggregate([
  { $group: { _id: { $dayOfWeek: "$createdAt" }, total: { $sum: "$totalAmount" } } },
  { $sort: { "_id": 1 } }
]);

    

    res.status(200).json({
      totalSales,
      totalOrders,
     // totalVisitors,
      salesOverview,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select(
      "-password -otp -resetToken -resetTokenExpires"
    );
    res.status(200).json({ success: true, users });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};

exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (user.role === "admin") {
      throw new ApiError(403, "Cannot modify admin accounts");
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? "activated" : "deactivated"}`,
      data: {
        id: user._id,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (user.role === "admin") {
      throw new ApiError(403, "Cannot delete admin accounts");
    }

    await User.deleteOne({ _id: req.params.id });

    res.json({
      success: true,
      message: "User deleted successfully",
      data: { id: req.params.id },
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query = search ? { name: { $regex: search, $options: "i" } } : {};

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: products,
      pagination: {
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total,
      },
    });
  } catch (error) {
    next(new ApiError(500, "Failed to fetch products"));
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    res.json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    await Product.deleteOne({ _id: req.params.id });

    res.json({
      success: true,
      message: "Product deleted successfully",
      data: { id: req.params.id },
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status = "" } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query = status ? { status } : {};
        const total = await Order.countDocuments(query);
    console.log("Fetched orders:", total); // Debugging log

    const orders = await Order.find()
     
console.log(orders)

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total,
      },
    });
  } catch (error) {
    next(new ApiError(500, "Failed to fetch orders"));
  }
};

const validStatuses = ["pending", "shipped", "delivered"];
const validPaymentStatuses = ["pending", "completed", "failed"];

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid order status" });
    }

    if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({ success: false, message: "Invalid payment status" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order updated successfully",
      data: order,
    });
  } catch (error) {
    console.error("Update order error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating order",
      error: error.message,
    });
  }
};



exports.getOrderStatusDistribution = async (req, res, next) => {
  try {
    const validStatuses = [
      "Pending",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    const [result] = await Order.aggregate([
      {
        $facet: {
          statusCounts: [
            { $match: { status: { $in: validStatuses } } },
            { $group: { _id: "$status", count: { $sum: 1 } } },
          ],
          totalOrders: [{ $count: "total" }],
        },
      },
    ]);

    const total = result.totalOrders[0]?.total || 0;
    const statusData = validStatuses.map((status) => {
      const found = result.statusCounts.find((item) => item._id === status);
      const count = found ? found.count : 0;
      return {
        status,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      };
    });

    res.json({
      success: true,
      data: statusData,
      totalOrders: total,
    });
  } catch (error) {
    next(new ApiError(500, "Failed to fetch order status distribution"));
  }
};
