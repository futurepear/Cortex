import express from "express";
import { bus, BrainEvent } from "../events.js";

const router = express.Router();

// SSE — keeps the connection open and pushes every brain event as it happens.
// frontend connects with `new EventSource("/api/events")`
router.get("/events", (req, res) => {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.flushHeaders();

  // hello so the client knows it's connected
  res.write(`data: ${JSON.stringify({ type: "hello", t: Date.now() })}\n\n`);

  const onEvent = (e: BrainEvent) => {
    res.write(`data: ${JSON.stringify(e)}\n\n`);
  };
  bus.on("event", onEvent);

  // heartbeat every 20s so proxies/load balancers don't kill the idle connection
  const heartbeat = setInterval(() => res.write(`: ping\n\n`), 20_000);

  req.on("close", () => {
    bus.off("event", onEvent);
    clearInterval(heartbeat);
  });
});

export default router;
