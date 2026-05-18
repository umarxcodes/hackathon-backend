import express from "express";
import auth from "../middleware/auth.js";
import roleCheck from "../middleware/roleCheck.js";
import {
  createAppointmentValidation,
  updateAppointmentValidation,
} from "../validations/appointmentValidation.js";
import {
  getAppointments,
  createAppointment,
  getAppointment,
  updateAppointment,
  cancelAppointment,
  getDoctorSchedule,
} from "../controllers/appointmentController.js";

const router = express.Router();
router.use(auth);
router.get("/", getAppointments);
router.post(
  "/",
  roleCheck("admin", "receptionist", "patient"),
  createAppointmentValidation,
  createAppointment
);
router.get(
  "/doctor/:doctorId",
  roleCheck("admin", "receptionist", "doctor"),
  getDoctorSchedule
);
router.get("/:id", getAppointment);
router.put("/:id", updateAppointmentValidation, updateAppointment);
router.delete("/:id", cancelAppointment);

export default router;
