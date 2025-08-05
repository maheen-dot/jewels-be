const Review = require("../models/Review");

// Create a new review
exports.createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const userId = req.user?.userId;
    const userName = req.user?.name || "Anonymous";

    if (!rating || !comment) {
      return res.status(400).json({ message: "Rating and comment are required." });
    }

    const newReview = new Review({ userId, userName, rating, comment });
    await newReview.save();
    res.status(201).json(newReview);
  } catch (err) {
    res.status(500).json({ message: "Failed to create review." });
  }
};

//  Get all reviews
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch reviews." });
  }
};

//  Delete a user's own review
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found." });
    }

    if (review.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Unauthorized to delete this review." });
    }

    await review.remove();
    res.status(200).json({ message: "Review deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete review." });
  }
};