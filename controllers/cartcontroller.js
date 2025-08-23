const fs = require('fs/promises');
const path = require('path');
const sharp = require('sharp');
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const ApiError = require("../utils/ApiError");
const mongoose = require("mongoose");


const ensureUploads = async () => {
  const outDir = path.join(__dirname, '..', 'uploads', 'designs');
  await fs.mkdir(outDir, { recursive: true });
  return outDir;
};
// Get all cart items
exports.getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ userId: req.userId });

    if (!cart) {
      return res.status(200).json({ items: [] }); // safe exit
    }

    const base = `${req.protocol}://${req.get("host")}`;
    const data = cart.items.map((d) => ({
      ...d.toObject(),
      imageUrl: `${base}${d.imagePath}`,
    }));

    res.status(200).json({ items: data });
  } catch (error) {
    console.error("Error in getCart:", error);
    next(error);
  }
};


// Add or update a cart item
exports.addOrUpdateItem = async (req, res, next) => {
  try {
    console.log("Request body:", req.body); // log the request body
    const userId = req.userId;
    if (!req.file) return res.status(400).json({ success: false, message: 'Screenshot is required' });
    let {
    slug,
    quantity = 1,
    size,
    bodyColors = '[]',
    gemColors = '[]',
    finalPrice
  } = req.body;

    try { bodyColors = JSON.parse(bodyColors); } catch { bodyColors = []; }
    try { gemColors  = JSON.parse(gemColors); } catch { gemColors = []; }


    console.log("Adding product with slug:", slug); // log it

    const uploadsDir = await ensureUploads();
    const base = `${userId}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
        const fileName = `${base}.webp`;
        const absPath  = path.join(uploadsDir, fileName);
        await sharp(req.file.buffer).webp({ quality: 82 }).toFile(absPath);
        const imagePath = `/uploads/designs/${fileName}`;
    

    //  Always fetch fresh product using correct slug/link
    const product = await Product.findOne({ link: slug }); 
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const newItem = {
      productId: product._id, 
      name: product.name,
      imagePath,
      slug,
      finalPrice, 
      category: product.category,
      quantity,
      bodyColors, 
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
    console.log("Cart after adding item:", cart); // log the updated cart
    res.status(200).json({ success: true, message: "Item added to cart", cart });
  } catch (error) {
    console.error("Error in addOrUpdateItem:", error);
    next(error);
  }
};

// Remove a specific cart item
exports.removeItem = async (req, res, next) => {
  const userId = req.userId;
  const { itemId } = req.params;

  console.log(" REMOVE ITEM ID RECEIVED:", itemId);

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    console.error(" Invalid ObjectId:", itemId);
    return res.status(400).json({ message: 'Invalid item ID format' });
  }

  try {
    const result = await Cart.updateOne(
      { userId },
       { $pull: { items: { _id: itemId } } }
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
    const userId = req.userId;

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
  const userId = req.userId;


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


