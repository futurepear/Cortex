import { GoogleGenAI } from "@google/genai";

/**
 * Generic Gemini caller.
 * messages: array of { role, content }
 * functions: optional function schemas to include (for function-calling)
 * returns a normalized response similar to { choices: [{ message: { content } }] }
 */
export async function callGemini(messages: any[], functions?: any[], model?: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const prompt = (messages || [])
    .map((m: any) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n\n");

  const functionsNote = functions ? "\n\nTOOLS:\n" + JSON.stringify(functions) : "";

  const full = prompt + functionsNote;

  const resp: any = await ai.models.generateContent({
    model: model || process.env.GEMINI_MODEL || "gemini-3.1-flash-lite-preview",
    contents: [
      {
        role: "user",
        parts: [{ text: full }],
      },
    ],
  });

  const text = (resp as any).text ?? (resp as any).candidates?.[0]?.content ?? JSON.stringify(resp);
  return { choices: [{ message: { content: text } }] };
}

export async function analyzeDriftWithLLM(observationsPrompt: string, promises: any[]) {
  // Keep the legacy mock for quick tests
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