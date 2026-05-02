import express from 'express';

const app = express();
const port = Number(process.env.PORT) || 3001;

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'cortex-backend' });
});

app.listen(port, () => {
  console.log(`Cortex backend listening on http://localhost:${port}`);
});
