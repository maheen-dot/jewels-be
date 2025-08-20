const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewcontroller");
const { verifyToken } = require("../middleware/authMiddleware");

// ✅ Public: Fetch all reviews
router.get("/get", reviewController.getAllReviews);

// ✅ Authenticated users: Add a review
router.post("/post", verifyToken, reviewController.createReview);

// ✅ Admin only: Delete a review
router.delete("/delete/:id", verifyToken, reviewController.deleteReview);

module.exports = router;
