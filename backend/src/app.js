import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import healthRoutes from './routes/health.routes.js';
import assistantRoutes from './routes/assistant.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173'
}));
app.use(express.json({ limit: '10kb' }));

app.use('/api/assistant', rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  message: { error: 'Trop de demandes. Patientez une minute.' }
}));

app.use('/api/health', healthRoutes);
app.use('/api/assistant', assistantRoutes);

app.use(errorHandler);

export default app;