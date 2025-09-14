import express from "express";
import { registerUser, loginUser, logoutUser, getCurrentUser, welcomeUser } from "../controllers/userController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/me", getCurrentUser);
router.get("/welcome", welcomeUser);

export default router;
