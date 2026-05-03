import { query, createSdkMcpServer, tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import { ToolRegistry } from "../tools/registry.js";
import type { AgentResult } from "./gemini.js";
import { bus } from "../events.js";

const MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-4-6";

// our tool registry stores raw json schema. claude-agent-sdk wants a zod raw shape.
// shallow conversion — good enough for our flat object schemas
function jsonPropToZod(prop: any): z.ZodTypeAny {
  switch (prop?.type) {
    case "string": return z.string();
    case "number":
    case "integer": return z.number();
    case "boolean": return z.boolean();
    case "object": return z.object({}).passthrough();
    case "array": return z.array(z.any());
    default: return z.any();
  }
}

function jsonSchemaToZodShape(schema: any): Record<string, z.ZodTypeAny> {
  const props = schema?.properties ?? {};
  const required: string[] = schema?.required ?? [];
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const [key, value] of Object.entries(props)) {
    const t = jsonPropToZod(value);
    shape[key] = required.includes(key) ? t : t.optional();
  }
  return shape;
}

function buildMcpServer(registry: ToolRegistry) {
  const mcpTools = registry.list().map(t =>
    tool(t.name, t.description, jsonSchemaToZodShape(t.parameters), async (args: any) => {
      const result = await t.execute(args);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }),
  );
  return createSdkMcpServer({ name: "cortex", version: "1.0.0", tools: mcpTools });
}

// brain runs on claude code subprocess (uses your local claude CLI, so Max applies).
// same interface as gemini.ts — streams text live, returns final text + real tool calls
export async function runAgentLoop(registry: ToolRegistry, prompt: string, _maxRounds = 6): Promise<AgentResult> {
  const server = buildMcpServer(registry);
  const allowedTools = registry.list().map(t => `mcp__cortex__${t.name}`);

  const actualCalls: { name: string; args: any }[] = [];
  let text = "";

  process.stdout.write("\n[claude (max) thinking] ");

  for await (const message of query({
    prompt,
    options: {
      model: MODEL,
      mcpServers: { cortex: server },
      allowedTools,
      tools: [],   // disable built-in Read/Edit/Bash — brain only uses our custom tools
      pathToClaudeCodeExecutable: process.env.CLAUDE_CODE_PATH,
      permissionMode: "bypassPermissions",
    },
  })) {
    if (message.type === "assistant") {
      for (const block of message.message.content) {
        if (block.type === "text") {
          process.stdout.write(block.text);
          text += block.text;
        }
        if (block.type === "tool_use") {
          const name = block.name.replace(/^mcp__cortex__/, "");
          process.stdout.write(`\n[tool call] ${name} ${JSON.stringify(block.input)}\n`);
          actualCalls.push({ name, args: block.input });
          bus.publish({ type: "tool:call", t: Date.now(), tool: name, args: block.input });
        }
      }
    }
  }
  process.stdout.write("\n");

  return { text, actualCalls };
}
