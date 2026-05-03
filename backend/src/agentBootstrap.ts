import { ToolRegistry } from "./tools/registry.js";
import registerIntegrations from "./tools/registerIntegrations.js";
import geminiAgent from "./tools/geminiAgent.js";
import { callGemini as callGeminiRaw } from "./llm/gemini.js";

export async function bootstrapAgent() {
  const registry = new ToolRegistry();
  registerIntegrations(registry);

  const contextBlocks = [
    { name: "promises", data: "(replace with actual promises)" },
    { name: "company_docs", data: "(replace with company docs or links)" },
    { name: "observations", data: "(replace with recent observations)" },
  ];

  // adapter that converts geminiAgent request into messages and functions
  const callGemini = async (request: any) => {
    return callGeminiRaw(request.messages || [], request.functions || [], request.model);
  };

  const result = await geminiAgent.runGeminiToolLoop(registry, contextBlocks, callGemini as any);

  console.log("Agent loop result:", result);

  return result;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  bootstrapAgent().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

export default bootstrapAgent;
