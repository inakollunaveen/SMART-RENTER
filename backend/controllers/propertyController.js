import Property from "../models/Property.js";

// ✅ Add property
export const addProperty = async (req, res) => {
  try {
    const { title, description, price, propertyType, location } = req.body;

    const photos = req.files ? req.files.map(file => file.filename) : [];

    const property = new Property({
      owner: req.user.id,
      title,
      description,
      price,
      propertyType,
      location,
      photos,
      status: "pending"
    });

    await property.save();
    res.status(201).json(property);
  } catch (err) {
    res.status(500).json({ message: "Failed to add property", error: err.message });
  }
};

// ✅ Get all approved properties
export const getProperties = async (req, res) => {
  try {
    const properties = await Property.find({ status: "approved" });
    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch properties", error: err.message });
  }
};

// ✅ Get properties of logged-in owner
export const getOwnerProperties = async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.user.id });
    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch owner properties", error: err.message });
  }
};

// ✅ Search properties
export const searchProperties = async (req, res) => {
  try {
    const { propertyType, location, minPrice, maxPrice } = req.query;

    let query = { status: "approved" };

    if (propertyType) query.propertyType = propertyType;
    if (location) query.location = { $regex: location, $options: "i" };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const properties = await Property.find(query);
    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: "Search failed", error: err.message });
  }
};

// ✅ Get property by ID
export const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });
    res.json(property);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch property", error: err.message });
  }
};

// ✅ Update property
export const updateProperty = async (req, res) => {
  try {
    const { title, description, price, propertyType, location } = req.body;

    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    if (property.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    property.title = title || property.title;
    property.description = description || property.description;
    property.price = price || property.price;
    property.propertyType = propertyType || property.propertyType;
    property.location = location || property.location;

    if (req.files && req.files.length > 0) {
      property.photos = req.files.map(file => file.filename);
    }

    await property.save();
    res.json(property);
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
};

// ✅ Delete property
export const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    if (property.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    await property.deleteOne();
    res.json({ message: "Property deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
};

// ✅ Get pending properties (Admin)
export const getPendingProperties = async (req, res) => {
  try {
    const properties = await Property.find({ status: "pending" });
    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch pending properties", error: err.message });
  }
};

// ✅ Approve property (Admin)
export const approveProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    property.status = "approved";
    await property.save();

    res.json({ message: "Property approved", property });
  } catch (err) {
    res.status(500).json({ message: "Approval failed", error: err.message });
  }
};
