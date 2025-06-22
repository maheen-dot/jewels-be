const Cart = require("../models/Cart");
const ApiError = require("../utils/ApiError");

// Add/update item (supports all product types)
exports.addOrUpdateItem = async (req, res, next) => {
  try {
    const { 
      productId, 
      name, 
      image, 
      price,
      productType, // "Ring", "Necklace", "Earring", "Bangle"
      quantity = 1,
      metalType,   // "Gold", "Silver", etc.
      metalColor,  // Hex code
      gemstones = [], // Array of { name, color, position }
      size         // Only for rings/necklaces
    } = req.body;

    // Validate product-type-specific rules
    if (productType === "Ring" && (typeof size !== 'number' || size < 4 || size > 12)) {
      throw new ApiError("Ring size must be between 4 and 12", 400);
    }
    if (productType === "Necklace" && !size) {
      throw new ApiError("Chain length is required", 400);
    }
    // No size validation for earrings/bangles

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) cart = new Cart({ userId: req.user._id, items: [] });

    // Check for existing item with identical customization
    const existingItemIndex = cart.items.findIndex(item => 
      item.productId.toString() === productId &&
      item.customization.metalType === metalType &&
      item.customization.metalColor === metalColor &&
      JSON.stringify(item.customization.gemstones) === JSON.stringify(gemstones) &&
      (productType !== "Ring" || item.customization.ringSize === size) &&
      (productType !== "Necklace" || item.customization.chainLength === size)
      // No size/width checks for earrings/bangles
    );

    if (existingItemIndex >= 0) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({
        productId,
        name,
        image,
        price,
        productType,
        quantity,
        customization: {
          metalType,
          metalColor,
          gemstones,
          ...(productType === "Ring" && { ringSize: size }),
          ...(productType === "Necklace" && { chainLength: size })
          // No size/width for earrings/bangles
        }
      });
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    next(error);
  }
};