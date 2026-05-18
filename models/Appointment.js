import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
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
    date: {
      type: Date,
      required: [true, "Date is required"],
      validate: {
        validator: (v) => v >= new Date(Date.now() - 24 * 60 * 60 * 1000),
        message: "Cannot book past appointments",
      },
    },
    timeSlot: { type: String, required: [true, "Time slot is required"] },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    notes: { type: String },
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

appointmentSchema.index({ doctorId: 1, date: 1, timeSlot: 1 });

const Appointment = mongoose.model("Appointment", appointmentSchema);
export default Appointment;
