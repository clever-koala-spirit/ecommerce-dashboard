import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDB } from './db/database.js';
import { startCronJobs } from './cron/snapshots.js';
import connectionsRouter from './routes/connections.js';
import dataRouter from './routes/data.js';
import aiRouter from './routes/ai.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173', // Vite default port
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
  ],
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/connections', connectionsRouter);
app.use('/api/data', dataRouter);
app.use('/api/ai', aiRouter);

// Forecast endpoint placeholder — will be built in Phase 3
app.post('/api/forecast', (req, res) => {
  res.json({ mock: true, message: 'Forecasting engine — built in Phase 3' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Ecommerce Dashboard API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      connections: '/api/connections',
      data: '/api/data/dashboard',
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware (must be AFTER routes)
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    status: err.status || 500,
  });
});

// Initialize and start server
async function startServer() {
  try {
    await initDB();
    console.log('[Database] Initialized');

    startCronJobs();
    console.log('[Cron] Jobs started');

    app.listen(PORT, () => {
      console.log(`[Server] Running on http://localhost:${PORT}`);
      console.log('[Server] API Documentation:');
      console.log(`  - Health: GET http://localhost:${PORT}/api/health`);
      console.log(`  - Connections: GET http://localhost:${PORT}/api/connections`);
      console.log(`  - Data: GET http://localhost:${PORT}/api/data/dashboard`);
    });
  } catch (error) {
    console.error('[Server] Startup error:', error);
    process.exit(1);
  }
}

startServer();
