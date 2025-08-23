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
  getDashboardData
} = require("../controllers/AdminController");

router.get("/get", protect, admin, getAllUsers);
router.patch("/users/:id/status", protect, admin, toggleUserStatus);
router.delete("/delete/:id", protect, admin, deleteUser);

router.get("/getproducts", protect, admin, getAllProducts);
router.put("/edit/:id", protect, admin, updateProduct);
router.delete("/delete/products/:id", protect, admin, deleteProduct);

router.get("/getorders", protect, getAllOrders);
router.put("/update/:id/status", protect, admin, updateOrderStatus);
router.get("/status-distribution", protect, admin, getOrderStatusDistribution);
router.get("/dashboard", protect, admin, getDashboardData)

module.exports = router;