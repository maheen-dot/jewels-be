const { body, param } = require("express-validator");

// Validate cart item (add/update)
exports.validateCartItem = [
  // Product ID
  body("slug")
    .notEmpty().withMessage("Product slug is required"),

  // Ring size (any float between 4 and 12)
  body("size")
    .isFloat({ min: 4, max: 12 })
    .withMessage("Ring size must be a number between 4 and 12 (e.g., 4.5, 7.25)"),

  // Quantity
  body("quantity")
    .isInt({ min: 1, max: 10 })
    .withMessage("Quantity must be between 1 and 10"),

];

// Validate product ID in URL params (e.g., DELETE /cart/items/:productId)
