import { GoogleGenAI } from "@google/genai";
import { ToolRegistry } from "../tools/registry.js";

const MODEL = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite-preview";

// run gemini with the tool registry. it can call tools, see results, call more,
// and eventually emit final text. we just give it the prompt and let it cook.
export async function runAgentLoop(registry: ToolRegistry, prompt: string, maxRounds = 6): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const tools = [{
    functionDeclarations: registry.list().map(t => ({
      name: t.name,
      description: t.description,
      parameters: t.parameters as any,
    })),
  }];

  const messages: any[] = [{ role: "user", parts: [{ text: prompt }] }];

  for (let round = 0; round < maxRounds; round++) {
    const resp = await ai.models.generateContent({
      model: MODEL,
      contents: messages,
      config: { tools },
    });

    // grab the raw parts from the model. we have to echo these back as-is
    // so gemini's thought_signature stays attached to each function call
    const modelParts = resp.candidates?.[0]?.content?.parts ?? [];
    const functionCallParts = modelParts.filter((p: any) => p.functionCall);

    // no tools to call, gemini is done — return its text
    if (functionCallParts.length === 0) {
      return resp.text ?? "";
    }

    // echo gemini's whole turn back into the conversation (signature included)
    messages.push({ role: "model", parts: modelParts });

    // run each tool, collect responses
    const responses = [];
    for (const part of functionCallParts) {
      const call = (part as any).functionCall;
      console.log(`[gemini] tool call: ${call.name}`, call.args);
      try {
        const result = await registry.run(call.name, call.args ?? {});
        responses.push({ functionResponse: { name: call.name, response: { result } } });
      } catch (err) {
        responses.push({ functionResponse: { name: call.name, response: { error: String(err) } } });
      }
    }

    // feed results back in
    messages.push({ role: "user", parts: responses });
  }

  return "agent hit max rounds without finishing";
}
