const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const{
  getAllUsers,
  toggleUserStatus,
  deleteUser,
  getAllProducts,
  updateProduct,
  deleteProduct,
  getAllOrders,
  updateOrderStatus,
  getOrderStatusDistribution,
} = require("../controllers/adminController");

router.get("/get", protect, admin, getAllUsers);
router.patch("/users/:id/status", protect, admin, toggleUserStatus);
router.delete("/delete/:id", protect, admin, deleteUser);

router.get("/products", protect, admin, getAllProducts);
router.put("/products/:id", protect, admin, updateProduct);
router.delete("/products/:id", protect, admin, deleteProduct);

router.get("/orders", protect, admin, getAllOrders);
router.put("/orders/:id/status", protect, admin, updateOrderStatus);
router.get("/orders/status-distribution", protect, admin, getOrderStatusDistribution);

module.exports = router;