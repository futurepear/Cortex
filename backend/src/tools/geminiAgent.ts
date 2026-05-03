import { ToolRegistry } from "./registry.js";

// NOTE: This file provides a minimal, dependency-free helper to build the
// Gemini request body and run a simple function-call loop. It does NOT include
// an actual Gemini client — pass your own `callGemini` function that posts to
// the Gemini API and returns the raw response object.

export type GeminiCaller = (request: any) => Promise<any>;

export function buildGeminiRequest(registry: ToolRegistry, contextBlocks: any[]) {
  const system = {
    role: "system",
    content:
      "You are an autonomous assistant that can call registered tools to gather data and perform actions. Always prefer read-only tools for analysis. If you decide to call a tool, return exactly one structured function call (name + JSON arguments) using the provided function schemas. After a tool runs, you will be given the tool result and should either request another tool call or finish by returning a final JSON report object: {\"final\": true, \"report\": string, \"confidence\": number}.",
  };

  const user = {
    role: "user",
    content:
      "Context: " +
      JSON.stringify(contextBlocks, null, 2) +
      "\n\nTask: Determine if there is an issue in the live observation data relative to our promises/docs. If you need evidence, call one of the registered tools. If you take an action that is destructive (e.g., discord_sendAnnouncement), stop and ask for human approval first. If you can resolve the question with reads, produce a final report JSON with a confidence (0-100).\n\nReturn either a function call or a final report JSON only.",
  };

  return {
    model: "gemini-1", // replace with your model id
    messages: [system, user],
    // Provide the function schemas so the model can produce structured calls
    functions: registry.getSchemas(),
    function_call: "auto",
  };
}

/**
 * Run a simple loop:
 *  - Call Gemini with `callGemini(request)`
 *  - If Gemini returns function/tool calls, run them via the registry
 *  - Feed tool results back into the model as `role: 'tool'` messages and repeat
 *  - If the model returns a final JSON { final: true, report, confidence }, return it
 *
 * callGemini should return the same raw response structure the model client gives
 * (e.g., OpenAI-like `choices[].message.function_call` or similar). This helper
 * uses `registry.extractToolCalls()` to support multiple response shapes.
 */
export async function runGeminiToolLoop(
  registry: ToolRegistry,
  contextBlocks: any[],
  callGemini: GeminiCaller,
  maxRounds = 6
) {
  let request = buildGeminiRequest(registry, contextBlocks);
  const messages: any[] = request.messages.slice();

  for (let round = 0; round < maxRounds; round++) {
    const resp = await callGemini(request);

    // 1) See if the model asked to call tools
    const calls = registry.extractToolCalls(resp);
    if (calls.length > 0) {
      // Execute each call (sequentially to preserve order/provenance)
      for (const call of calls) {
        const result = await registry.run(call);
        // attach tool result for the model to consume
        messages.push({ role: "tool", name: result.name, content: JSON.stringify(result.result) });
      }

      // Prepare follow-up request with updated messages
      request = {
        model: request.model,
        messages,
        functions: registry.getSchemas(),
        function_call: "auto",
      };
      continue; // call the model again with the tool results
    }

    // 2) No tool calls — check if response contains a final JSON report
    // Try common fields: choices[].message.content or top-level text
    const text =
      resp?.choices?.[0]?.message?.content ?? resp?.choices?.[0]?.text ?? resp?.output ?? resp?.text ?? null;

    if (typeof text === "string") {
      try {
        const maybe = JSON.parse(text);
        if (maybe && maybe.final) return maybe;
      } catch (e) {
        // not JSON — the model didn't return a final structured JSON
      }
    }

    // 3) If no structured final, return the raw response so the caller can inspect it
    return { final: false, raw: resp };
  }

  return { final: false, error: "max rounds exceeded" };
}

export default { buildGeminiRequest, runGeminiToolLoop };
