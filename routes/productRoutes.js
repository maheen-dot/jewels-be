const express = require("express");
const router = express.Router();
const { createProduct, getAllProducts, getTrendingProducts } = require("../controllers/productcontroller");

router.post("/add", createProduct);
router.get("/get", getAllProducts);
router.get('/trending', getTrendingProducts);

module.exports = router;
