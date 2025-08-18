const express = require("express");
const { protect, admin } = require("../middleware/authMiddleware");
const router = express.Router();

// Import controller methods
const {
  getAllUsers,
  toggleUserStatus,
  deleteUser,
  getAllProducts,
  updateProduct,
  deleteProduct,
  getAllOrders,
  updateOrderStatus,
  getOrderStatusDistribution
} = require("../controllers/AdminController");

// Users routes
router.get("/users", protect, admin, getAllUsers);
router.patch("/users/:id/status", protect, admin, toggleUserStatus);
router.delete("/users/:id", protect, admin, deleteUser);

// Products routes
router.get("/products", protect, admin, getAllProducts);
router.put("/products/:id", protect, admin, updateProduct);
router.delete("/products/:id", protect, admin, deleteProduct);

// Orders routes
router.get("/orders", protect, admin, getAllOrders);
router.put("/orders/:id/status", protect, admin, updateOrderStatus);
router.get("/orders/status-distribution", protect, admin, getOrderStatusDistribution);

module.exports = router;