const express = require("express");
const router = express.Router();
const {admin, verifyToken } = require("../middleware/authMiddleware");
const{
  getAllUsers,
  toggleUserStatus,
  deleteUser,
  updateProduct,
  deleteProduct,
  getAllOrders,
  getOrderStatusDistribution,
  getDashboardData
} = require("../controllers/AdminController");

router.get("/get", verifyToken, admin, getAllUsers);
router.patch("/users/:id/status", verifyToken, admin, toggleUserStatus);
router.delete("/delete/:id", verifyToken, admin, deleteUser);

router.put("/edit/:id", verifyToken, admin, updateProduct);
router.delete("/delete/products/:id", verifyToken, admin, deleteProduct);

router.get("/getorders", verifyToken, admin, getAllOrders);
router.get("/status-distribution", verifyToken, admin, getOrderStatusDistribution);
router.get("/dashboard", verifyToken, admin, getDashboardData)

module.exports = router;