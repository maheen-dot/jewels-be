const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewcontroller");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

// ✅ Public: Fetch all reviews
router.get("/", reviewController.getAllReviews);

// ✅ Authenticated users: Add a review
router.post("/", verifyToken, reviewController.createReview);

// ✅ Admin only: Delete a review
router.delete("/:id", verifyToken, reviewController.deleteReview);

module.exports = router;
