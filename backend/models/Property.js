// models/Property.js
import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: true, // Monthly rent price
      min: 0,
    },
    photos: [
      {
        type: String, // Array of photo filenames/URLs
      },
    ],
    available: {
      type: Boolean,
      default: true,
    },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending", // ✅ auto set to pending
    },
    location: {
      type: String, // ✅ frontend will send text location (e.g., "Hyderabad, Telangana")
      required: true,
      trim: true,
    },
    amenities: [
      {
        type: String,
      },
    ],
    propertyType: {
      type: String,
      enum: ["1BHK", "2BHK", "3BHK", "4BHK", "Villa"], // ✅ Only these allowed
      required: true,
    },
    bedrooms: {
      type: Number,
      default: 1,
      min: 0,
    },
    bathrooms: {
      type: Number,
      default: 1,
      min: 0,
    },
    area: {
      type: Number, // in sqft
      default: 0,
    },
    furnished: {
      type: Boolean,
      default: false,
    },
    petsAllowed: {
      type: Boolean,
      default: false,
    },
    parking: {
      type: Boolean,
      default: false,
    },
    ownerContactNumber: {
      type: String,
      required: true,
      trim: true,
    },
    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        rating: { type: Number, min: 1, max: 5 },
        comment: { type: String },
      },
    ],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual for average rating
propertySchema.virtual("averageRating").get(function () {
  if (this.reviews && this.reviews.length > 0) {
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / this.reviews.length;
  }
  return 0;
});

export default mongoose.model("Property", propertySchema);
