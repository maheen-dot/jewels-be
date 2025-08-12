const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewcontroller"); 
<<<<<<< HEAD
const verifyToken = require("../middleware/authMiddleware");
=======
const verifyToken = require("../middleware/authmiddleware");
>>>>>>> bee73d0fae05985f6476d9da10ac3d07d5c234fc

// Public: Fetch all reviews
router.get("/get", reviewController.getAllReviews);

// Authenticated: Add a review
router.post("/post", verifyToken, reviewController.createReview);

// Authenticated: Delete a review
router.delete("/delete:id", verifyToken, reviewController.deleteReview);

module.exports = router;