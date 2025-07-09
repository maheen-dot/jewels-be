const express = require("express");
const router = express.Router();
const { createProduct, getAllProducts } = require("../controllers/productcontroller");

router.post("/add", createProduct);
router.get("/get", getAllProducts);

module.exports = router;
