const User = require("../models/user");
const Product = require("../models/Product");
const ApiError = require("../utils/ApiError");
const Order = require("../models/order");
const mongoose = require("mongoose");


//dashboard stats
exports.getDashboardData = async (req, res) => {
  try {
   const totalOrders = await Order.countDocuments();
const totalSalesAgg = await Order.aggregate([
  { $group: { _id: null, total: { $sum: "$totalAmount" } } }
]);
const totalSales = totalSalesAgg[0]?.total || 0;
// Sales Overview
const salesOverview = await Order.aggregate([
  { $group: { _id: { $dayOfWeek: "$createdAt" }, total: { $sum: "$totalAmount" } } },
  { $sort: { "_id": 1 } }
]);

    res.status(200).json({
      totalSales,
      totalOrders,
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
    console.log("Fetched orders:", total);

    const orders = await Order.find(query)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 }); 
    console.log("Orders data:", orders);

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

exports.getOrderItemByIndex = async (req, res, next) => {
  try {
    const { orderId, itemIndex } = req.params;
    const index = parseInt(itemIndex);

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if item index is valid
    if (index < 0 || index >= order.items.length) {
      return res.status(404).json({ message: "Order item not found" });
    }

    const item = order.items[index];
    res.status(200).json(item);
  } catch (error) {
    next(error);
  }
};

exports.getOrderStatusDistribution = async (req, res, next) => {
  try {
    const validStatuses = [
      "Pending",
      "Confirmed",
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
