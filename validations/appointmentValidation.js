import { body } from "express-validator";
import validateRequest from "../utils/validateRequest.js";

const timeSlotRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i;

const createAppointmentValidation = [
  body("patientId").isMongoId().withMessage("Valid patientId required"),
  body("doctorId").isMongoId().withMessage("Valid doctorId required"),
  body("date").isISO8601().toDate().withMessage("Valid date required"),
  body("date").custom((val) => {
    const d = new Date(val);
    if (d < new Date(Date.now() - 24 * 60 * 60 * 1000))
      throw new Error("Cannot book past appointments");
    return true;
  }),
  body("timeSlot")
    .matches(timeSlotRegex)
    .withMessage("timeSlot must be in format HH:MM AM/PM"),
  validateRequest,
];

const updateAppointmentValidation = [
  body("status")
    .optional()
    .isIn(["pending", "confirmed", "completed", "cancelled"]),
  body("notes").optional().isString().isLength({ max: 500 }),
  body("date").optional().isISO8601().toDate(),
  body("timeSlot").optional().matches(timeSlotRegex),
  validateRequest,
];

export { createAppointmentValidation, updateAppointmentValidation };
