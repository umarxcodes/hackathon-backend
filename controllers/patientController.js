import Appointment from "../models/Appointment.js";
import Prescription from "../models/Prescription.js";
import DiagnosisLog from "../models/DiagnosisLog.js";
import Patient from "../models/Patient.js";
import ApiResponse from "../utils/ApiResponse.js";

export const getPatients = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const query = {};

    if (req.query.search) {
      query.name = { $regex: req.query.search, $options: "i" };
    }

    const [patients, total] = await Promise.all([
      Patient.find(query)
        .skip(skip)
        .limit(limit)
        .populate("createdBy", "name email")
        .lean(),
      Patient.countDocuments(query),
    ]);

    return ApiResponse.successList(res, patients, total, page, limit);
  } catch (error) {
    next(error);
  }
};

export const createPatient = async (req, res, next) => {
  try {
    const {
      name,
      age,
      gender,
      contact,
      address,
      bloodGroup,
      allergies,
      medicalHistory,
    } = req.body;
    const patient = await Patient.create({
      name,
      age,
      gender,
      contact,
      address,
      bloodGroup,
      allergies,
      medicalHistory,
      createdBy: req.user.id,
    });

    return ApiResponse.success(res, patient, "Patient created", 201);
  } catch (error) {
    next(error);
  }
};

export const getPatient = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );
    if (!patient) {
      return ApiResponse.error(res, "Patient not found", 404);
    }

    const [appointments, prescriptions, diagnosisLogs] = await Promise.all([
      Appointment.find({ patientId: patient._id })
        .populate("doctorId", "name")
        .populate("bookedBy", "name"),
      Prescription.find({ patientId: patient._id })
        .populate("doctorId", "name")
        .populate("appointmentId"),
      DiagnosisLog.find({ patientId: patient._id }).populate(
        "doctorId",
        "name"
      ),
    ]);

    return ApiResponse.success(
      res,
      {
        patient,
        appointments,
        prescriptions,
        diagnosisLogs,
      },
      "Patient details retrieved"
    );
  } catch (error) {
    next(error);
  }
};

export const updatePatient = async (req, res, next) => {
  try {
    const allowedFields = [
      "name",
      "age",
      "gender",
      "contact",
      "address",
      "bloodGroup",
      "allergies",
      "medicalHistory",
    ];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const patient = await Patient.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!patient) {
      return ApiResponse.error(res, "Patient not found", 404);
    }
    return ApiResponse.success(res, patient, "Patient updated");
  } catch (error) {
    next(error);
  }
};

export const deletePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) {
      return ApiResponse.error(res, "Patient not found", 404);
    }
    return ApiResponse.success(res, {}, "Patient deleted");
  } catch (error) {
    next(error);
  }
};

export const getPatientTimeline = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return ApiResponse.error(res, "Patient not found", 404);
    }

    const [appointments, prescriptions, diagnosisLogs] = await Promise.all([
      Appointment.find({ patientId: patient._id }).lean(),
      Prescription.find({ patientId: patient._id }).lean(),
      DiagnosisLog.find({ patientId: patient._id }).lean(),
    ]);

    const timeline = [
      ...appointments.map((item) => ({
        type: "appointment",
        date: item.date || item.createdAt,
        data: item,
      })),
      ...prescriptions.map((item) => ({
        type: "prescription",
        date: item.createdAt,
        data: item,
      })),
      ...diagnosisLogs.map((item) => ({
        type: "diagnosis",
        date: item.createdAt,
        data: item,
      })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    return ApiResponse.success(res, timeline, "Timeline retrieved");
  } catch (error) {
    next(error);
  }
};
