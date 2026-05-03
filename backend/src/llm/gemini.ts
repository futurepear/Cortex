import { GoogleGenAI } from "@google/genai";
import { ToolRegistry } from "../tools/registry.js";

const MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

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

    const calls = resp.functionCalls ?? [];

    // no more tools to call, gemini is done — return its text
    if (calls.length === 0) {
      return resp.text ?? "";
    }

    // record what gemini asked for
    messages.push({
      role: "model",
      parts: calls.map((c: any) => ({ functionCall: c })),
    });

    // run each tool, collect responses
    const responses = [];
    for (const call of calls) {
      console.log(`[gemini] tool call: ${call.name}`, call.args);
      try {
        const result = await registry.run(call.name!, call.args ?? {});
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
