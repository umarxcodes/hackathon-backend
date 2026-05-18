import express from "express";
import auth from "../middleware/auth.js";
import roleCheck from "../middleware/roleCheck.js";
import {
  createPatientValidation,
  updatePatientValidation,
} from "../validations/patientValidation.js";
import {
  getPatients,
  createPatient,
  getPatient,
  updatePatient,
  deletePatient,
  getPatientTimeline,
} from "../controllers/patientController.js";

const router = express.Router();
router.use(auth);
router.get("/", roleCheck("admin", "doctor", "receptionist"), getPatients);
router.post(
  "/",
  roleCheck("admin", "receptionist"),
  createPatientValidation,
  createPatient
);
router.get(
  "/:id/timeline",
  roleCheck("admin", "doctor", "receptionist", "patient"),
  getPatientTimeline
);
router.get(
  "/:id",
  roleCheck("admin", "doctor", "receptionist", "patient"),
  getPatient
);
router.put(
  "/:id",
  roleCheck("admin", "receptionist"),
  updatePatientValidation,
  updatePatient
);
router.delete("/:id", roleCheck("admin"), deletePatient);

export default router;
