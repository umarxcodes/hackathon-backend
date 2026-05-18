import DiagnosisLog from "../models/DiagnosisLog.js";
import Prescription from "../models/Prescription.js";
import callClaude from "../utils/aiHelper.js";
import ApiResponse from "../utils/ApiResponse.js";

const parseJsonResponse = (text) => {
  if (!text) return null;
  const cleaned = text.trim();
  const start = cleaned.indexOf("{");
  if (start === -1) return null;

  try {
    return JSON.parse(cleaned.slice(start));
  } catch {
    return null;
  }
};

export const symptomChecker = async (req, res, next) => {
  try {
    const { symptoms, age, gender, history, patientId } = req.body;
    const prompt = `You are an advanced medical assistant. Analyze the following patient data and return JSON with keys conditions (array of strings), riskLevel (low, medium, high, unknown), and suggestedTests (array of strings). Data: symptoms=${JSON.stringify(
      symptoms
    )}, age=${age}, gender=${gender}, history=${history || "N/A"}`;

    const text = await callClaude(prompt);
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
      history: history || "No history provided",
      aiResponse: { ...aiResponse, rawAiText: text || "" },
      riskLevel: ["low", "medium", "high"].includes(aiResponse.riskLevel)
        ? aiResponse.riskLevel
        : "unknown",
      isFallback: !parsed,
    });

    return ApiResponse.success(
      res,
      { aiResponse, diagnosisLog, fallback: !parsed },
      !parsed ? "AI fallback response returned" : "AI diagnosis generated"
    );
  } catch (error) {
    next(error);
  }
};

export const prescriptionExplanation = async (req, res, next) => {
  try {
    const { prescriptionId } = req.body;
    const prescription = await Prescription.findById(prescriptionId)
      .populate("patientId", "name")
      .populate("doctorId", "name");

    if (!prescription) {
      return ApiResponse.error(res, "Prescription not found", 404);
    }

    const prompt = `Explain the following prescription in simple language for a patient: medicines=${JSON.stringify(
      prescription.medicines
    )}, instructions=${prescription.instructions}`;
    const text = await callClaude(prompt);

    if (!text) {
      return ApiResponse.success(
        res,
        { message: "AI unavailable, no explanation generated" },
        "AI fallback used"
      );
    }

    prescription.aiExplanation = text;
    await prescription.save();

    return ApiResponse.success(
      res,
      { aiExplanation: text },
      "AI explanation generated"
    );
  } catch (error) {
    next(error);
  }
};

export const riskFlag = async (req, res, next) => {
  try {
    const { patientId } = req.body;
    const logs = await DiagnosisLog.find({ patientId })
      .sort({ createdAt: -1 })
      .limit(10);

    if (!logs.length) {
      return ApiResponse.success(
        res,
        {
          hasRisk: false,
          riskFactors: [],
          recommendation: "No diagnosis logs available",
        },
        "No risk data available"
      );
    }

    const prompt = `Review these diagnosis logs and identify chronic risk patterns, repeated infections, or concerning symptoms. Return JSON with hasRisk (boolean), riskFactors (array of strings), recommendation (string). Logs=${JSON.stringify(
      logs.map((item) => ({
        symptoms: item.symptoms,
        history: item.history,
        aiResponse: item.aiResponse,
      }))
    )}`;
    const text = await callClaude(prompt);
    const parsed = parseJsonResponse(text);
    const fallbackData = {
      hasRisk: false,
      riskFactors: [],
      recommendation: "AI unavailable, please review patient history manually.",
    };

    return ApiResponse.success(
      res,
      parsed || fallbackData,
      parsed ? "Risk analysis generated" : "AI fallback used"
    );
  } catch (error) {
    next(error);
  }
};
