import { body } from "express-validator";
import validateRequest from "../utils/validateRequest.js";

const symptomCheckerValidation = [
  body("patientId").isMongoId().withMessage("Valid patientId required"),
  body("symptoms")
    .isArray({ min: 1 })
    .withMessage("At least one symptom required"),
  body("age").isInt({ min: 0, max: 150 }).withMessage("Valid age required"),
  body("gender")
    .isIn(["male", "female", "other"])
    .withMessage("Invalid gender"),
  body("history").optional().isString().isLength({ max: 1000 }),
  validateRequest,
];

const prescriptionExplanationValidation = [
  body("prescriptionId")
    .isMongoId()
    .withMessage("Valid prescriptionId required"),
  validateRequest,
];

const riskFlagValidation = [
  body("patientId").isMongoId().withMessage("Valid patientId required"),
  validateRequest,
];

export {
  symptomCheckerValidation,
  prescriptionExplanationValidation,
  riskFlagValidation,
};
