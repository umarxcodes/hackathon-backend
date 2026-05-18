import { body } from "express-validator";
import validateRequest from "../utils/validateRequest.js";

const registerValidation = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be 2-50 characters"),
  body("email").isEmail().withMessage("Valid email required").normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .matches(/[0-9]/)
    .withMessage("Password must contain a number"),
  body("role")
    .isIn(["admin", "doctor", "receptionist", "patient"])
    .withMessage("Invalid role"),
  validateRequest,
];

const loginValidation = [
  body("email").isEmail().withMessage("Valid email required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
  validateRequest,
];

export { registerValidation, loginValidation };
