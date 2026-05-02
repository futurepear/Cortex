import express from 'express';
import { PROMISES, OBSERVATIONS } from "./mock.js";
import { handleObservation } from "./reconciler.js";
import { state } from "./state.js";

const app = express();
const port = Number(process.env.PORT) || 3001;

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'cortex-backend' });
});

function main() {
  console.log(" Cortex starting...");

  state.promises = PROMISES;

  for (const obs of OBSERVATIONS) {
    state.observations.push(obs);

    console.log("\n New observation:", obs);

    handleObservation(obs, state.promises);
  }

  console.log("\n Done");
}

app.listen(port, () => {
  console.log(`Cortex backend listening on http://localhost:${port}`);
  // start the demo run after server is listening
  main();
});