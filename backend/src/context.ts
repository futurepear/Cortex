import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { ContextItem } from "./models.js";
import { state } from "./state.js";

const FILE = process.env.CONTEXT_FILE || "context.json";

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

export function removeContextDoc(id: string): boolean {
  const before = state.context.length;
  state.context = state.context.filter(d => d.id !== id);
  if (state.context.length === before) return false;
  save();
  return true;
}
