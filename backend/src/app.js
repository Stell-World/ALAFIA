import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import healthRoutes from './routes/health.routes.js';
import assistantRoutes from './routes/assistant.routes.js';
import chatRoutes from './routes/chat.routes.js';
import conversationRoutes from './routes/conversation.routes.js';
import patientRoutes from './routes/patient.routes.js';
import medicationRoutes from './routes/medication.routes.js';
import pregnancyRoutes from './routes/pregnancy.routes.js';
import appointmentRoutes from './routes/appointment.routes.js';
import authRoutes from './routes/auth.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { createSessionMiddleware } from './middlewares/session.js';

const app = express();

const allowedOrigins = (process.env.FRONTEND_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim());

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '50kb' }));
app.disable('x-powered-by');

if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  const origin = req.get('origin');
  const changesState = !['GET', 'HEAD', 'OPTIONS'].includes(req.method);
  if (changesState && origin && !allowedOrigins.includes(origin)) {
    return res.status(403).json({ error: 'Origine non autorisée.' });
  }
  next();
});

if (process.env.DATABASE_URL && process.env.SESSION_SECRET?.length >= 32) {
  app.use(createSessionMiddleware());
}

app.use('/api/assistant', rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  message: { error: 'Trop de demandes. Patientez une minute.' }
}));

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/chat', rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  message: { error: 'Trop de demandes. Patientez une minute.' }
}), chatRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/patients/me/measurements', patientRoutes);
app.use('/api/patients/me/medications', medicationRoutes);
app.use('/api/patients/me/pregnancy', pregnancyRoutes);
app.use('/api/patients/me/appointments', appointmentRoutes);
app.use('/api/assistant', assistantRoutes);

app.use((req, res) => res.status(404).json({ error: 'Route introuvable.' }));

app.use(errorHandler);

export default app;
