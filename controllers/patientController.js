import Appointment from "../models/Appointment.js";
import Prescription from "../models/Prescription.js";
import DiagnosisLog from "../models/DiagnosisLog.js";
import Patient from "../models/Patient.js";

export const getPatients = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search
      ? { name: { $regex: req.query.search, $options: "i" } }
      : {};
    const patients = await Patient.find(search)
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "name email");
    const total = await Patient.countDocuments(search);
    res
      .status(200)
      .json({
        success: true,
        data: patients,
        message: "Patients retrieved",
        count: patients.length,
        total,
      });
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
    if (!name || !age || !gender || !contact || !address) {
      return res
        .status(400)
        .json({
          success: false,
          error: "Name, age, gender, contact and address are required",
        });
    }
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

    res
      .status(201)
      .json({
        success: true,
        data: patient,
        message: "Patient created",
        count: 1,
      });
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
      return res
        .status(404)
        .json({ success: false, error: "Patient not found" });
    }

    const appointments = await Appointment.find({ patientId: patient._id })
      .populate("doctorId", "name")
      .populate("bookedBy", "name");
    const prescriptions = await Prescription.find({ patientId: patient._id })
      .populate("doctorId", "name")
      .populate("appointmentId");
    const diagnosisLogs = await DiagnosisLog.find({
      patientId: patient._id,
    }).populate("doctorId", "name");

    res.status(200).json({
      success: true,
      data: { patient, appointments, prescriptions, diagnosisLogs },
      message: "Patient details retrieved",
      count: 1,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePatient = async (req, res, next) => {
  try {
    const updates = {};
    const fields = [
      "name",
      "age",
      "gender",
      "contact",
      "address",
      "bloodGroup",
      "allergies",
      "medicalHistory",
    ];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const patient = await Patient.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!patient) {
      return res
        .status(404)
        .json({ success: false, error: "Patient not found" });
    }

    res
      .status(200)
      .json({
        success: true,
        data: patient,
        message: "Patient updated",
        count: 1,
      });
  } catch (error) {
    next(error);
  }
};

export const deletePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) {
      return res
        .status(404)
        .json({ success: false, error: "Patient not found" });
    }
    res
      .status(200)
      .json({ success: true, data: {}, message: "Patient deleted", count: 0 });
  } catch (error) {
    next(error);
  }
};

export const getPatientTimeline = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res
        .status(404)
        .json({ success: false, error: "Patient not found" });
    }

    const appointments = await Appointment.find({
      patientId: patient._id,
    }).lean();
    const prescriptions = await Prescription.find({
      patientId: patient._id,
    }).lean();
    const diagnosisLogs = await DiagnosisLog.find({
      patientId: patient._id,
    }).lean();

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

    res
      .status(200)
      .json({
        success: true,
        data: timeline,
        message: "Timeline retrieved",
        count: timeline.length,
      });
  } catch (error) {
    next(error);
  }
};
