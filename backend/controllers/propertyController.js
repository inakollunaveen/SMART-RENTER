import Property from "../models/Property.js";
import User from "../models/User.js";

// Add property
export const addProperty = async (req, res, next) => {
  try {
    const {
      title,
      description,
      location,
      price,
      propertyType,
      bedrooms,
      bathrooms,
      area,
      furnished,
      petsAllowed,
      parking,
      amenities,
      ownerContactNumber,
    } = req.body;

    // Validation
    if (!title || !price || !propertyType || !location || !ownerContactNumber) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const owner = await User.findById(req.user._id);
    if (!owner) return res.status(404).json({ error: "Owner not found" });

    // Photos
    let photos = [];
    if (req.files && req.files.length > 0) {
      photos = req.files.map(file => `/uploads/${file.filename}`);
    }

    // Amenities array
    let amenitiesArray = [];
    if (amenities) {
      if (typeof amenities === "string") {
        amenitiesArray = amenities.split(",").map(a => a.trim()).filter(a => a);
      } else if (Array.isArray(amenities)) {
        amenitiesArray = amenities;
      }
    }

    const property = new Property({
      owner: owner._id,
      title,
      description,
      location,
      price: parseFloat(price),
      propertyType,
      bedrooms: bedrooms ? parseInt(bedrooms) : 1,
      bathrooms: bathrooms ? parseInt(bathrooms) : 1,
      area: area ? parseFloat(area) : 0,
      furnished: furnished === "true" || furnished === true,
      petsAllowed: petsAllowed === "true" || petsAllowed === true,
      parking: parking === "true" || parking === true,
      amenities: amenitiesArray,
      ownerContactNumber,
      photos,
    });

    await property.save();

    res.status(201).json({
      message: "Property added successfully",
      property,
    });
  } catch (error) {
    console.error("Error adding property:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Search properties
export const searchProperties = async (req, res, next) => {
  try {
    const { location, propertyType, minPrice, maxPrice } = req.query;

    let query = { available: true, approvalStatus: "approved" };

    if (location) query.location = { $regex: location, $options: "i" };
    if (propertyType) query.propertyType = propertyType;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    const properties = await Property.find(query).sort({ createdAt: -1 });
    res.json({ properties });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
