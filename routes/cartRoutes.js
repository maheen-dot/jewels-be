const express = require("express");
const router = express.Router();
const multer = require("multer");
const { body, param } = require("express-validator");
const { verifyToken } = require("../middleware/authMiddleware");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB guard
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) return cb(new Error("Only images allowed"));
    cb(null, true);
  },
});

const {
  getCart,
  addOrUpdateItem,
  removeItem,
  clearCart,
  updateQuantity,
} = require("../controllers/cartcontroller");

// GET /api/cart
router.get("/get", verifyToken, getCart);

// POST /api/cart/add
router.post("/add", verifyToken, upload.single("screenshot"), addOrUpdateItem);

// DELETE /api/cart/items/:itemId
router.delete(
  "/items/:itemId",
  verifyToken,   
  [param("itemId").isMongoId().withMessage("Invalid item ID format")],
  removeItem
);

// DELETE /api/cart/clear
router.delete("/clear", verifyToken, clearCart);

// PUT /api/cart/update/:itemId
router.put(
  "/update/:itemId",
  verifyToken,  
  [
    param("itemId").isMongoId().withMessage("Invalid cart item ID"),
    body("quantity").isInt({ min: 1, max: 10 }).withMessage("Quantity must be between 1 and 10"),
  ],
  updateQuantity
);

module.exports = router;
