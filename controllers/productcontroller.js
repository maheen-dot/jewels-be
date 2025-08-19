const Product = require("../models/Product");
const Order = require("../models/order");
const ApiError = require("../utils/ApiError");

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

// @desc    Get all products (with pagination, category & search filter)
const getAllProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category, search } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(query)
    ]);

    res.json({
      success: true,
      count: products.length,
      data: products,
      pagination: {
        page: Number(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    next(new ApiError("Failed to fetch products", 500));
  }
};

// Get trending products based on order quantity
const getTrendingProducts = async (req, res) => {
  try {
   const pipeline = [
  { $unwind: "$items" },
  {
    $group: {
      _id: { $toObjectId: "$items.productId" },
      totalOrdered: { $sum: "$items.quantity" }  // Sum quantities instead of counting
    }
  },
  { $sort: { totalOrdered: -1 } },  // Sort by total quantity ordered
  { $limit: 5 },
  {
    $lookup: {
      from: "products",
      localField: "_id",
      foreignField: "_id",
      as: "productDetails"
    }
  },
  { $unwind: "$productDetails" },
  { $replaceRoot: { newRoot: "$productDetails" } }
];
    const trending = await Order.aggregate(pipeline);
    res.status(200).json(trending);
  } catch (error) {
    console.error("Error fetching trending:", error);
    res.status(500).json({ error: "Failed to fetch trending products" });
  }
};

// @desc    Update product (Admin)
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
const updateProduct = async (req, res, next) => {
  try {
    const { designUrl, ...otherUpdates } = req.body;

    // Prevent empty designUrl updates
    if (designUrl === "") {
      throw new ApiError("3D design URL cannot be empty", 400);
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { ...otherUpdates, ...(designUrl && { designUrl }) },
      { new: true, runValidators: true }
    );

    if (!product) {
      throw new ApiError("Product not found", 404);
    }

    res.json({
      success: true,
      message: "Product updated successfully",
      data: product
    });
  } catch (error) {
    next(error);
  }
};
// @desc    Delete product (Admin)
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    res.json({
      success: true,
      message: "Product deleted successfully",
      data: { id: req.params.id }
    });
  } catch (error) {
    next(new ApiError(500, "Deletion failed"));
  }
};
module.exports = {
  createProduct,
  getAllProducts,
  getTrendingProducts,
  updateProduct,
  deleteProduct
};
