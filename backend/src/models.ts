export interface Observation {
  source: string;
  type: string;
  payload: Record<string, any>;
  timestamp?: number;
}

export interface PromiseItem {
  id: string;
  title: string;
  category: "slo" | "product" | "engineering" | "ops";
}

export interface Drift {
  promiseIds: string[];
  severity: "low" | "medium" | "critical";
  rootCause: string;
  action: string;
}