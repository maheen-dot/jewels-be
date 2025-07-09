const express = require("express");
const router = express.Router();
const { body, param } = require("express-validator");
const verifyToken = require("../middleware/authMiddleware");
const validateCartItem = require("../middleware/cartValidation");

const {
  getCart,
  addOrUpdateItem,
  removeItem,
  clearCart,
  updateQuantity,
  updateCustomization
} = require("../controllers/cartcontroller");

// Protect all routes with JWT authentication
router.use(verifyToken);

// GET /api/cart
router.get("/get", getCart);

// POST /api/cart/items
router.post("/add", addOrUpdateItem);

// DELETE /api/cart/items/:productId
router.delete(
  "/items/:itemId",
  [
    param("itemId").isMongoId().withMessage("Invalid product ID format")
  ],
  removeItem
);

// DELETE /api/cart
router.delete("/clear", clearCart);

// PUT /api/cart/update/:itemId
router.put(
  "/update/:itemId",
  
  [
    param("itemId").isMongoId().withMessage("Invalid cart item ID"),
    body("quantity").isInt({ min: 1, max: 10 }).withMessage("Quantity must be between 1 and 10"),
  ],
  updateQuantity
);

module.exports = router;
