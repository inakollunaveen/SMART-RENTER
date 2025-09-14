import express from "express";
import { protect } from "../middleware/auth.js";
import { createBooking, updateBookingStatus, getBookingsForUser, getBookingById, cancelBooking } from "../controllers/bookingController.js";

const router = express.Router();
router.use(protect);

router.post("/", createBooking);
router.get("/", getBookingsForUser);
router.get("/:id", getBookingById);
router.put("/:id/status", updateBookingStatus);
router.put("/:id/cancel", cancelBooking);

export default router;
