import Review from "../models/Review.js";
import Property from "../models/Property.js";
import Booking from "../models/booking.js";

// Add a review for a property
export const addReview = async (req, res) => {
  try {
    const { propertyId, rating, comment } = req.body;

    if (!propertyId || !rating) {
      return res.status(400).json({ message: "Property ID and rating are required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Check if user has already reviewed this property
    const existingReview = await Review.findOne({
      property: propertyId,
      tenant: req.user._id
    });

    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this property" });
    }

    // Check if user has a completed booking for this property (for verification)
    const completedBooking = await Booking.findOne({
      property: propertyId,
      tenant: req.user._id,
      status: "approved"
    });

    const verified = !!completedBooking;

    const review = await Review.create({
      property: propertyId,
      tenant: req.user._id,
      rating,
      comment,
      verified
    });

    await review.populate(['property', 'tenant']);

    res.status(201).json({
      message: "Review added successfully",
      review
    });
  } catch (error) {
    console.error("Add review error:", error);
    res.status(500).json({ message: "Failed to add review", error: error.message });
  }
};

// Get reviews for a specific property
export const getReviewsForProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { page = 1, limit = 10, sort = "-createdAt" } = req.query;

    const reviews = await Review.find({ property: propertyId })
      .populate("tenant", "name email")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments({ property: propertyId });

    // Calculate average rating
    const ratingStats = await Review.aggregate([
      { $match: { property: mongoose.Types.ObjectId(propertyId) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: "$rating"
          }
        }
      }
    ]);

    res.json({
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      stats: ratingStats[0] || { averageRating: 0, totalReviews: 0 }
    });
  } catch (error) {
    console.error("Get reviews error:", error);
    res.status(500).json({ message: "Failed to fetch reviews", error: error.message });
  }
};

// Update a review (only by the review author)
export const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Check if user is the review author
    if (review.tenant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this review" });
    }

    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;

    await review.save();
    await review.populate(['property', 'tenant']);

    res.json({
      message: "Review updated successfully",
      review
    });
  } catch (error) {
    console.error("Update review error:", error);
    res.status(500).json({ message: "Failed to update review", error: error.message });
  }
};

// Delete a review (only by the review author or admin)
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Check if user is the review author or admin
    const isAuthor = review.tenant.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to delete this review" });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({ message: "Failed to delete review", error: error.message });
  }
};

// Mark review as helpful (any authenticated user)
export const markReviewHelpful = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    review.helpful += 1;
    await review.save();

    res.json({
      message: "Review marked as helpful",
      helpful: review.helpful
    });
  } catch (error) {
    console.error("Mark helpful error:", error);
    res.status(500).json({ message: "Failed to mark review as helpful", error: error.message });
  }
};

// Get user's reviews
export const getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ tenant: req.user._id })
      .populate("property", "title address photos")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error("Get user reviews error:", error);
    res.status(500).json({ message: "Failed to fetch user reviews", error: error.message });
  }
};
