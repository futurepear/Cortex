import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { ContextItem } from "./models.js";
import { state } from "./state.js";
import { fetchGoogleDoc } from "./integrations/googleDocs.js";

const FILE = process.env.CONTEXT_FILE || "context.json";

// fetched on boot if context is empty. set SEED_CONTEXT_DOC_ID in env to override
const SEED_DOC_ID = process.env.SEED_CONTEXT_DOC_ID || "1VSmz0V1j6C42zRtZvOGujl3LUZR_ui_RMuhjQueJLVY";

export function loadContext(): ContextItem[] {
  if (!existsSync(FILE)) {
    writeFileSync(FILE, "[]");
    return [];
  }
  return JSON.parse(readFileSync(FILE, "utf8"));
}

function save() {
  writeFileSync(FILE, JSON.stringify(state.context, null, 2));
}

export function addContextDoc(doc: Omit<ContextItem, "id">): ContextItem {
  const item: ContextItem = { ...doc, id: randomUUID() };
  state.context.push(item);
  save();
  return item;
}

// pull the seed google doc on boot if there's no context yet. if it fails, log + continue
export async function ensureSeedContext() {
  if (state.context.length > 0) return;
  try {
    const { title, content } = await fetchGoogleDoc(SEED_DOC_ID);
    addContextDoc({ title, content });
    console.log(`seeded context with "${title}"`);
  } catch (err) {
    console.error("could not seed context doc:", (err as Error).message);
  }
}

export function removeContextDoc(id: string): boolean {
  const before = state.context.length;
  state.context = state.context.filter(d => d.id !== id);
  if (state.context.length === before) return false;
  save();
  return true;
}
