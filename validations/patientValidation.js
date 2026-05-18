import { body } from "express-validator";
import validateRequest from "../utils/validateRequest.js";

const phoneRegex = /^[\d\s+()-]{7,15}$/;

const createPatientValidation = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be 2-100 chars"),
  body("age").isInt({ min: 0, max: 150 }).withMessage("Age must be 0-150"),
  body("gender")
    .isIn(["male", "female", "other"])
    .withMessage("Invalid gender"),
  body("contact").matches(phoneRegex).withMessage("Invalid contact number"),
  body("bloodGroup")
    .optional()
    .isIn(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"]),
  validateRequest,
];

const updatePatientValidation = [
  body("name").optional().isLength({ min: 2, max: 100 }),
  body("age").optional().isInt({ min: 0, max: 150 }),
  body("gender").optional().isIn(["male", "female", "other"]),
  body("contact").optional().matches(phoneRegex),
  validateRequest,
];

export { createPatientValidation, updatePatientValidation };
