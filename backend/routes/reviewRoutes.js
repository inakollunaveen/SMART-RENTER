import express from "express";
import { protect } from "../middleware/auth.js";
import { addReview, getReviewsForProperty, updateReview, deleteReview, markReviewHelpful, getUserReviews } from "../controllers/reviewController.js";

const router = express.Router();

router.post("/", protect, addReview);
router.get("/property/:propertyId", getReviewsForProperty);
router.put("/:id", protect, updateReview);
router.delete("/:id", protect, deleteReview);
router.post("/:id/helpful", protect, markReviewHelpful);
router.get("/user/me", protect, getUserReviews);

export default router;
