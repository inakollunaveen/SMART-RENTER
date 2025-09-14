import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import {
  addProperty,
  getProperties,
  getPropertiesByOwner,
  getPropertyById,
  updateProperty,
  deleteProperty,
  searchProperties
} from "../controllers/propertyController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../uploads")),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Routes
router.post("/", protect, upload.array("photos", 5), addProperty);
router.get("/", getProperties);
router.get("/search", searchProperties);
router.get("/owner/my-properties", protect, getPropertiesByOwner);
router.get("/:id", getPropertyById);
router.put("/:id", protect, upload.array("photos", 5), updateProperty);
router.delete("/:id", protect, deleteProperty);

export default router;
