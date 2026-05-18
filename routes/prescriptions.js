import express from "express";
import auth from "../middleware/auth.js";
import roleCheck from "../middleware/roleCheck.js";
import { createPrescriptionValidation } from "../validations/prescriptionValidation.js";
import {
  getPrescriptions,
  createPrescription,
  getPrescription,
  updatePrescription,
  downloadPrescriptionPDF,
} from "../controllers/prescriptionController.js";

const router = express.Router();
router.use(auth);
router.get("/", roleCheck("admin", "doctor", "patient"), getPrescriptions);
router.post(
  "/",
  roleCheck("doctor"),
  createPrescriptionValidation,
  createPrescription
);
router.get(
  "/:id/pdf",
  roleCheck("admin", "doctor", "patient"),
  downloadPrescriptionPDF
);
router.get("/:id", roleCheck("admin", "doctor", "patient"), getPrescription);
router.put("/:id", roleCheck("doctor"), updatePrescription);

export default router;
