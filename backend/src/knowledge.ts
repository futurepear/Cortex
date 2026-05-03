import {readFileSync, writeFileSync, existsSync} from "node:fs";
import { state } from "./state.js";
// import { rando}

const FILE = process.env.KNOWLEDGE_FILE || "knowledge.json";

// const SEED: 

// export function loadKnowledge(): string {
//     if (!existsSync(FILE)) {
    
//     }
//     return JSON.parse(readFileSync(FILE, "utf8"));
// }

function save() {
    writeFileSync(FILE, JSON.stringify(state.knowledge));
}

export function addKnowledgeDoc() {

}

export function removeKnowledgeDoc() {
    
}

