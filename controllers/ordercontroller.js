const mongoose = require("mongoose");
const Order = require("../models/order");
const Product = require("../models/Product");
const ApiError = require("../utils/ApiError");

//checkout
exports.checkout = async (req, res) => {
  try {
    const { fullName, email, address, city, zipCode, contactNumber, items } = req.body;

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
      contactNumber,
      items: items.map((item) => ({
        productType: item.category,
        productId: item.productId,
        name: item.name,
        slug: item.slug,
        imagePath: item.imagePath,
        model: item.model,
        quantity: item.quantity,
        finalPrice: item.finalPrice,
        gemColors: item.gemColors || [],
        bodyColors: item.bodyColors || [],
      })),
      totalAmount,
      status: "Pending" // default status
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

// for user to GET his orders
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

exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status === "Cancelled") {
      return res.status(400).json({ message: "Order already cancelled" });
    }

    if(order.status === "Pending" || order.status === "Confirmed"){
    order.status = "Cancelled";
    await order.save();

    res.json({
      success: true,
      message: "Order cancelled successfully",
      orderId: order._id,
      status: order.status,
    });
    }
  } catch (error) {
    console.error("Cancel order error:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid order id" });
    }
    res.status(500).json({ message: "Something went wrong" });
  }
};
