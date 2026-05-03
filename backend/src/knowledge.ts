import {readFileSync, writeFileSync, existsSync} from "node:fs";
import { state } from "./state.js";
import { KnowledgeItem } from "./models.js";
import { randomUUID } from "node:crypto";

const FILE = process.env.KNOWLEDGE_FILE || "knowledge.json";

const SEED: KnowledgeItem[] = [];

export function loadKnowledge(): string {
    if (!existsSync(FILE)) {
        writeFileSync(FILE, JSON.stringify(SEED, null, 2))
    }
    return JSON.parse(readFileSync(FILE, "utf8"));
}

function save() {
    writeFileSync(FILE, JSON.stringify(state.knowledge, null, 2));
}

export function addKnowledgeDoc(doc: Omit<KnowledgeItem, "id">): KnowledgeItem {
    const one_knowledge: KnowledgeItem = {...doc, id: randomUUID()};
    state.knowledge.push(one_knowledge);
    save();
    return one_knowledge;
}

export function removeKnowledgeDoc(id: string): boolean {
    const before = state.knowledge.length;
    state.knowledge = state.knowledge.filter(d => d.id !== id);
    if (state.knowledge.length === before) return false;
    save();
    return true;
}

