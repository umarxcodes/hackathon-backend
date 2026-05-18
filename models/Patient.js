import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Patient name is required"] },
    age: { type: Number, required: [true, "Age is required"] },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: [true, "Gender is required"],
    },
    contact: { type: String, required: [true, "Contact is required"] },
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
