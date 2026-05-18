import Prescription from "../models/Prescription.js";
import Appointment from "../models/Appointment.js";
import generatePrescriptionPDF from "../utils/generatePDF.js";
import ApiResponse from "../utils/ApiResponse.js";

const getPatientOwnedPrescriptionQuery = async (userId) => {
  const appointments = await Appointment.find({ bookedBy: userId }).select(
    "_id patientId"
  );
  const appointmentIds = appointments.map((item) => item._id);
  const patientIds = appointments.map((item) => item.patientId).filter(Boolean);
  return {
    $or: [
      { appointmentId: { $in: appointmentIds } },
      { patientId: { $in: patientIds } },
    ],
  };
};

const canAccessPrescription = async (prescription, user) => {
  if (user.role === "admin") return true;
  if (user.role === "doctor") {
    return prescription.doctorId?.toString() === user.id;
  }
  if (user.role === "patient") {
    const query = await getPatientOwnedPrescriptionQuery(user.id);
    const owned = await Prescription.exists({
      _id: prescription._id,
      ...query,
    });
    return Boolean(owned);
  }
  return false;
};

export const getPrescriptions = async (req, res, next) => {
  try {
    const { role, id } = req.user;
    const query = {};

    if (role === "doctor") query.doctorId = id;
    if (role === "patient") {
      Object.assign(query, await getPatientOwnedPrescriptionQuery(id));
    }

    const prescriptions = await Prescription.find(query)
      .populate("patientId", "name")
      .populate("doctorId", "name")
      .populate("appointmentId");

    return ApiResponse.success(res, prescriptions, "Prescriptions retrieved");
  } catch (error) {
    next(error);
  }
};

export const createPrescription = async (req, res, next) => {
  try {
    const { patientId, appointmentId, medicines, instructions } = req.body;
    const prescription = await Prescription.create({
      patientId,
      doctorId: req.user.id,
      appointmentId,
      medicines,
      instructions,
    });

    return ApiResponse.success(res, prescription, "Prescription created", 201);
  } catch (error) {
    next(error);
  }
};

export const getPrescription = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate("patientId", "name contact")
      .populate("doctorId", "name")
      .populate("appointmentId");

    if (!prescription) {
      return ApiResponse.error(res, "Prescription not found", 404);
    }
    if (!(await canAccessPrescription(prescription, req.user))) {
      return ApiResponse.error(
        res,
        "Not authorized to access prescription",
        403
      );
    }
    return ApiResponse.success(res, prescription, "Prescription retrieved");
  } catch (error) {
    next(error);
  }
};

export const updatePrescription = async (req, res, next) => {
  try {
    const allowedFields = [
      "medicines",
      "instructions",
      "aiExplanation",
      "pdfUrl",
    ];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const prescription = await Prescription.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!prescription) {
      return ApiResponse.error(res, "Prescription not found", 404);
    }
    return ApiResponse.success(res, prescription, "Prescription updated");
  } catch (error) {
    next(error);
  }
};

export const downloadPrescriptionPDF = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate("patientId")
      .populate("doctorId");

    if (!prescription) {
      return ApiResponse.error(res, "Prescription not found", 404);
    }
    if (!(await canAccessPrescription(prescription, req.user))) {
      return ApiResponse.error(
        res,
        "Not authorized to download prescription",
        403
      );
    }

    const patient = prescription.patientId;
    const doctor = prescription.doctorId;
    const buffer = await generatePrescriptionPDF(prescription, patient, doctor);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=prescription-${prescription._id}.pdf`
    );
    return res.send(buffer);
  } catch (error) {
    next(error);
  }
};
