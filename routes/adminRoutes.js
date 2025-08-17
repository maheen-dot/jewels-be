const express = require("express");
const {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getOrderStatusDistribution,   //  new controller
} = require("../controllers/ordercontroller");

const {
  getAllUsers,
  toggleUserStatus,
  deleteUser,
} = require("../controllers/AdminController");

const {
  getAdminProducts,
  updateProduct,
  deleteProduct,
} = require("../controllers/productcontroller");

const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @desc    Admin Order Management Routes
 * @route   /api/admin/orders
 * @access  Private/Admin
 */
router.route("/orders")
  .get(protect, admin, getAllOrders);

router.route("/orders/:id")
  .get(protect, admin, getOrderById)
  .put(protect, admin, updateOrderStatus);

// ✅ New route for dashboard chart
router.get(
  "/orders/status-distribution",
  protect,
  admin,
  getOrderStatusDistribution
);

/**
 * @desc    Admin User Management Routes
 * @route   /api/admin/users
 * @access  Private/Admin
 */
router.route("/users")
  .get(protect, admin, getAllUsers);

router.route("/users/:id/status")
  .patch(protect, admin, toggleUserStatus);

router.route("/users/:id")
  .delete(protect, admin, deleteUser);

/**
 * @desc    Admin Product Management Routes
 * @route   /api/admin/products
 * @access  Private/Admin
 */
router.route("/products")
  .get(protect, admin, getAdminProducts);

router.route("/products/:id")
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

module.exports = router;
