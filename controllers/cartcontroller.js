const Cart = require("../models/Cart");
const Product = require("../models/Product");
const ApiError = require("../utils/ApiError");


// Get all cart items
exports.getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ userId: req.user?.userId });
  
    if (!cart) return res.status(200).json({ items: [] });

    res.status(200).json(cart);
  } catch (error) {
     console.error(" Error in getCart:", error);
    next(error);
  }
};

// Add or update a cart item
exports.addOrUpdateItem = async (req, res, next) => {
  try {
    const userId = req.userId;
    const {
      slug, quantity = 1, size, image, metalColors = [], gemColors = [],
    } = req.body;

    console.log("Adding product with slug:", slug); // log it

    //  Always fetch fresh product using correct slug/link
    const product = await Product.findOne({ link: slug }); 
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

  

    const newItem = {
      productId: product._id, 
      name: product.name,
      image,
      price: product.price,
      category: product.category,
      quantity,
      bodyColors: metalColors, 
      gemColors,
    };

    // Only assign ringSize if it's a Ring
    if (product.category === "Rings") {
      newItem.ringSize = size;
    }

    // Only assign chainLength if it's a Necklace
    if (product.category === "Necklaces") {
      newItem.chainLength = size;
    }
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    cart.items.push(newItem);
    await cart.save();

    res.status(200).json({ success: true, message: "Item added to cart", cart });
  } catch (error) {
    console.error("Error in addOrUpdateItem:", error);
    next(error);
  }
};

// Remove a specific cart item
const mongoose = require('mongoose');
exports.removeItem = async (req, res, next) => {
  const userId = req.user?.userId;
  const { itemId } = req.params;

  console.log(" REMOVE ITEM ID RECEIVED:", itemId);

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    console.error(" Invalid ObjectId:", itemId);
    return res.status(400).json({ message: 'Invalid item ID format' });
  }

  try {
    const result = await Cart.updateOne(
      { userId },
      { $pull: { items: { _id: new mongoose.Types.ObjectId(itemId) } } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    const updatedCart = await Cart.findOne({ userId });
    res.status(200).json({ message: "Item removed", cart: updatedCart });

  } catch (error) {
    console.error("Error removing item:", error);
    next(error);
  }
};

// Clear entire cart
exports.clearCart = async (req, res, next) => {
    const userId = req.user?.userId;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart already empty" });

    await Cart.deleteOne({ userId });
    res.status(200).json({ message: "Cart cleared", cart });
  } catch (error) {
    next(error);
  }
};


//Update Quantity of an item in the cart
exports.updateQuantity = async (req, res, next) => {
  const { itemId } = req.params;
  const { quantity } = req.body;
  const userId = req.user?.userId;


  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    const item = cart.items.id(itemId);
    if (!item) return res.status(404).json({ message: "Item not found in cart" });

    item.quantity = quantity;
    await cart.save();

    res.status(200).json({ message: "Quantity updated", cart });
  } catch (error) {
    next(error);
  }
}


