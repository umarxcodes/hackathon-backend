import axios from "axios";

const callClaude = async (prompt) => {
  try {
    const response = await axios.post(
      "https://api.anthropic.com/v1/messages",
      {
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        timeout: 30000,
      }
    );

    const content =
      response.data?.content ||
      response.data?.completion?.content ||
      response.data?.completion?.content?.[0]?.text;

    if (!content) {
      console.error("❌ Unexpected Claude response structure", response.data);
      return null;
    }

    if (typeof content === "string") return content;
    if (Array.isArray(content)) {
      const textBlock = content.find(
        (block) => block.type === "output_text" || block.type === "text"
      );
      return textBlock?.text || textBlock?.content || null;
    }

    return content.text || null;
  } catch (error) {
    if (error.response) {
      console.error(
        "❌ Claude API Error:",
        error.response.status,
        JSON.stringify(error.response.data)
      );
    } else if (error.code === "ECONNABORTED") {
      console.error("❌ Claude API Timeout: request took too long");
    } else {
      console.error("❌ Claude API Network Error:", error.message);
    }
    return null;
  }
};

const safeParseJSON = (text) => {
  try {
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
};

export default callClaude;
export { safeParseJSON };
