const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewcontroller"); 
const verifyToken = require("../middleware/verifyToken");

// Public: Fetch all reviews
router.get("/get", reviewController.getAllReviews);

// Authenticated: Add a review
router.post("/post", verifyToken, reviewController.createReview);

// Authenticated: Delete a review
router.delete("/delete:id", verifyToken, reviewController.deleteReview);

module.exports = router;