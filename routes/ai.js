import express from "express";
import auth from "../middlewares/auth.js";
import roleCheck from "../middlewares/roleCheck.js";
import {
  symptomChecker,
  prescriptionExplanation,
  riskFlag,
} from "../controllers/aiController.js";

const router = express.Router();
router.use(auth);
router.post("/symptom-checker", roleCheck("doctor"), symptomChecker);
router.post(
  "/prescription-explanation",
  roleCheck("doctor", "patient"),
  prescriptionExplanation
);
router.post("/risk-flag", roleCheck("doctor", "admin"), riskFlag);

export default router;
