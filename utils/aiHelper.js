import axios from "axios";

const callGemini = async (prompt) => {
  try {
    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";
    const response = await axios.post(
      url,
      {
        prompt: { text: prompt },
        temperature: 0.2,
        maxOutputTokens: 512,
      },
      {
        params: {
          key: process.env.GEMINI_API_KEY,
        },
      }
    );

    const candidate = response?.data?.candidates?.[0];
    if (!candidate) return null;

    const content = candidate?.content;
    if (Array.isArray(content)) {
      return content.map((item) => item?.text || "").join("");
    }

    return candidate?.output || response?.data?.output_text || null;
  } catch (error) {
    console.error(
      "Gemini call failed:",
      error?.response?.data || error.message
    );
    return null;
  }
};

export default callGemini;
