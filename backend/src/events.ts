import { EventEmitter } from "node:events";

// every kind of event the brain can emit. all small, JSON-serializable
export type BrainEvent =
  | { type: "tick:start"; t: number }
  | { type: "tick:end"; t: number; durationMs: number }
  | { type: "tool:call"; t: number; tool: string; args: any }
  | { type: "agent:start"; t: number; task: string }
  | { type: "agent:done"; t: number }
  | { type: "report"; t: number; preview: string };

// one shared bus for the whole backend. modules call bus.publish() to fan out
class BrainBus extends EventEmitter {
  publish(e: BrainEvent) {
    this.emit("event", e);
  }
}

export const bus = new BrainBus();
bus.setMaxListeners(50);  // a few SSE clients + internal listeners is fine
