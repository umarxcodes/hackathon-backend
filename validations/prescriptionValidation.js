import { body } from "express-validator";
import validateRequest from "../utils/validateRequest.js";

const createPrescriptionValidation = [
  body("patientId").isMongoId().withMessage("Valid patientId required"),
  body("medicines")
    .isArray({ min: 1 })
    .withMessage("Medicines array required with at least one item"),
  body("medicines.*.name").notEmpty().withMessage("Medicine name required"),
  body("medicines.*.dosage").notEmpty().withMessage("Dosage required"),
  body("medicines.*.frequency").notEmpty().withMessage("Frequency required"),
  body("medicines.*.duration").notEmpty().withMessage("Duration required"),
  body("instructions").optional().isString().isLength({ max: 1000 }),
  validateRequest,
];

export { createPrescriptionValidation };
