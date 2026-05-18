import DiagnosisLog from "../models/DiagnosisLog.js";
import Prescription from "../models/Prescription.js";
import callGemini from "../utils/aiHelper.js";

const parseJsonResponse = (text) => {
  try {
    const cleaned = text.trim();
    const jsonStart = cleaned.indexOf("{");
    if (jsonStart !== -1) {
      const jsonString = cleaned.slice(jsonStart);
      return JSON.parse(jsonString);
    }
    return null;
  } catch {
    return null;
  }
};

export const symptomChecker = async (req, res, next) => {
  try {
    const { symptoms, age, gender, history, patientId } = req.body;
    if (
      !symptoms ||
      !Array.isArray(symptoms) ||
      !age ||
      !gender ||
      !patientId
    ) {
      return res.status(400).json({
        success: false,
        error: "symptoms, age, gender and patientId are required",
      });
    }

    const prompt = `You are an advanced medical assistant. Analyze the following data and return a JSON object with keys conditions (array of strings), riskLevel (low, medium, high), and suggestedTests (array of strings). Data: symptoms=${JSON.stringify(
      symptoms
    )}, age=${age}, gender=${gender}, history=${history || "N/A"}`;

    console.log("AI symptom checker prompt:", prompt);
    const text = await callGemini(prompt);
    const parsed = parseJsonResponse(text);

    const aiResponse = parsed || {
      conditions: [],
      riskLevel: "unknown",
      suggestedTests: [],
    };

    const diagnosisLog = await DiagnosisLog.create({
      patientId,
      doctorId: req.user.id,
      symptoms,
      age,
      gender,
      history: history || "",
      aiResponse,
      riskLevel: ["low", "medium", "high"].includes(aiResponse.riskLevel)
        ? aiResponse.riskLevel
        : "low",
    });

    const fallback = !parsed;
    res.status(200).json({
      success: true,
      data: { aiResponse, diagnosisLog, fallback },
      message: fallback
        ? "AI fallback response returned"
        : "AI diagnosis generated",
      count: 1,
    });
  } catch (error) {
    next(error);
  }
};

export const prescriptionExplanation = async (req, res, next) => {
  try {
    const { prescriptionId } = req.body;
    if (!prescriptionId) {
      return res
        .status(400)
        .json({ success: false, error: "prescriptionId is required" });
    }

    const prescription = await Prescription.findById(prescriptionId)
      .populate("patientId", "name")
      .populate("doctorId", "name");
    if (!prescription) {
      return res
        .status(404)
        .json({ success: false, error: "Prescription not found" });
    }

    const prompt = `Explain the following prescription in simple language for a patient: medicines=${JSON.stringify(
      prescription.medicines
    )}, instructions=${prescription.instructions}`;
    console.log("AI prescription explanation prompt:", prompt);
    const text = await callGemini(prompt);

    if (!text) {
      return res.status(200).json({
        success: true,
        data: { message: "AI unavailable, no explanation generated" },
        message: "AI fallback used",
        count: 0,
      });
    }

    prescription.aiExplanation = text;
    await prescription.save();

    res.status(200).json({
      success: true,
      data: { aiExplanation: text },
      message: "AI explanation generated",
      count: 1,
    });
  } catch (error) {
    next(error);
  }
};

export const riskFlag = async (req, res, next) => {
  try {
    const { patientId } = req.body;
    if (!patientId) {
      return res
        .status(400)
        .json({ success: false, error: "patientId is required" });
    }

    const logs = await DiagnosisLog.find({ patientId })
      .sort({ createdAt: -1 })
      .limit(10);
    if (!logs.length) {
      return res.status(200).json({
        success: true,
        data: {
          hasRisk: false,
          riskFactors: [],
          recommendation: "No diagnosis logs available",
        },
        message: "No risk data available",
        count: 0,
      });
    }

    const prompt = `Review these diagnosis logs and identify chronic risk patterns, repeated infections, or concerning symptoms. Return JSON with hasRisk (boolean), riskFactors (array of strings), recommendation (string). Logs=${JSON.stringify(
      logs.map((item) => ({
        symptoms: item.symptoms,
        history: item.history,
        aiResponse: item.aiResponse,
      }))
    )}`;
    console.log("AI risk flag prompt:", prompt);
    const text = await callGemini(prompt);
    const parsed = parseJsonResponse(text);

    const fallbackData = {
      hasRisk: false,
      riskFactors: [],
      recommendation: "AI unavailable, please review patient history manually.",
    };

    res.status(200).json({
      success: true,
      data: parsed || fallbackData,
      message: parsed ? "Risk analysis generated" : "AI fallback used",
      count: 1,
    });
  } catch (error) {
    next(error);
  }
};
