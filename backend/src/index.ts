import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import poisRouter from './routes/pois';
import beaconsRouter from './routes/beacons';
import { errorHandler } from './middleware/errorHandler';

// Trigger DB init + schema creation on startup
import './database/db';

const app = express();
const PORT = Number(process.env.PORT ?? 3000);

// ─── Security & parsing ───────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN ?? '*' }));
app.use(compression());
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ─── Rate limiting ────────────────────────────────────────────────────────────
app.use('/api/', rateLimit({
  windowMs: 60_000,       // 1 minute
  max: 120,               // 120 req/min per IP — enough for mobile scanning
  standardHeaders: true,
  legacyHeaders: false,
}));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'wayfinder-api', time: new Date().toISOString() });
});

app.use('/api/pois',    poisRouter);
app.use('/api/beacon',  beaconsRouter);

// ─── Error handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🗺  WAYFINDER API running on http://localhost:${PORT}`);
  console.log(`   Environment : ${process.env.NODE_ENV ?? 'development'}`);
});

export default app;
