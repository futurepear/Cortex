import express from 'express';
import { PROMISES, OBSERVATIONS } from "./mock.js";
import { reconcileBatch } from "./reconciler.js";
import { state, addObservation, drainObservations } from "./state.js";

const app = express();
const port = Number(process.env.PORT) || 3001;
const reconcileIntervalMs = Number(process.env.RECONCILE_INTERVAL_MS) || 20_000;

app.use(express.json());

// fake "stream source" for now: every 2s, push one mock observation onto the queue
let i = 0;
function startMockObservationSource() {
  setInterval(() => {
    const obs = OBSERVATIONS[i % OBSERVATIONS.length];
    i++;
    addObservation(obs);
    console.log("Observation queued:", obs);
  }, 2000);
}

// Reconcile loop: drains queue + analyzes batch, then schedules next run.
// Self-rescheduling (not setInterval) so a long reconcile can't overlap itself.
let isReconciling = false;
async function reconcileTick() {
  if (isReconciling) {
    console.log("Reconcile already in progress, skipping tick.");
    scheduleNextReconcile();
    return;
  }

  isReconciling = true;
  try {
    const batch = drainObservations();
    await reconcileBatch(batch, state.promises);
  } catch (err) {
    console.error("Reconcile error:", (err as any).message);
  } finally {
    isReconciling = false;
    scheduleNextReconcile();
  }
}

function scheduleNextReconcile() {
  setTimeout(reconcileTick, reconcileIntervalMs);
}

export function main() {
  console.log(`Cortex starting... (reconcile interval: ${reconcileIntervalMs}ms)`);
  state.promises = PROMISES;
  startMockObservationSource();
  scheduleNextReconcile();
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
