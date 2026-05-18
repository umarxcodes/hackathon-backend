import express from "express";
import {
  register,
  login,
  getMe,
  logout,
} from "../controllers/authController.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import {
  registerValidation,
  loginValidation,
} from "../validations/authValidation.js";
import auth from "../middleware/auth.js";

const router = express.Router();
router.post("/register", authLimiter, registerValidation, register);
router.post("/login", authLimiter, loginValidation, login);
router.get("/me", auth, getMe);
router.get("/logout", auth, logout);

export default router;
