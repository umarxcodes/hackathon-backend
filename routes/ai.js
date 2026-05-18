import express from "express";
import auth from "../middleware/auth.js";
import roleCheck from "../middleware/roleCheck.js";
import {
  symptomCheckerValidation,
  prescriptionExplanationValidation,
  riskFlagValidation,
} from "../validations/aiValidation.js";
import {
  symptomChecker,
  prescriptionExplanation,
  riskFlag,
} from "../controllers/aiController.js";

const router = express.Router();
router.use(auth);
router.post(
  "/symptom-checker",
  roleCheck("doctor"),
  symptomCheckerValidation,
  symptomChecker
);
router.post(
  "/prescription-explanation",
  roleCheck("doctor", "patient"),
  prescriptionExplanationValidation,
  prescriptionExplanation
);
router.post(
  "/risk-flag",
  roleCheck("doctor", "admin"),
  riskFlagValidation,
  riskFlag
);

export default router;
