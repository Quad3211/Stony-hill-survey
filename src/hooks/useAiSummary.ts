import { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface SummaryResult {
  summary: string;
  keyThemes: string[];
  criticalAlerts: string[];
  sentiment: "Positive" | "Neutral" | "Negative" | "Mixed";
}

export const useAiSummary = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SummaryResult | null>(null);

  const generateSummary = async (feedbacks: string[]) => {
    if (feedbacks.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Missing Gemini API Key");
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      // Reverting to gemini-1.5-flash as it is the current standard.
      // If this fails with 404, it usually means the API is not enabled in Google Cloud Console.
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
        Analyze the following student feedback comments and provide a structured summary.
        Return ONLY a JSON object with the following fields:
        - "summary": A concise paragraph summarizing the overall sentiment and main points.
        - "keyThemes": An array of strings (max 5) listing the most recurring topics.
        - "criticalAlerts": An array of strings listing any urgent safety or well-being issues.
        - "sentiment": One of "Positive", "Neutral", "Negative", "Mixed".

        Feedback Comments:
        ${feedbacks.slice(0, 50).join("\n- ")}
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();

      // Clean up markdown code blocks if present
      text = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const parsedData = JSON.parse(text);
      setResult(parsedData);
    } catch (err: any) {
      // Improve error message for common 404 case
      let errorMessage = err.message || "Failed to generate summary";
      if (err.message.includes("404") && err.message.includes("not found")) {
        errorMessage =
          "Gemini API not enabled. Enable 'Generative Language API' in Google Cloud Console.";
      }
      setError(errorMessage);
      console.error("AI Summary Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return { generateSummary, result, loading, error };
};
