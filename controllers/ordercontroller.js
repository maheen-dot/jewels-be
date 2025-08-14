const Order = require("../models/order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const ApiError = require("../utils/ApiError");

// POST /api/orders/checkout
exports.checkout = async (req, res) => {
  try {
    const { fullName, email, address, city, zipCode, items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const totalAmount = items.reduce(
      (acc, item) => acc + item.finalPrice * item.quantity,
      0
    );

    const newOrder = new Order({
      userId: req.user?.userId,
      fullName,
      email,
      address,
      city,
      zipCode,
      items: items.map((item) => ({
        productType: item.category,
        productId: item.productId,
        name: item.name,
        image: item.image,
        quantity: item.quantity,
        finalPrice: item.finalPrice,
        gemColors: item.gemColors || [],
        bodyColors: item.bodyColors || [],
      })),
      totalAmount,
    });

    await newOrder.save();

    res.status(201).json({
      message: "Order placed successfully",
      orderId: newOrder._id,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// GET /api/orders - Get all orders for logged-in user (or all if admin)
 exports.getOrdersByUser = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const orders = await Order.find({ userId }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};


// GET /api/orders/:id - Get single order details
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).lean();

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (req.user?.role !== "admin") {
      if (!req.user?.userId || order.userId?.toString() !== req.user.userId.toString()) {
        return res.status(403).json({ message: "Forbidden" });
      }
    }

    res.json(order);
  } catch (error) {
    console.error("Get order by id error:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid order id" });
    }
    res.status(500).json({ message: "Something went wrong" });
  }
};
