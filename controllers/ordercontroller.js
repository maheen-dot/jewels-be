const Order = require("../models/order");
const Cart = require("../models/Cart");
const ApiError = require("../utils/ApiError");

exports.placeOrder = async (req, res, next) => {
  try {
    const { fullName, email, address, city, zipCode } = req.body;
    const userId = req.user._id;

    // Basic "not empty" checks (frontend handles detailed validation)
    if (!fullName || !email || !address || !city || !zipCode) {
      throw new ApiError("Please fill all shipping fields", 400);
    }

    // Get cart and validate
    const cart = await Cart.findOne({ userId });
    if (!cart?.items?.length) {
      throw new ApiError("Your cart is empty", 400);
    }

    // Create order (no payment method needed)
    const order = new Order({
      userId,
      items: cart.items, // Already contains product snapshots
      totalAmount: cart.items.reduce(
        (sum, item) => sum + (item.price * item.quantity), 0
      ),
      fullName,
      email,
      address,
      city,
      zipCode,
      status: "Pending", // Default, no other options
    });

    await order.save();
    await Cart.findOneAndUpdate({ userId }, { $set: { items: [] } }); // Clear cart

    res.status(201).json({ 
      success: true, 
      message: "Order placed (Cash on Delivery)", 
      order 
    });
  } catch (error) {
    next(error);
  }
};