import Appointment from "../models/Appointment.js";
import Patient from "../models/Patient.js";

export const getAppointments = async (req, res, next) => {
  try {
    const { role, id } = req.user;
    const query = {};

    if (role === "doctor") {
      query.doctorId = id;
    }
    if (role === "patient") {
      query.bookedBy = id;
    }

    const appointments = await Appointment.find(query)
      .populate("patientId", "name contact")
      .populate("doctorId", "name")
      .populate("bookedBy", "name");

    res
      .status(200)
      .json({
        success: true,
        data: appointments,
        message: "Appointments retrieved",
        count: appointments.length,
      });
  } catch (error) {
    next(error);
  }
};

export const createAppointment = async (req, res, next) => {
  try {
    const { patientId, doctorId, date, timeSlot, notes } = req.body;
    if (!patientId || !doctorId || !date || !timeSlot) {
      return res
        .status(400)
        .json({
          success: false,
          error: "patientId, doctorId, date and timeSlot are required",
        });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res
        .status(404)
        .json({ success: false, error: "Patient not found" });
    }

    const requestedDate = new Date(date);
    const conflict = await Appointment.findOne({
      doctorId,
      date: requestedDate,
      timeSlot,
      status: { $ne: "cancelled" },
    });

    if (conflict) {
      return res
        .status(400)
        .json({
          success: false,
          error: "Doctor already has an appointment at this time",
        });
    }

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      date: requestedDate,
      timeSlot,
      notes,
      bookedBy: req.user.id,
    });

    res
      .status(201)
      .json({
        success: true,
        data: appointment,
        message: "Appointment booked",
        count: 1,
      });
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
      return res
        .status(404)
        .json({ success: false, error: "Appointment not found" });
    }
    res
      .status(200)
      .json({
        success: true,
        data: appointment,
        message: "Appointment retrieved",
        count: 1,
      });
  } catch (error) {
    next(error);
  }
};

export const updateAppointment = async (req, res, next) => {
  try {
    const updates = {};
    const fields = ["status", "notes", "timeSlot", "date"];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (updates.date) {
      updates.date = new Date(updates.date);
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, error: "Appointment not found" });
    }
    res
      .status(200)
      .json({
        success: true,
        data: appointment,
        message: "Appointment updated",
        count: 1,
      });
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
      return res
        .status(404)
        .json({ success: false, error: "Appointment not found" });
    }
    res
      .status(200)
      .json({
        success: true,
        data: appointment,
        message: "Appointment cancelled",
        count: 1,
      });
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

    res
      .status(200)
      .json({
        success: true,
        data: schedule,
        message: "Doctor schedule retrieved",
        count: schedule.length,
      });
  } catch (error) {
    next(error);
  }
};
