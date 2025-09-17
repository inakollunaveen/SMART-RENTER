import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { signup, login } from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/register", signup);
router.post("/login", login);

// Google OAuth routes
router.get("/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get("/google/callback",
  passport.authenticate("google", { failureRedirect: "/auth" }),
  (req, res) => {
    // Generate JWT token
    const token = jwt.sign(
      { id: req.user._id, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Redirect to frontend with token
    const redirectUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/auth?token=${token}`;
    res.redirect(redirectUrl);
  }
);

export default router;
