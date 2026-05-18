import express from "express";
import auth from "../middleware/auth.js";
import roleCheck from "../middleware/roleCheck.js";
import {
  getDiagnosisLogs,
  getDiagnosisLogById,
  getDiagnosisByPatient,
} from "../controllers/diagnosisController.js";

const router = express.Router();
router.use(auth);
router.get("/", roleCheck("admin", "doctor", "patient"), getDiagnosisLogs);
router.get(
  "/patient/:patientId",
  roleCheck("admin", "doctor", "patient"),
  getDiagnosisByPatient
);
router.get(
  "/:id",
  roleCheck("admin", "doctor", "patient"),
  getDiagnosisLogById
);

export default router;
