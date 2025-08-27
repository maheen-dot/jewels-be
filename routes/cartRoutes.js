const express = require("express");
const router = express.Router();
const multer = require("multer");
const { body, param } = require("express-validator");
const { verifyToken } = require("../middleware/authMiddleware");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, 
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


router.get("/get", verifyToken, getCart);
router.post("/add", verifyToken, upload.single("screenshot"), addOrUpdateItem);
router.delete("/items/:itemId",verifyToken, [param("itemId").isMongoId().withMessage("Invalid item ID format")],removeItem);
router.delete("/clear", verifyToken, clearCart);
router.put("/update/:itemId",verifyToken,  
  [
    param("itemId").isMongoId().withMessage("Invalid cart item ID"),
    body("quantity").isInt({ min: 1, max: 10 }).withMessage("Quantity must be between 1 and 10"),
  ],updateQuantity);

module.exports = router;
