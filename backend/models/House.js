import mongoose from "mongoose";

const houseSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  address: { type: String, required: true },
  rent: { type: Number, required: true },
  description: { type: String },
  photos: [{ type: String }], // URLs or local paths
  available: { type: Boolean, default: true },
  location: {
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 }
  }
}, { timestamps: true });

export default mongoose.model("House", houseSchema);
