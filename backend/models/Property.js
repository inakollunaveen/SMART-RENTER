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
    location: {
      type: String,
      required: true, // Frontend sends location as string
      trim: true,
    },
    price: {
      type: Number,
      required: true, // Monthly rent
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
      default: "pending",
    },
    amenities: [
      {
        type: String,
      },
    ],
    propertyType: {
      type: String,
      enum: ["1 Bhk", "2 Bhk", "3 Bhk", "4 Bhk", "VILLA"],
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
      type: Number,
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
  },
  { timestamps: true }
);

export default mongoose.model("Property", propertySchema);
