import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDB } from './config/db.js';
import webhookRoutes from './routes/webhookRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import { company } from './config/company.js';

const app = express();
const port = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*' }));
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

app.get('/', (_req, res) => res.json({ message: 'Rise Next Bot API Running', company }));
app.get('/api/health', (_req, res) => res.json({ ok: true, uptime: process.uptime(), time: new Date().toISOString() }));
app.use('/api', webhookRoutes);
app.use('/api/leads', leadRoutes);

connectDB()
  .then(() => app.listen(port, () => console.log(`🚀 API running on port ${port}`)))
  .catch((error) => {
    console.error('❌ Startup failed:', error.message);
    process.exit(1);
  });
