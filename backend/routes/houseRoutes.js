import express from "express";
import multer from "multer";
import {
  createHouse, getHouses, getHouseById, updateHouse, deleteHouse, searchByLocation
} from "../controllers/houseController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// multer simple disk storage (adjust path as needed)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// public
router.get("/", getHouses);
router.get("/search", searchByLocation);
router.get("/:id", getHouseById);

// protected (owner)
router.post("/", protect, authorize("owner"), createHouse);
router.put("/:id", protect, authorize("owner"), updateHouse);
router.delete("/:id", protect, authorize("owner"), deleteHouse);

// upload photos
router.post("/:id/photos", protect, authorize("owner"), upload.array("photos", 5), async (req, res, next) => {
  try {
    const houseId = req.params.id;
    const house = await (await import("../models/House.js")).default.findById(houseId);
    if (!house) return res.status(404).json({ error: "House not found" });
    if (house.owner.toString() !== req.user._id.toString()) return res.status(403).json({ error: "Not authorized" });

    const urls = req.files.map(f => `/uploads/${f.filename}`); // or upload to cloud and store remote URLs
    house.photos = house.photos.concat(urls);
    await house.save();
    res.json(house);
  } catch (err) {
    next(err);
  }
});

export default router;
