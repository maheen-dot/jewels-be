const express = require("express");
const router = express.Router();
const {checkout, getOrdersByUser, getOrderById, updateOrderStatus,cancelOrder} = require("../controllers/ordercontroller");
const {verifyToken, protect, admin} = require("../middleware/authMiddleware");
// Only authenticated users can order

router.post("/checkout", verifyToken, checkout); // Just one endpoint
router.get("/get", verifyToken, getOrdersByUser);
router.get("/myorders", verifyToken, getOrderById);
router.put("/update/:id", protect, admin,updateOrderStatus )
router.put("/cancel/:id", verifyToken,cancelOrder )


module.exports = router;

