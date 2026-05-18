import express from "express";
import auth from "../middlewares/auth.js";
import roleCheck from "../middlewares/roleCheck.js";
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
  createAppointment
);
router.get(
  "/doctor/:doctorId",
  roleCheck("admin", "receptionist", "doctor"),
  getDoctorSchedule
);
router.get("/:id", getAppointment);
router.put("/:id", updateAppointment);
router.delete("/:id", cancelAppointment);

export default router;
