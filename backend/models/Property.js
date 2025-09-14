import mongoose from "mongoose";

const propertySchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  address: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  photos: [{ type: String }],
  available: { type: Boolean, default: true },
  approvalStatus: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  location: { lat: { type: Number, default: 0 }, lng: { type: Number, default: 0 } },
  amenities: [{ type: String }],
  propertyType: {
    type: String,
    enum: ["1 Bhk", "2 Bhk", "3 Bhk", "4 Bhk", "Villa"],
    default: "1 Bhk",
  },
  bedrooms: { type: Number, default: 1, min: 0 },
  bathrooms: { type: Number, default: 1, min: 0 },
  area: { type: Number, default: 0 },
  furnished: { type: Boolean, default: false },
  petsAllowed: { type: Boolean, default: false },
  parking: { type: Boolean, default: false },
  ownerContactNumber: { type: String, required: true, trim: true },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

propertySchema.index({ location: "2dsphere" });

export default mongoose.model("Property", propertySchema);
