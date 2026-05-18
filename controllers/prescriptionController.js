import Prescription from "../models/Prescription.js";

import generatePrescriptionPDF from "../utils/generatePDF.js";

export const getPrescriptions = async (req, res, next) => {
  try {
    const { role, id } = req.user;
    const query = {};

    if (role === "doctor") {
      query.doctorId = id;
    }
    if (role === "patient") {
      const patientId = req.query.patientId;
      if (!patientId) {
        return res.status(400).json({
          success: false,
          error: "patientId query is required for patient access",
        });
      }
      query.patientId = patientId;
    }

    const prescriptions = await Prescription.find(query)
      .populate("patientId", "name")
      .populate("doctorId", "name")
      .populate("appointmentId");
    res.status(200).json({
      success: true,
      data: prescriptions,
      message: "Prescriptions retrieved",
      count: prescriptions.length,
    });
  } catch (error) {
    next(error);
  }
};

export const createPrescription = async (req, res, next) => {
  try {
    const { patientId, doctorId, appointmentId, medicines, instructions } =
      req.body;
    if (!patientId || !doctorId || !medicines || !instructions) {
      return res.status(400).json({
        success: false,
        error: "patientId, doctorId, medicines and instructions are required",
      });
    }

    const prescription = await Prescription.create({
      patientId,
      doctorId,
      appointmentId,
      medicines,
      instructions,
    });
    res.status(201).json({
      success: true,
      data: prescription,
      message: "Prescription created",
      count: 1,
    });
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
      return res
        .status(404)
        .json({ success: false, error: "Prescription not found" });
    }
    res.status(200).json({
      success: true,
      data: prescription,
      message: "Prescription retrieved",
      count: 1,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePrescription = async (req, res, next) => {
  try {
    const updates = {};
    const fields = ["medicines", "instructions", "aiExplanation", "pdfUrl"];
    fields.forEach((field) => {
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
      return res
        .status(404)
        .json({ success: false, error: "Prescription not found" });
    }
    res.status(200).json({
      success: true,
      data: prescription,
      message: "Prescription updated",
      count: 1,
    });
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
      return res
        .status(404)
        .json({ success: false, error: "Prescription not found" });
    }

    const patient = prescription.patientId;
    const doctor = prescription.doctorId;
    const buffer = await generatePrescriptionPDF(prescription, patient, doctor);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=prescription-${prescription._id}.pdf`
    );
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};
