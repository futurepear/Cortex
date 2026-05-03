import { toolSchemas } from "../tools/index.js";

export async function buildSystemPrompt() {
  return `You are the Cortex OS AI, the smartest company brain ever.

You can call the following tools:
${toolSchemas
  .map((t: any) => `- ${t.function.name}: ${t.function.description}`)
  .join("\n")}
  
  System Promises:

  Basic Company info:
  
  `;
}

export default buildSystemPrompt;