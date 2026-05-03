import express from 'express';
import { PROMISES, OBSERVATIONS } from "./mock.js";
import { handleObservation } from "./reconciler.js";
import { state } from "./state.js";

const app = express();
const port = Number(process.env.PORT) || 3001;

app.use(express.json());

// fake "stream source" for now
let i = 0;

function getNextObservation() {
  const obs = OBSERVATIONS[i % OBSERVATIONS.length];
  i++;
  return obs;
}
//  fake source stream ends here

export function main() {
  console.log("Cortex starting...");

  state.promises = PROMISES;

  setInterval(async () => {
    const obs = getNextObservation();

    console.log("\n New observation:", obs);

    try {
      await handleObservation(obs, state.promises);
    } catch (err) {
      console.error(" Error processing observation:", (err as any).message);
    }
  }, 2000);
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
  // start the demo run after server is listening
  main();
});