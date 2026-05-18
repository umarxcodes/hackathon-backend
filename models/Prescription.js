import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Medicine name is required"] },
    dosage: { type: String, required: [true, "Dosage is required"] },
    frequency: { type: String, required: [true, "Frequency is required"] },
    duration: { type: String, required: [true, "Duration is required"] },
  },
  { _id: false }
);

const prescriptionSchema = new mongoose.Schema(
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
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
    medicines: { type: [medicineSchema], required: true },
    instructions: {
      type: String,
      required: [true, "Instructions are required"],
    },
    aiExplanation: { type: String },
    pdfUrl: { type: String },
  },
  { timestamps: true }
);

const Prescription = mongoose.model("Prescription", prescriptionSchema);
export default Prescription;
