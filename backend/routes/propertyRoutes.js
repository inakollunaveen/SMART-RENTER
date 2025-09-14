import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import {
  addProperty,
  getProperties,
  getOwnerProperties,
  deleteProperty,
  searchProperties,
  getPropertyById,
  updateProperty,
  getPendingProperties,
  approveProperty
} from "../controllers/propertyController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Configure multer for file uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  }
});

// Routes
router.post("/", protect, upload.array("photos", 5), addProperty);
router.get("/", getProperties);
router.get("/search", searchProperties);
router.get("/pending", protect, authorize("admin"), getPendingProperties);
router.get("/owner/my-properties", protect, getOwnerProperties);
router.get("/:id", getPropertyById);
router.put("/:id", protect, upload.array("photos", 5), updateProperty);
router.put("/:id/approve", protect, authorize("admin"), approveProperty);
router.delete("/:id", protect, deleteProperty);

export default router;
