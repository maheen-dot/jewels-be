const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewcontroller");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/get", reviewController.getAllReviews);
router.post("/post", verifyToken, reviewController.createReview);
router.delete("/delete/:id", verifyToken, reviewController.deleteReview);

module.exports = router;
