import mongoose from "mongoose";

const diagnosisLogSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    symptoms: { type: [String], required: [true, "Symptoms are required"] },
    age: { type: Number, required: [true, "Age is required"] },
    gender: { type: String, required: [true, "Gender is required"] },
    history: { type: String, required: [true, "History is required"] },
    aiResponse: {
      conditions: { type: [String], default: [] },
      riskLevel: { type: String, default: "unknown" },
      suggestedTests: { type: [String], default: [] },
    },
    riskLevel: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low",
    },
  },
  { timestamps: true }
);

const DiagnosisLog = mongoose.model("DiagnosisLog", diagnosisLogSchema);
export default DiagnosisLog;
