import express from 'express';
import fs from 'node:fs/promises';
import client from 'prom-client';

const app = express();
const PORT = 3333;

app.set('trust proxy', true);

/* -------- PROMETHEUS METRICS -------- */

// Collect default Node.js metrics (CPU, memory, event loop)
client.collectDefaultMetrics({ timeout: 2000 });

// Request counter
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'status']
});

// Request latency
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request latency',
  buckets: [0.05, 0.1, 0.2, 0.5, 1, 2, 5],
  labelNames: ['method', 'status']
});

// In-flight requests
const httpRequestsInFlight = new client.Gauge({
  name: 'http_requests_in_flight',
  help: 'Current in-flight requests'
});

/* -------- MIDDLEWARE -------- */

app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();
  httpRequestsInFlight.inc();

  res.on('finish', () => {
    httpRequestsInFlight.dec();
    httpRequestsTotal.inc({
      method: req.method,
      status: res.statusCode
    });
    end({
      method: req.method,
      status: res.statusCode
    });
  });

  next();
});

/* -------- ROUTES -------- */

app.get('/', async (req, res) => {
  const data = await fs.readFile("data.txt", "utf-8");
  res.send(data);
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

app.listen(PORT, () => {
  console.log(`Node.js running on port ${PORT}`);
});

