const Order = require("../models/order");
const Cart = require("../models/Cart");
const ApiError = require("../utils/ApiError");

exports.checkout = async (req, res) => {
  try {
    const { fullName, email, address, city, zipCode, items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const totalAmount = items.reduce((acc, item) => acc + item.finalPrice * item.quantity, 0);

    const newOrder = new Order({
      userId: req.user?.userId,
      fullName,
      email,
      address,
      city,
      zipCode,
      items: items.map((item) => ({
        productType: item.category,
        productId: item._id,
        name: item.name,
        image: item.image,
        quantity: item.quantity,
        finalPrice: item.finalPrice,
        gemColors: item.gemColors || [],
        bodyColors: item.bodyColors || [],
      })),
      totalAmount
    });

    await newOrder.save();

    res.status(201).json({ message: "Order placed successfully", orderId: newOrder._id });
  } catch (error) {
    console.error("Checkout error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
