import Product from "../models/Product.js";
import Order from "../models/order.js";
// Create a product
const createProduct = async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all products
const getAllProducts = async (_req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get trending products based on order quantity
const getTrendingProducts = async (req, res) => {
  try {
    const pipeline = [
      { $unwind: "$items" },
      {
        $group: {
          _id: {$toObjectId: "$items.productId"},
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }, // top 10 trending
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      { $unwind: "$productDetails" },
      {
        $replaceRoot: { newRoot: "$productDetails" }
      }
    ];

    const trending = await Order.aggregate(pipeline);
    res.status(200).json(trending);
  } catch (error) {
    console.error("Error fetching trending:", error);
    res.status(500).json({ error: "Failed to fetch trending products" });
  }
};


export {
  createProduct,
  getAllProducts,
  getTrendingProducts,
};
