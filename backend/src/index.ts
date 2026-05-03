import express from 'express';
import { PROMISES } from "./mock.js";
import { reconcileBatch } from "./reconciler.js";
import { state, drainObservations } from "./state.js";
import { startObservationSource } from "./observations.js";

const app = express();
const port = Number(process.env.PORT) || 3001;
const reconcileIntervalMs = Number(process.env.RECONCILE_INTERVAL_MS) || 20_000;

app.use(express.json());

// reconcile loop. self-rescheduling so a slow batch can't overlap itself
let reconciling = false;
async function tick() {
  if (reconciling) {
    console.log("still reconciling, skipping tick");
    schedule();
    return;
  }

  reconciling = true;
  try {
    const batch = drainObservations();
    await reconcileBatch(batch, state.promises);
  } catch (err) {
    console.error("reconcile error:", (err as any).message);
  } finally {
    reconciling = false;
    schedule();
  }
}

function schedule() {
  setTimeout(tick, reconcileIntervalMs);
}

export function main() {
  console.log(`cortex starting (reconcile every ${reconcileIntervalMs}ms)`);
  state.promises = PROMISES;
  startObservationSource();
  schedule();
}


// PATHS

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'cortex-backend' });
});

app.get('/', (_req, res) => {
  res.json({ message: 'Welcome to Cortex Backend!' });
});

app.listen(port, () => {
  console.log(`Cortex backend listening on http://localhost:${port}`);
  main();
});
