import axios from "axios";
import House from "../models/House.js";

// create house (owner only)
export const createHouse = async (req, res, next) => {
  try {
    // owner must be authenticated & owner-role enforced in route
    const ownerId = req.user._id;
    const { title, address, rent, description, photos } = req.body;

    // geocode
    let location = { lat: 0, lng: 0 };
    if (address && process.env.GOOGLE_MAPS_API_KEY) {
      const geoRes = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
        params: { address, key: process.env.GOOGLE_MAPS_API_KEY }
      });
      location = geoRes.data.results[0]?.geometry?.location || location;
    }

    const house = await House.create({
      owner: ownerId,
      title,
      address,
      rent,
      description,
      photos: photos || [],
      location
    });

    res.status(201).json(house);
  } catch (err) {
    next(err);
  }
};

export const getHouses = async (req, res, next) => {
  try {
    const houses = await House.find().populate("owner", "name email");
    res.json(houses);
  } catch (err) {
    next(err);
  }
};

export const getHouseById = async (req, res, next) => {
  try {
    const house = await House.findById(req.params.id).populate("owner", "name email");
    if (!house) return res.status(404).json({ error: "House not found" });
    res.json(house);
  } catch (err) {
    next(err);
  }
};

export const updateHouse = async (req, res, next) => {
  try {
    const house = await House.findById(req.params.id);
    if (!house) return res.status(404).json({ error: "House not found" });
    if (house.owner.toString() !== req.user._id.toString()) return res.status(403).json({ error: "Not authorized" });

    const { title, address, rent, description, photos, available } = req.body;
    if (title !== undefined) house.title = title;
    if (address !== undefined) house.address = address;
    if (rent !== undefined) house.rent = rent;
    if (description !== undefined) house.description = description;
    if (photos !== undefined) house.photos = photos;
    if (available !== undefined) house.available = available;

    // optionally update geocode if address changed
    if (address && process.env.GOOGLE_MAPS_API_KEY) {
      const geoRes = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
        params: { address, key: process.env.GOOGLE_MAPS_API_KEY }
      });
      house.location = geoRes.data.results[0]?.geometry?.location || house.location;
    }

    await house.save();
    res.json(house);
  } catch (err) {
    next(err);
  }
};

export const deleteHouse = async (req, res, next) => {
  try {
    const house = await House.findById(req.params.id);
    if (!house) return res.status(404).json({ error: "House not found" });
    if (house.owner.toString() !== req.user._id.toString()) return res.status(403).json({ error: "Not authorized" });

    await house.remove();
    res.json({ message: "House removed" });
  } catch (err) {
    next(err);
  }
};

// simple location search: find houses within a bounding box (approx)
export const searchByLocation = async (req, res, next) => {
  try {
    const { lat, lng, radiusKm = 10 } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: "Provide lat and lng" });

    // rough bounding box (latitude ~ 111km per degree). This is simple — for production use geospatial indexes.
    const delta = radiusKm / 111;
    const houses = await House.find({
      "location.lat": { $gte: parseFloat(lat) - delta, $lte: parseFloat(lat) + delta },
      "location.lng": { $gte: parseFloat(lng) - delta, $lte: parseFloat(lng) + delta },
      available: true
    }).populate("owner", "name email");

    res.json(houses);
  } catch (err) {
    next(err);
  }
};
