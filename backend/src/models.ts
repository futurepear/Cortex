export interface Observation {
  source: string;
  type: string;
  payload: Record<string, any>;
  timestamp?: number;
}

export interface PromiseItem {
  id: string;
  title: string;
  description: string;     // free text, this is what the brain actually reasons over
  sources?: string[];      // optional hint, which integrations to look at
  createdAt: number;
}

export interface Drift {
  promiseIds: string[];
  severity: "low" | "medium" | "critical";
  rootCause: string;
  action: string;
}
