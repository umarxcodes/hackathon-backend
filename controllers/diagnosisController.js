import DiagnosisLog from "../models/DiagnosisLog.js";

export const getDiagnosisLogs = async (req, res, next) => {
  try {
    const { role, id } = req.user;
    const query = {};
    if (role === "doctor") {
      query.doctorId = id;
    }
    if (role === "patient") {
      const patientId = req.query.patientId;
      if (!patientId) {
        return res
          .status(400)
          .json({
            success: false,
            error: "patientId query is required for patient access",
          });
      }
      query.patientId = patientId;
    }

    const logs = await DiagnosisLog.find(query)
      .populate("doctorId", "name")
      .populate("patientId", "name");
    res
      .status(200)
      .json({
        success: true,
        data: logs,
        message: "Diagnosis logs retrieved",
        count: logs.length,
      });
  } catch (error) {
    next(error);
  }
};

export const getDiagnosisLogById = async (req, res, next) => {
  try {
    const log = await DiagnosisLog.findById(req.params.id)
      .populate("doctorId", "name")
      .populate("patientId", "name");
    if (!log) {
      return res
        .status(404)
        .json({ success: false, error: "Diagnosis log not found" });
    }
    res
      .status(200)
      .json({
        success: true,
        data: log,
        message: "Diagnosis log retrieved",
        count: 1,
      });
  } catch (error) {
    next(error);
  }
};

export const getDiagnosisByPatient = async (req, res, next) => {
  try {
    const logs = await DiagnosisLog.find({
      patientId: req.params.patientId,
    }).populate("doctorId", "name");
    res
      .status(200)
      .json({
        success: true,
        data: logs,
        message: "Patient diagnosis history retrieved",
        count: logs.length,
      });
  } catch (error) {
    next(error);
  }
};
