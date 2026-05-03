import { GoogleGenAI } from "@google/genai";
import { ToolRegistry } from "../tools/registry.js";
import { bus } from "../events.js";

const MODEL = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite-preview";

export type AgentResult = {
  text: string;
  // every actual tool invocation we observed during the loop. trust this over
  // whatever gemini wrote in its "Actions Taken" section
  actualCalls: { name: string; args: any }[];
};

// run gemini with tools, streaming text to stdout as it arrives so we can
// watch the thinking live. returns the final text + the real tool calls observed
export async function runAgentLoop(registry: ToolRegistry, prompt: string, maxRounds = 6): Promise<AgentResult> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const tools = [{
    functionDeclarations: registry.list().map(t => ({
      name: t.name,
      description: t.description,
      parameters: t.parameters as any,
    })),
  }];

  const messages: any[] = [{ role: "user", parts: [{ text: prompt }] }];
  const actualCalls: { name: string; args: any }[] = [];

  for (let round = 0; round < maxRounds; round++) {
    process.stdout.write(`\n[gemini round ${round + 1}] `);

    const stream = await ai.models.generateContentStream({
      model: MODEL,
      contents: messages,
      config: { tools },
    });

    const modelParts: any[] = [];
    for await (const chunk of stream) {
      const parts = chunk.candidates?.[0]?.content?.parts ?? [];
      for (const part of parts) {
        modelParts.push(part);
        if ((part as any).text) process.stdout.write((part as any).text);
        if ((part as any).functionCall) {
          const fc = (part as any).functionCall;
          process.stdout.write(`\n[tool call] ${fc.name} ${JSON.stringify(fc.args ?? {})}\n`);
        }
      }
    }
    process.stdout.write("\n");

    const functionCallParts = modelParts.filter((p: any) => p.functionCall);

    // no tools to call → gemini is done, return its text + the real call log
    if (functionCallParts.length === 0) {
      const text = modelParts.filter((p: any) => p.text).map((p: any) => p.text).join("");
      return { text, actualCalls };
    }

    // echo gemini's full turn back so thought_signature stays attached
    messages.push({ role: "model", parts: modelParts });

    // run each tool, record what really happened
    const responses = [];
    for (const part of functionCallParts) {
      const call = (part as any).functionCall;
      actualCalls.push({ name: call.name, args: call.args ?? {} });
      bus.publish({ type: "tool:call", t: Date.now(), tool: call.name, args: call.args ?? {} });
      try {
        const result = await registry.run(call.name, call.args ?? {});
        responses.push({ functionResponse: { name: call.name, response: { result } } });
      } catch (err) {
        responses.push({ functionResponse: { name: call.name, response: { error: String(err) } } });
      }
    }
    messages.push({ role: "user", parts: responses });
  }

  return { text: "agent hit max rounds without finishing", actualCalls };
}
