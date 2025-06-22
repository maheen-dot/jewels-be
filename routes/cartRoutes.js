const express = require("express");
const router = express.Router();
const { body, param } = require("express-validator");
const cartController = require("../controllers/cartcontroller");
const verifyToken = require("../middleware/authMiddleware");

// Protect all routes with JWT authentication
router.use(verifyToken);

//Get cart items
router.get("/", cartController.getCart);

//Post cart items
router.post(
  "/items",
  [
    body("productId")
      .notEmpty().withMessage("Product ID is required")
      .isMongoId().withMessage("Invalid product ID format"),
    body("size")
      .isFloat({ min: 4, max: 12 }).withMessage("Ring size must be between 4 and 12"),
    body("quantity")
      .isInt({ min: 1, max: 10 }).withMessage("Quantity must be 1-10"),
    body("customizationNotes")
      .optional()
      .trim()
      .isLength({ max: 500 }).withMessage("Custom notes cannot exceed 500 characters")
  ],
  cartController.addOrUpdateItem
);

//Delete item from the cart
router.delete(
  "/items/:productId",
  param("productId")
    .isMongoId().withMessage("Invalid product ID format"),
  cartController.removeItem
);

//clear entire cart
router.delete("/", cartController.clearCart);

//patch cart items
router.patch(
  "/items/:productId/customization",
  [
    param("productId")
      .isMongoId().withMessage("Invalid product ID format"),
    body("notes")
      .optional()
      .trim()
      .isLength({ max: 500 }).withMessage("Custom notes cannot exceed 500 characters")
  ],
  cartController.updateCustomization
);

module.exports = router;