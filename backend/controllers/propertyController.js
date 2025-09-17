import Property from "../models/Property.js";
import User from "../models/User.js";

// Add a new property
export const addProperty = async (req, res, next) => {
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

    // Validate required fields
    if (!title || !address || !price || !propertyType || !ownerContactNumber) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get owner from JWT
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const owner = await User.findById(req.user._id);
    if (!owner) {
      return res.status(404).json({ error: "Owner not found" });
    }

    // Handle photo uploads (if any)
    let photos = [];
    if (req.files && req.files.length > 0) {
      // Assuming multer is used for file uploads
      photos = req.files.map(file => `/uploads/${file.filename}`);
    }

    // Parse amenities if it's a string
    let amenitiesArray = [];
    if (amenities) {
      if (typeof amenities === 'string') {
        amenitiesArray = amenities.split(',').map(item => item.trim()).filter(item => item);
      } else if (Array.isArray(amenities)) {
        amenitiesArray = amenities;
      }
    }

    // Normalize propertyType to match schema enum
    console.log('Received propertyType:', propertyType);
    let normalizedPropertyType = propertyType.toUpperCase();
    if (!normalizedPropertyType.includes(' ')) {
      normalizedPropertyType = normalizedPropertyType.replace(/(\d+)/, '$1 ');
    }
    if (!normalizedPropertyType.includes('BHK')) {
      normalizedPropertyType = normalizedPropertyType + ' BHK';
    }
    console.log('Normalized propertyType:', normalizedPropertyType);

    // Create new property
    const property = new Property({
      owner: owner._id,
      title,
      description,
      address,
      price: parseFloat(price),
      propertyType: normalizedPropertyType,
      bedrooms: bedrooms ? parseInt(bedrooms) : 1,
      bathrooms: bathrooms ? parseInt(bathrooms) : 1,
      area: area ? parseFloat(area) : null,
      furnished: furnished === 'true' || furnished === true,
      petsAllowed: petsAllowed === 'true' || petsAllowed === true,
      parking: parking === 'true' || parking === true,
      amenities: amenitiesArray,
      ownerContactNumber,
      photos
    });

    await property.save();

    // Populate owner details for response
    await property.populate('owner', 'name email');

    res.status(201).json({
      message: "Property added successfully",
      property
    });
  } catch (error) {
    console.error('Error adding property:', error);
    // Add detailed error logging for diagnosis
    if (error.errors) {
      for (const key in error.errors) {
        console.error(`Validation error for ${key}:`, error.errors[key].message);
      }
    }
    if (error.message) {
      console.error('Error message:', error.message);
    }
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    next(error);
  }
};

// Get all properties
export const getProperties = async (req, res, next) => {
  try {
    const properties = await Property.find({ available: true, approvalStatus: "approved" })
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });

    res.json({ properties });
  } catch (error) {
    console.error('Error fetching properties:', error);
    next(error);
  }
};

// Get properties owned by current user
export const getOwnerProperties = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const properties = await Property.find({ owner: req.user._id })
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });

    res.json(properties);
  } catch (error) {
    console.error('Error fetching owner properties:', error);
    next(error);
  }
};

// Delete a property
export const deleteProperty = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    // Check if the current user owns this property
    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not authorized to delete this property" });
    }

    await Property.findByIdAndDelete(id);

    res.json({ message: "Property deleted successfully" });
  } catch (error) {
    console.error('Error deleting property:', error);
    next(error);
  }
};

// Search properties
export const searchProperties = async (req, res, next) => {
  try {
    const {
      location,
      minPrice,
      maxPrice,
      propertyType,
      bedrooms,
      furnished,
      petsAllowed
    } = req.query;

    let query = { available: true, approvalStatus: "approved" };

    // Add filters based on query parameters
    if (location) {
      query.address = { $regex: location, $options: 'i' };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    if (propertyType) {
      query.propertyType = propertyType;
    }

    if (bedrooms) {
      query.bedrooms = parseInt(bedrooms);
    }

    if (furnished !== undefined) {
      query.furnished = furnished === 'true';
    }

    if (petsAllowed !== undefined) {
      query.petsAllowed = petsAllowed === 'true';
    }

    const properties = await Property.find(query)
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });

    res.json({ properties });
  } catch (error) {
    console.error('Error searching properties:', error);
    next(error);
  }
};

// Get single property by ID
export const getPropertyById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const property = await Property.findById(id)
      .populate('owner', 'name email');

    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    // Check if property is approved (tenants should only see approved properties)
    if (property.approvalStatus !== "approved") {
      return res.status(404).json({ error: "Property not found" });
    }

    res.json({ property });
  } catch (error) {
    console.error('Error fetching property:', error);
    next(error);
  }
};

// Update property
export const updateProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    // Check if the current user owns this property
    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not authorized to update this property" });
    }

    // Handle photo uploads (if any)
    if (req.files && req.files.length > 0) {
      const newPhotos = req.files.map(file => `/uploads/${file.filename}`);
      updates.photos = [...(property.photos || []), ...newPhotos];
    }

    // Parse amenities if it's a string
    if (updates.amenities && typeof updates.amenities === 'string') {
      updates.amenities = updates.amenities.split(',').map(item => item.trim()).filter(item => item);
    }

    // Convert string booleans to actual booleans
    if (updates.furnished !== undefined) {
      updates.furnished = updates.furnished === 'true' || updates.furnished === true;
    }
    if (updates.petsAllowed !== undefined) {
      updates.petsAllowed = updates.petsAllowed === 'true' || updates.petsAllowed === true;
    }
    if (updates.parking !== undefined) {
      updates.parking = updates.parking === 'true' || updates.parking === true;
    }

    const updatedProperty = await Property.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('owner', 'name email');

    res.json({
      message: "Property updated successfully",
      property: updatedProperty
    });
  } catch (error) {
    console.error('Error updating property:', error);
    next(error);
  }
};

// Get pending properties (Admin only)
export const getPendingProperties = async (req, res, next) => {
  try {
    const properties = await Property.find({ approvalStatus: "pending" })
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });

    res.json({ properties });
  } catch (error) {
    console.error('Error fetching pending properties:', error);
    next(error);
  }
};

// Approve or reject property (Admin only)
export const approveProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // "approved" or "rejected"

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid approval status" });
    }

    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    property.approvalStatus = status;
    await property.save();

    await property.populate('owner', 'name email');

    res.json({
      message: `Property ${status} successfully`,
      property
    });
  } catch (error) {
    console.error('Error approving property:', error);
    next(error);
  }
};
