import Property from "../models/Property.js";
import { getCoordinates } from "../utils/mapsHelper.js";

// ✅ Add new property
export const addProperty = async (req, res) => {
  try {
    const {
      title,
      description,
      address,
      price,
      propertyType,
      bedrooms,
      bathrooms,
      area,
      furnished,
      petsAllowed,
      parking,
      amenities,
      ownerContactNumber
    } = req.body;

    if (!title || !address || !price || !propertyType || !ownerContactNumber) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const coords = await getCoordinates(address);

    const photos = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    const property = await Property.create({
      owner: req.user._id,
      title,
      description,
      address,
      price: Number(price),
      propertyType,
      bedrooms: bedrooms ? Number(bedrooms) : 1,
      bathrooms: bathrooms ? Number(bathrooms) : 1,
      area: area ? Number(area) : 0,
      furnished: furnished === 'true',
      petsAllowed: petsAllowed === 'true',
      parking: parking === 'true',
      amenities: amenities ? (amenities.startsWith("[") ? JSON.parse(amenities) : amenities.split(",").map(a => a.trim())) : [],
      ownerContactNumber,
      location: coords,
      photos
    });

    await property.populate("owner", "name email");

    res.status(201).json({ message: "Property added successfully", property });
  } catch (error) {
    console.error("Add property error:", error);
    res.status(500).json({ message: "Failed to add property", error: error.message });
  }
};

// ✅ Get all properties
export const getProperties = async (req, res) => {
  try {
    const properties = await Property.find({ available: true, approvalStatus: "approved" })
      .populate("owner", "name email")
      .sort({ createdAt: -1 });
    res.json({ properties });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch properties", error: error.message });
  }
};

// ✅ Get single property by ID
export const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate("owner", "name email");
    if (!property || property.approvalStatus !== "approved") {
      return res.status(404).json({ message: "Property not found" });
    }
    res.json({ property });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch property", error: error.message });
  }
};

// ✅ Get properties by owner
export const getPropertiesByOwner = async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.user._id }).populate("owner", "name email").sort({ createdAt: -1 });
    res.json({ properties });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch properties", error: error.message });
  }
};

// ✅ Update property
export const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updates = req.body;
    if (req.files && req.files.length > 0) {
      const newPhotos = req.files.map(file => `/uploads/${file.filename}`);
      updates.photos = [...(property.photos || []), ...newPhotos];
    }

    if (updates.address && updates.address !== property.address) {
      updates.location = await getCoordinates(updates.address);
    }

    if (updates.amenities && typeof updates.amenities === "string") {
      updates.amenities = updates.amenities.startsWith("[") ? JSON.parse(updates.amenities) : updates.amenities.split(",").map(a => a.trim());
    }

    const updatedProperty = await Property.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).populate("owner", "name email");

    res.json({ message: "Property updated successfully", property: updatedProperty });
  } catch (error) {
    res.status(500).json({ message: "Failed to update property", error: error.message });
  }
};

// ✅ Delete property
export const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Property.findByIdAndDelete(req.params.id);
    res.json({ message: "Property deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete property", error: error.message });
  }
};

// ✅ Search properties with flexible filters
export const searchProperties = async (req, res) => {
  try {
    const { location, minPrice, maxPrice, propertyType, ownerId } = req.query;

    const query = { available: true, approvalStatus: "approved" };

    if (location) query.address = { $regex: location, $options: "i" };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (propertyType) query.propertyType = propertyType;
    if (ownerId) query.owner = ownerId;

    const properties = await Property.find(query).populate("owner", "name email").sort({ createdAt: -1 });

    res.json({ properties });
  } catch (error) {
    res.status(500).json({ message: "Failed to search properties", error: error.message });
  }
};
