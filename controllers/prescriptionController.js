import Prescription from "../models/Prescription.js";
import generatePrescriptionPDF from "../utils/generatePDF.js";
import ApiResponse from "../utils/ApiResponse.js";

export const getPrescriptions = async (req, res, next) => {
  try {
    const { role, id } = req.user;
    const query = {};

    if (role === "doctor") query.doctorId = id;
    if (role === "patient") {
      const patientId = req.query.patientId;
      if (!patientId) {
        return ApiResponse.error(
          res,
          "patientId query is required for patient access",
          400
        );
      }
      query.patientId = patientId;
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
    const { patientId, doctorId, appointmentId, medicines, instructions } =
      req.body;
    const prescription = await Prescription.create({
      patientId,
      doctorId,
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
