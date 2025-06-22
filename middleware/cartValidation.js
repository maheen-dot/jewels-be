const { body, param } = require("express-validator");

// Validate cart item (add/update)
exports.validateCartItem = [
  // Product ID
  body("productId")
    .notEmpty().withMessage("Product ID is required")
    .isMongoId().withMessage("Invalid product ID format"),

  // Ring size (any float between 4 and 12)
  body("size")
    .isFloat({ min: 4, max: 12 })
    .withMessage("Ring size must be a number between 4 and 12 (e.g., 4.5, 7.25)"),

  // Quantity
  body("quantity")
    .isInt({ min: 1, max: 10 })
    .withMessage("Quantity must be between 1 and 10"),

  // Customization notes (optional)
  body("customizationNotes")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Custom notes cannot exceed 500 characters"),
];

// Validate product ID in URL params (e.g., DELETE /cart/items/:productId)
exports.validateProductIdParam = [
  param("productId")
    .isMongoId()
    .withMessage("Invalid product ID format"),
];