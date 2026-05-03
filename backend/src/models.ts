export interface Observation {
  source: string;
  type: string;
  payload: Record<string, any>;
  timestamp?: number;
}

export interface PromiseItem {
  id: string;
  title: string;
  // category: "slo" | "product" | "engineering" | "ops"; // For now we are only going to have code fixing stuff, so we dont need this 
}

export interface Drift {
  promiseIds: string[];
  severity: "low" | "medium" | "critical";
  rootCause: string;
  action: string;
}