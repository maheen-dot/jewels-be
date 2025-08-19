const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const AdminController = require("../controllers/AdminController");

router.get("/users", protect, admin, AdminController.getAllUsers);
router.patch("/users/:id/status", protect, admin, AdminController.toggleUserStatus);
router.delete("/users/:id", protect, admin, AdminController.deleteUser);

router.get("/products", protect, admin, AdminController.getAllProducts);
router.put("/products/:id", protect, admin, AdminController.updateProduct);
router.delete("/products/:id", protect, admin, AdminController.deleteProduct);

router.get("/orders", protect, admin, AdminController.getAllOrders);
router.put("/orders/:id/status", protect, admin, AdminController.updateOrderStatus);
router.get("/orders/status-distribution", protect, admin, AdminController.getOrderStatusDistribution);

module.exports = router;