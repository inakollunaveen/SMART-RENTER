import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  property: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String },
  verified: { type: Boolean, default: false }, // Verified if tenant actually rented the property
  helpful: { type: Number, default: 0 }, // Number of users who found this review helpful
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
reviewSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Index for efficient queries
reviewSchema.index({ property: 1, createdAt: -1 });

export default mongoose.model("Review", reviewSchema);
