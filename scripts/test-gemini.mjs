import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyBFPAi9lGtsVCQqam9g6UWmizuxP1ae0pI";

async function testGemini() {
  console.log("Testing Gemini API...");
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    console.log("Generating content...");
    const result = await model.generateContent("Hello, are you working?");
    const response = await result.response;
    console.log("Response:", response.text());
    console.log("SUCCESS: API is working.");
  } catch (error) {
    console.error("ERROR:", error.message);
    if (error.message.includes("404")) {
      console.log("\nPossible Causes:");
      console.log(
        "1. 'Generative Language API' is NOT enabled in Google Cloud Console.",
      );
      console.log(
        "2. The API key is invalid or belongs to a different project.",
      );
      console.log(
        "3. Billing is not enabled (required for some free tier usage depending on region).",
      );
    }
  }
}

testGemini();
