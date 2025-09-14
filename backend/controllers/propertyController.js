import Property from "../models/Property.js";

// @desc Add new property
// @route POST /api/properties
// @access Private
export const addProperty = async (req, res) => {
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
      photos,
    } = req.body;

    const owner = req.user; // ✅ must come from auth middleware

    // Basic validation
    if (!title || !location || !price || !propertyType || !ownerContactNumber) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    // Property type validation
    const allowedTypes = ["1BHK", "2BHK", "3BHK", "4BHK", "Villa"];
    if (!allowedTypes.includes(propertyType)) {
      return res.status(400).json({ message: "Invalid property type" });
    }

    // Convert amenities into array
    let amenitiesArray = [];
    if (amenities) {
      amenitiesArray = Array.isArray(amenities)
        ? amenities
        : amenities.split(",").map((item) => item.trim());
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
      area: area ? parseFloat(area) : null,
      furnished: furnished === "true" || furnished === true,
      petsAllowed: petsAllowed === "true" || petsAllowed === true,
      parking: parking === "true" || parking === true,
      amenities: amenitiesArray,
      ownerContactNumber,
      photos: photos && Array.isArray(photos) ? photos : [],
    });

    await property.save();

    res.status(201).json({
      message: "Property added successfully",
      property,
    });
  } catch (error) {
    console.error("Error adding property:", error);
    res.status(500).json({
      message: "Failed to add property",
      error: error.message,
    });
  }
};

// @desc Get all properties
// @route GET /api/properties
// @access Public
export const getProperties = async (req, res) => {
  try {
    const properties = await Property.find().populate("owner", "name email");
    res.json(properties);
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({
      message: "Failed to fetch properties",
      error: error.message,
    });
  }
};
