import Booking from "../models/Booking.js";
import Property from "../models/Property.js";

// Create booking (tenant)
export const createBooking = async (req, res) => {
  try {
    const { propertyId, fromDate, toDate, message } = req.body;

    if (!propertyId || !fromDate || !toDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    if (!property.available || property.approvalStatus !== "approved") {
      return res.status(400).json({ message: "Property is not available for booking" });
    }

    // Check if user already has a pending booking for this property
    const existingBooking = await Booking.findOne({
      property: propertyId,
      tenant: req.user._id,
      status: { $in: ["pending", "approved"] }
    });

    if (existingBooking) {
      return res.status(400).json({ message: "You already have an active booking for this property" });
    }

    const booking = await Booking.create({
      property: propertyId,
      tenant: req.user._id,
      fromDate,
      toDate,
      message
    });

    await booking.populate(['property', 'tenant']);

    res.status(201).json({
      message: "Booking request sent successfully",
      booking
    });
  } catch (error) {
    console.error("Create booking error:", error);
    res.status(500).json({ message: "Failed to create booking", error: error.message });
  }
};

// Update booking status (owner only)
export const updateBookingStatus = async (req, res) => {
  try {
    const { status, ownerResponse } = req.body;

    if (!["approved", "rejected", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const booking = await Booking.findById(req.params.id).populate("property tenant");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if user is the property owner
    if (booking.property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this booking" });
    }

    booking.status = status;
    if (ownerResponse) {
      booking.ownerResponse = ownerResponse;
    }

    await booking.save();
    await booking.populate(['property', 'tenant']);

    res.json({
      message: `Booking ${status} successfully`,
      booking
    });
  } catch (error) {
    console.error("Update booking status error:", error);
    res.status(500).json({ message: "Failed to update booking status", error: error.message });
  }
};

// Get bookings for current user (tenant sees their bookings, owner sees bookings for their properties)
export const getBookingsForUser = async (req, res) => {
  try {
    let bookings;

    if (req.user.role === "user") {
      // Tenant: get their own bookings
      bookings = await Booking.find({ tenant: req.user._id })
        .populate("property", "title address price photos")
        .sort({ createdAt: -1 });
    } else if (req.user.role === "owner") {
      // Owner: get bookings for their properties
      const properties = await Property.find({ owner: req.user._id }).select("_id");
      const propertyIds = properties.map(p => p._id);

      bookings = await Booking.find({ property: { $in: propertyIds } })
        .populate("property", "title address price photos")
        .populate("tenant", "name email")
        .sort({ createdAt: -1 });
    } else {
      return res.status(403).json({ message: "Unauthorized role" });
    }

    res.json(bookings);
  } catch (error) {
    console.error("Get bookings error:", error);
    res.status(500).json({ message: "Failed to fetch bookings", error: error.message });
  }
};

// Get single booking details
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("property", "title address price photos owner")
      .populate("tenant", "name email");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if user is authorized to view this booking
    const isTenant = booking.tenant._id.toString() === req.user._id.toString();
    const isOwner = booking.property.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isTenant && !isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to view this booking" });
    }

    res.json(booking);
  } catch (error) {
    console.error("Get booking by ID error:", error);
    res.status(500).json({ message: "Failed to fetch booking", error: error.message });
  }
};

// Cancel booking (tenant only)
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("property");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Only tenant can cancel their own booking
    if (booking.tenant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to cancel this booking" });
    }

    // Can only cancel pending bookings
    if (booking.status !== "pending") {
      return res.status(400).json({ message: "Can only cancel pending bookings" });
    }

    booking.status = "cancelled";
    await booking.save();
    await booking.populate(['property', 'tenant']);

    res.json({
      message: "Booking cancelled successfully",
      booking
    });
  } catch (error) {
    console.error("Cancel booking error:", error);
    res.status(500).json({ message: "Failed to cancel booking", error: error.message });
  }
};
