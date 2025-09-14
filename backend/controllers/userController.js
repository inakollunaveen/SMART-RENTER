import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email already registered" });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, password: hashed, role });
    // set session
    req.session.userId = user._id;
    req.session.role = user.role;

    res.status(201).json({
      message: "Registered and logged in",
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    next(err);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Missing credentials" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    // set session
    req.session.userId = user._id;
    req.session.role = user.role;

    res.json({ message: "Login successful", user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
};

export const logoutUser = async (req, res, next) => {
  try {
    req.session.destroy((err) => {
      if (err) return next(err);
      res.clearCookie("sr_sid");
      res.json({ message: "Logged out" });
    });
  } catch (err) {
    next(err);
  }
};

// simple route to get current user
export const getCurrentUser = async (req, res, next) => {
  try {
    if (!req.session || !req.session.userId) return res.json({ user: null });
    const user = await User.findById(req.session.userId).select("-password");
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

export const welcomeUser = (req, res) => {
  console.log(`Request received: ${req.method} ${req.path}`);
  res.json({ message: "Welcome to the User API!" });
};
