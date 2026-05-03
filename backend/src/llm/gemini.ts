import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// export async function analyzeDriftWithLLM(observation: any, promises: any[]) {

//   const prompt = `
// You are a system that detects drift between PROMISES and OBSERVATIONS.

// PROMISES:
// ${JSON.stringify(promises, null, 2)}

// OBSERVATION:
// ${JSON.stringify(observation, null, 2)}

// Return JSON ONLY:
// {
//   "drift": boolean,
//   "severity": "low" | "medium" | "critical",
//   "rootCause": string,
//   "action": "rollback" | "notify" | "none",
//   "reasoning": string
// }
// `;

//   try {
//     // 10-second timeout to prevent hanging
//     const timeoutPromise = new Promise((_, reject) =>
//       setTimeout(() => reject(new Error("LLM call timed out after 10s")), 10000)
//     );

//     const response = await Promise.race([
//       ai.models.generateContent({
//         model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
//         contents: [
//           {
//             role: "user",
//             parts: [{ text: prompt }],
//           },
//         ],
//       }),
//       timeoutPromise,
//     ]);
    
    

//     const text = (response as any).text;

//     const result = JSON.parse(text || "{}");
//     console.log("LLM drift analysis complete");
//     return result;
//   } catch (err) {
//     console.error("LLM call failed:", (err as any).message);
//     return { drift: false, action: "none", reasoning: `Error: ${(err as any).message}` };
//   }
// }

export async function analyzeDriftWithLLM(observations: any[], promises: any[]) {
  // HARD-CODED MOCK RESPONSE (for testing purposes without actual LLM calls)

  const mockResponse = {
    drift: true,
    severity: "critical",
    rootCause: "API latency spike caused missing expected observation fields",
    action: "rollback",
    reasoning:
      "The observation deviates significantly from the expected promise schema. Required fields 'status' and 'latency' are missing, indicating a likely upstream failure."
  };

  console.log("Using hardcoded LLM response (mock mode)");
  return mockResponse;
}