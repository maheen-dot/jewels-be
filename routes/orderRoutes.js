const express = require("express");
const router = express.Router();

const {checkout, getOrdersByUser,  updateOrderStatus,cancelOrder} = require("../controllers/ordercontroller");
const {verifyToken, admin} = require("../middleware/authMiddleware");


router.post("/checkout", verifyToken, checkout); 
router.post("/checkout", verifyToken, checkout); 
router.get("/get", verifyToken, getOrdersByUser);
router.put("/update/:id", verifyToken, admin,updateOrderStatus )
router.put("/cancel/:id", verifyToken,cancelOrder )


module.exports = router;

