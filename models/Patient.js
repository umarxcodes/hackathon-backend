import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Patient name is required"],
      index: true,
    },
    age: {
      type: Number,
      required: [true, "Age is required"],
      min: 0,
      max: 150,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: [true, "Gender is required"],
    },
    contact: {
      type: String,
      required: [true, "Contact is required"],
      match: [/^[\d\s+()-]{7,15}$/, "Invalid contact"],
    },
    address: { type: String, required: [true, "Address is required"] },
    bloodGroup: { type: String },
    allergies: [{ type: String }],
    medicalHistory: { type: String },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Patient = mongoose.model("Patient", patientSchema);
export default Patient;
