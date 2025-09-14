// controllers/propertyController.js
import Property from "../models/Property.js";
import User from "../models/User.js";

// Add new property
export const addProperty = async (req, res, next) => {
  try {
    const {
      title,
      description,
      price,
      propertyType,
      location,
      bedrooms,
      bathrooms,
      area,
      furnished,
      petsAllowed,
      parking,
      amenities,
      ownerContactNumber
    } = req.body;

    // Validate required fields
    if (!title || !price || !propertyType || !location || !ownerContactNumber) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get owner from JWT
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const owner = await User.findById(req.user._id);
    if (!owner) return res.status(404).json({ error: "Owner not found" });

    // Handle photo uploads
    let photos = [];
    if (req.files && req.files.length > 0) {
      photos = req.files.map(file => `/uploads/${file.filename}`);
    }

    // Parse amenities if string
    let amenitiesArray = [];
    if (amenities) {
      if (typeof amenities === "string") {
        amenitiesArray = amenities.split(",").map(a => a.trim()).filter(a => a);
      } else if (Array.isArray(amenities)) {
        amenitiesArray = amenities;
      }
    }

    // Create property
    const property = new Property({
      owner: owner._id,
      title,
      description,
      price: parseFloat(price),
      propertyType,
      location,
      bedrooms: bedrooms ? parseInt(bedrooms) : 1,
      bathrooms: bathrooms ? parseInt(bathrooms) : 1,
      area: area ? parseFloat(area) : 0,
      furnished: furnished === "true" || furnished === true,
      petsAllowed: petsAllowed === "true" || petsAllowed === true,
      parking: parking === "true" || parking === true,
      amenities: amenitiesArray,
      ownerContactNumber,
      photos,
      approvalStatus: "pending" // ✅ automatically pending
    });

    await property.save();

    // Populate owner info
    await property.populate("owner", "name email");

    res.status(201).json({
      message: "Property added successfully",
      property
    });
  } catch (error) {
    console.error("Error adding property:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get all approved properties
export const getProperties = async (req, res) => {
  try {
    const properties = await Property.find({ approvalStatus: "approved" })
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    res.json({ properties });
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get current user's properties
export const getOwnerProperties = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const properties = await Property.find({ owner: req.user._id })
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    res.json({ properties });
  } catch (error) {
    console.error("Error fetching owner properties:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete property
export const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const property = await Property.findById(id);
    if (!property) return res.status(404).json({ error: "Property not found" });

    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not authorized to delete this property" });
    }

    await Property.findByIdAndDelete(id);

    res.json({ message: "Property deleted successfully" });
  } catch (error) {
    console.error("Error deleting property:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Search properties
export const searchProperties = async (req, res) => {
  try {
    const { location, minPrice, maxPrice, propertyType } = req.query;

    let query = { approvalStatus: "approved" };

    if (location) query.location = { $regex: location, $options: "i" };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    if (propertyType) query.propertyType = propertyType;

    const properties = await Property.find(query)
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    res.json({ properties });
  } catch (error) {
    console.error("Error searching properties:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get single property by ID
export const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findById(id).populate("owner", "name email");

    if (!property || property.approvalStatus !== "approved") {
      return res.status(404).json({ error: "Property not found" });
    }

    res.json({ property });
  } catch (error) {
    console.error("Error fetching property:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Update property
export const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!req.user || !req.user._id) return res.status(401).json({ error: "Authentication required" });

    const property = await Property.findById(id);
    if (!property) return res.status(404).json({ error: "Property not found" });

    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not authorized to update this property" });
    }

    // Handle photos
    if (req.files && req.files.length > 0) {
      const newPhotos = req.files.map(file => `/uploads/${file.filename}`);
      updates.photos = [...(property.photos || []), ...newPhotos];
    }

    // Parse amenities if string
    if (updates.amenities && typeof updates.amenities === "string") {
      updates.amenities = updates.amenities.split(",").map(a => a.trim()).filter(a => a);
    }

    // Convert string booleans
    ["furnished", "petsAllowed", "parking"].forEach(field => {
      if (updates[field] !== undefined) updates[field] = updates[field] === "true" || updates[field] === true;
    });

    const updatedProperty = await Property.findByIdAndUpdate(id, updates, { new: true, runValidators: true })
      .populate("owner", "name email");

    res.json({ message: "Property updated successfully", property: updatedProperty });
  } catch (error) {
    console.error("Error updating property:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get pending properties (Admin only)
export const getPendingProperties = async (req, res) => {
  try {
    const properties = await Property.find({ approvalStatus: "pending" })
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    res.json({ properties });
  } catch (error) {
    console.error("Error fetching pending properties:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Approve property (Admin only)
export const approveProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // "approved" or "rejected"

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const property = await Property.findById(id);
    if (!property) return res.status(404).json({ error: "Property not found" });

    property.approvalStatus = status;
    await property.save();

    await property.populate("owner", "name email");

    res.json({ message: `Property ${status} successfully`, property });
  } catch (error) {
    console.error("Error approving property:", error);
    res.status(500).json({ error: "Server error" });
  }
};
