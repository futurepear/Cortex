import "./env.js";  // must be first so process.env is loaded before anything else reads it
import express from 'express';
import { reconcileBatch } from "./reconciler.js";
import { state } from "./state.js";
import { drainObservations } from "./prompts/observations.js";
import { loadPromises } from "./promises.js";
import promisesRouter from "./routes/promises.js";

const app = express();
const port = Number(process.env.PORT) || 3001;
const reconcileIntervalMs = Number(process.env.RECONCILE_INTERVAL_MS) || 20_000;

app.use(express.json());

// reconcile loop. while paused is true, addObservation is a no-op so
// nothing piles up while we're thinking
async function tick() {
  if (state.paused) {
    console.log("still reconciling, skipping tick");
    schedule();
    return;
  }

  state.paused = true;
  try {
    const prompt = await drainObservations();
    await reconcileBatch(prompt, state.promises);
  } catch (err) {
    console.error("reconcile error:", (err as any).message);
  } finally {
    state.paused = false;
    schedule();
  }
}

function schedule() {
  setTimeout(tick, reconcileIntervalMs);
}

export function main() {
  console.log(`cortex starting (reconcile every ${reconcileIntervalMs}ms)`);
  state.promises = loadPromises();
  console.log(`loaded ${state.promises.length} promise(s)`);
  schedule();
}


// PATHS

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'cortex-backend' });
});

app.get('/', (_req, res) => {
  res.json({ message: 'Welcome to Cortex Backend!' });
});

app.use(promisesRouter);

app.listen(port, () => {
  console.log(`Cortex backend listening on http://localhost:${port}`);
  main();
});
