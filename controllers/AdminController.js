const User = require("../models/user");
const Product = require("../models/Product");
const ApiError = require("../utils/ApiError");
const Order = require("../models/order");


exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password -otp -resetToken -resetTokenExpires");
    res.status(200).json({ success: true, users });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};

  
exports.toggleUserStatus= async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (user.role === 'admin') {
      throw new ApiError(403, 'Cannot modify admin accounts');
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'}`,
      data: {
        id: user._id,
        isActive: user.isActive
      }
    });
  } catch (error) {
    next(error);
  }
};


exports.deleteUser= async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (user.role === 'admin') {
      throw new ApiError(403, 'Cannot delete admin accounts');
    }

    await User.deleteOne({ _id: req.params.id });

    res.json({
      success: true,
      message: 'User deleted successfully',
      data: { id: req.params.id }
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query = search
      ? { name: { $regex: search, $options: "i" } }
      : {};

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

exports.updateProduct= async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

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

exports.getAllOrders= async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status = '' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query = status ? { status } : {};

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('user', 'name email')
        .populate('items.product', 'name price')
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
        pages: Math.ceil(total / Number(limit)),
        total
      }
    });
  } catch (error) {
    next(new ApiError(500, 'Failed to fetch orders'));
  }
};

exports.updateOrderStatus= async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      throw new ApiError(400, 'Invalid order status');
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('user', 'email');

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

exports.getOrderStatusDistribution= async (req, res, next) => {
  try {
    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];

    const [result] = await Order.aggregate([
      {
        $facet: {
          statusCounts: [
            { $match: { status: { $in: validStatuses } } },
            { $group: { _id: "$status", count: { $sum: 1 } } }
          ],
          totalOrders: [
            { $count: "total" }
          ]
        }
      }
    ]);

    const total = result.totalOrders[0]?.total || 0;
    const statusData = validStatuses.map(status => {
      const found = result.statusCounts.find(item => item._id === status);
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


