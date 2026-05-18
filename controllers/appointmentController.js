import Appointment from "../models/Appointment.js";
import Patient from "../models/Patient.js";
import ApiResponse from "../utils/ApiResponse.js";

export const getAppointments = async (req, res, next) => {
  try {
    const { role, id } = req.user;
    const query = {};

    if (role === "doctor") query.doctorId = id;
    if (role === "patient") query.bookedBy = id;

    const appointments = await Appointment.find(query)
      .populate("patientId", "name contact")
      .populate("doctorId", "name")
      .populate("bookedBy", "name");

    return ApiResponse.success(res, appointments, "Appointments retrieved");
  } catch (error) {
    next(error);
  }
};

export const createAppointment = async (req, res, next) => {
  try {
    const { patientId, doctorId, date, timeSlot, notes } = req.body;
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return ApiResponse.error(res, "Patient not found", 404);
    }

    const requestedDate = new Date(date);
    const conflict = await Appointment.findOne({
      doctorId,
      date: requestedDate,
      timeSlot,
      status: { $ne: "cancelled" },
    });

    if (conflict) {
      return ApiResponse.error(
        res,
        "Doctor already has an appointment at this time",
        400
      );
    }

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      date: requestedDate,
      timeSlot,
      notes,
      bookedBy: req.user.id,
    });

    return ApiResponse.success(res, appointment, "Appointment booked", 201);
  } catch (error) {
    next(error);
  }
};

export const getAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("patientId", "name contact")
      .populate("doctorId", "name")
      .populate("bookedBy", "name");

    if (!appointment) {
      return ApiResponse.error(res, "Appointment not found", 404);
    }
    return ApiResponse.success(res, appointment, "Appointment retrieved");
  } catch (error) {
    next(error);
  }
};

export const updateAppointment = async (req, res, next) => {
  try {
    const allowedFields = ["status", "notes", "timeSlot", "date"];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (updates.date) updates.date = new Date(updates.date);

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!appointment) {
      return ApiResponse.error(res, "Appointment not found", 404);
    }
    return ApiResponse.success(res, appointment, "Appointment updated");
  } catch (error) {
    next(error);
  }
};

export const cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: "cancelled" },
      { new: true }
    );

    if (!appointment) {
      return ApiResponse.error(res, "Appointment not found", 404);
    }
    return ApiResponse.success(res, appointment, "Appointment cancelled");
  } catch (error) {
    next(error);
  }
};

export const getDoctorSchedule = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const query = { doctorId: req.params.doctorId };

    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }

    const schedule = await Appointment.find(query)
      .populate("patientId", "name contact")
      .populate("doctorId", "name");

    return ApiResponse.success(res, schedule, "Doctor schedule retrieved");
  } catch (error) {
    next(error);
  }
};
