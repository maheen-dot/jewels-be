const User = require("../models/user");
const Product = require("../models/Product");
const ApiError = require("../utils/ApiError");
const Order = require("../models/order");

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (page - 1) * limit;

    const query = {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    };

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password -otp -otpExpires -resetToken -resetTokenExpires')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: Number(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    next(new ApiError(500, 'Failed to fetch users'));
  }
};

// @desc    Toggle user status (Admin only)
// @route   PATCH /api/admin/users/:id/status
// @access  Private/Admin
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Prevent modifying other admins unless superadmin
    if (user.role === 'admin' && req.user.role !== 'superadmin') {
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

// @desc    Delete user (Admin only)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Prevent deleting admin accounts
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

// @desc    Get all products (Admin only)
// @route   GET /api/admin/products
// @access  Private/Admin
const getAllProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const skip = (page - 1) * limit;

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
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    next(new ApiError(500, "Failed to fetch products"));
  }
};

// @desc    Update product metadata (Admin only)
// @route   PATCH /api/admin/products/:id
// @access  Private/Admin
const updateProduct = async (req, res, next) => {
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

// @desc    Delete product (Admin only)
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res, next) => {
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

// @desc    Get all orders (Admin only)
// @route   GET /api/admin/orders
// @access  Private/Admin
const getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status = '' } = req.query;
    const skip = (page - 1) * limit;

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
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    next(new ApiError(500, 'Failed to fetch orders'));
  }
};

// @desc    Get order details (Admin only)
// @route   GET /api/admin/orders/:id
// @access  Private/Admin
const getOrderDetails = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.product', 'name price images');

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (Admin only)
// @route   PATCH /api/admin/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res, next) => {
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

    // Here you could add logic to send email notification to user about status change

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    next(error);
  }
};
// @desc    Get order status distribution for dashboard (Admin only)
// @route   GET /api/admin/orders/status-distribution
// @access  Private/Admin
const getOrderStatusDistribution = async (req, res, next) => {
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
      totalOrders: total, // Optional: Send total for frontend calculations
    });
  } catch (error) {
    next(new ApiError(500, "Failed to fetch order status distribution"));
  }
};
// Then add these to your exports
module.exports = {
  getAllUsers,
  toggleUserStatus,
  deleteUser,
  getAllProducts,
  updateProduct,
  deleteProduct,
  getAllOrders,
  getOrderDetails,
  updateOrderStatus,
  getOrderStatusDistribution   
};
