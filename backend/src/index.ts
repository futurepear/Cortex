import "./env.js";   // first so process.env is loaded before any other module reads it
import express from 'express';
import { reconcileBatch } from "./reconciler.js";
import { state } from "./state.js";
import { drainObservations } from "./prompts/observations.js";
import { loadPromises } from "./promises.js";
import { loadContext, ensureSeedContext } from "./context.js";
import { startDiscordBot } from "./integrations/discordBot.js";
import promisesRouter from "./routes/promises.js";
import contextRouter from "./routes/context.js";

const app = express();
const port = Number(process.env.PORT) || 3001;
const reconcileIntervalMs = Number(process.env.RECONCILE_INTERVAL_MS) || 20_000;

app.use(express.json());

// brain heartbeat. self-rescheduling so a slow tick can't overlap itself
async function tick() {
  if (state.paused) {
    console.log("still reconciling, skipping tick");
    schedule();
    return;
  }

  state.paused = true;
  try {
    const observations = await drainObservations();
    await reconcileBatch(observations, state.promises, state.context);
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

export async function main() {
  console.log(`cortex starting (reconcile every ${reconcileIntervalMs}ms)`);
  state.promises = loadPromises();
  state.context = loadContext();
  await ensureSeedContext();
  console.log(`loaded ${state.promises.length} promise(s), ${state.context.length} context doc(s)`);
  try {
    await startDiscordBot();
    console.log("discord bot ready");
  } catch (err) {
    console.error("discord bot failed to start:", (err as Error).message);
  }
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
app.use(contextRouter);

app.listen(port, () => {
  console.log(`Cortex backend listening on http://localhost:${port}`);
  main();
});
