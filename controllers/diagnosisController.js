import DiagnosisLog from "../models/DiagnosisLog.js";
import ApiResponse from "../utils/ApiResponse.js";

export const getDiagnosisLogs = async (req, res, next) => {
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

    const logs = await DiagnosisLog.find(query)
      .populate("doctorId", "name")
      .populate("patientId", "name");

    return ApiResponse.success(res, logs, "Diagnosis logs retrieved");
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
      return ApiResponse.error(res, "Diagnosis log not found", 404);
    }
    return ApiResponse.success(res, log, "Diagnosis log retrieved");
  } catch (error) {
    next(error);
  }
};

export const getDiagnosisByPatient = async (req, res, next) => {
  try {
    const logs = await DiagnosisLog.find({
      patientId: req.params.patientId,
    }).populate("doctorId", "name");
    return ApiResponse.success(
      res,
      logs,
      "Patient diagnosis history retrieved"
    );
  } catch (error) {
    next(error);
  }
};
