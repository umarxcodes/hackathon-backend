import PDFDocument from "pdfkit";

const generatePrescriptionPDF = (prescription, patient, doctor) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const buffers = [];

    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    doc.fontSize(20).text("AI Clinic Management", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Doctor: ${doctor.name}`);
    doc.text(`Patient: ${patient.name}`);
    doc.text(`Date: ${new Date(prescription.createdAt).toLocaleDateString()}`);
    doc.moveDown();

    doc.fontSize(14).text("Prescription", { underline: true });
    doc.moveDown(0.5);

    const tableTop = doc.y;
    doc.fontSize(12).text("Medicine", 50, tableTop);
    doc.text("Dosage", 220, tableTop);
    doc.text("Frequency", 330, tableTop);
    doc.text("Duration", 450, tableTop);
    doc.moveDown(0.5);

    prescription.medicines.forEach((med, index) => {
      const y = tableTop + 25 + index * 20;
      doc.text(med.name, 50, y);
      doc.text(med.dosage, 220, y);
      doc.text(med.frequency, 330, y);
      doc.text(med.duration, 450, y);
    });

    doc.moveDown(2);
    doc.fontSize(12).text("Instructions:", { underline: true });
    doc.moveDown(0.5);
    doc.text(prescription.instructions || "N/A");

    if (prescription.aiExplanation) {
      doc.moveDown(1);
      doc.fontSize(12).text("AI Explanation:", { underline: true });
      doc.moveDown(0.5);
      doc.text(prescription.aiExplanation);
    }

    doc.moveDown(2);
    doc.fontSize(10).text("Thank you for choosing AI Clinic Management.", {
      align: "center",
    });
    doc.end();
  });
};

export default generatePrescriptionPDF;
