const express = require("express");
const router = express.Router();
const orderController = require("../controllers/ordercontroller");
const verifyToken = require("../middleware/authMiddleware");

router.use(verifyToken); // Only authenticated users can order

router.post("/checkout", verifyToken, orderController.checkout); // Just one endpoint
router.get("/get", verifyToken, orderController.getOrdersByUser);
router.get("/myorders", verifyToken, orderController.getOrderById);


module.exports = router;