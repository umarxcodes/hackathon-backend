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
    symptoms: {
      type: [String],
      required: [true, "Symptoms are required"],
      validate: {
        validator: (v) => Array.isArray(v) && v.length >= 1,
        message: "At least one symptom required",
      },
    },
    age: {
      type: Number,
      required: [true, "Age is required"],
    },
    gender: {
      type: String,
      required: [true, "Gender is required"],
    },
    history: {
      type: String,
      default: "",
    },
    aiResponse: {
      conditions: { type: [String], default: [] },
      riskLevel: {
        type: String,
        enum: ["low", "medium", "high", "unknown"],
        default: "unknown",
      },
      suggestedTests: { type: [String], default: [] },
      rawAiText: { type: String, default: "" },
    },
    riskLevel: {
      type: String,
      enum: ["low", "medium", "high", "unknown"],
      default: "unknown",
    },
    isFallback: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const DiagnosisLog = mongoose.model("DiagnosisLog", diagnosisLogSchema);
export default DiagnosisLog;
