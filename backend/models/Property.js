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
    address: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true, // Monthly rent price
      min: 0,
    },
    photos: [
      {
        type: String, // Array of photo URLs/paths
      },
    ],
    available: {
      type: Boolean,
      default: true,
    },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending", // Admin approval status
    },
    location: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
    },
    amenities: [
      {
        type: String,
      },
    ], // Array of amenities
    propertyType: {
      type: String,
      enum: [
        "single",
        "double",
        "triple",
        "1bhk",
        "2bhk",
        "3bhk",
        "apartment",
        "house",
        "villa",
        "studio",
      ],
      default: "apartment",
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
      type: Number, // in sqft or sqm
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
      required: true, // Owner’s contact number
      trim: true,
    },
    // Optional: if you later add reviews
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

// Index for location-based queries
propertySchema.index({ location: "2dsphere" });

// Virtual for average rating
propertySchema.virtual("averageRating").get(function () {
  if (this.reviews && this.reviews.length > 0) {
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / this.reviews.length;
  }
  return 0;
});

export default mongoose.model("Property", propertySchema);
