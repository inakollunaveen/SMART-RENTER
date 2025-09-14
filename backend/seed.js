import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Property from "./models/Property.js";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

const seed = async () => {
  try {
    // Clear existing data (optional)
    await User.deleteMany();
    await Property.deleteMany();

    // Create a user
    const user = await User.create({
      name: "John Doe",
      email: "owner@example.com",
      password: "hashed_password_here", // replace with bcrypt hash if needed
      role: "user",
    });

    // Seed properties
    const properties = [
      {
        owner: user._id,
        title: "Cozy Apartment in City Center",
        description: "Modern apartment in the heart of the city",
        address: "123 Main St, City",
        price: 25000,
        photos: [],
        available: true,
        approvalStatus: "approved", // ✅ approved immediately
        location: { lat: 0, lng: 0 },
        amenities: ["Lift", "Security", "Gym"],
        propertyType: "apartment",
        bedrooms: 2,
        bathrooms: 1,
        area: 750,
        furnished: true,
        petsAllowed: true,
        parking: false,
        ownerContactNumber: "9876543210",
      },
      {
        owner: user._id,
        title: "Spacious Villa with Garden",
        description: "Beautiful villa with large garden and pool",
        address: "456 Garden Rd, Suburb",
        price: 50000,
        photos: [],
        available: true,
        approvalStatus: "approved",
        location: { lat: 0, lng: 0 },
        amenities: ["Pool", "Garden", "Garage"],
        propertyType: "villa",
        bedrooms: 4,
        bathrooms: 3,
        area: 3000,
        furnished: false,
        petsAllowed: true,
        parking: true,
        ownerContactNumber: "9876543210",
      },
      {
        owner: user._id,
        title: "Studio Apartment for Singles",
        description: "Compact and cozy studio",
        address: "789 Downtown St, City",
        price: 15000,
        photos: [],
        available: true,
        approvalStatus: "approved",
        location: { lat: 0, lng: 0 },
        amenities: ["Lift", "Security"],
        propertyType: "studio",
        bedrooms: 1,
        bathrooms: 1,
        area: 400,
        furnished: true,
        petsAllowed: false,
        parking: false,
        ownerContactNumber: "9876543210",
      },
    ];

    await Property.insertMany(properties);
    console.log("✅ Seeded users and properties!");

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

connectDB().then(seed);
