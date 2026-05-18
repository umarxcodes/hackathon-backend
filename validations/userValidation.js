import { body } from "express-validator";
import validateRequest from "../utils/validateRequest.js";

const createUserValidation = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be 2-50 characters"),
  body("email").isEmail().withMessage("Valid email required").normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("role")
    .isIn(["admin", "doctor", "receptionist", "patient"])
    .withMessage("Invalid role"),
  body("subscriptionPlan").optional().isIn(["free", "pro"]),
  validateRequest,
];

const updateUserValidation = [
  body("name")
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be 2-50 characters"),
  body("role").optional().isIn(["admin", "doctor", "receptionist", "patient"]),
  body("isActive").optional().isBoolean(),
  body("subscriptionPlan").optional().isIn(["free", "pro"]),
  validateRequest,
];

export { createUserValidation, updateUserValidation };
