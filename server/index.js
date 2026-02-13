import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDB } from './db/database.js';
import { startCronJobs } from './cron/snapshots.js';
import {
  securityHeaders,
  apiRateLimiter,
  webhookRateLimiter,
  requireShopAuth,
  verifyShopifyRequest,
  sanitizeRequest,
  addRequestId,
  auditLog,
  getCorsConfig,
  verifySessionToken,
} from './middleware/security.js';

// Route imports
import authRouter from './routes/auth.js';
import userAuthRouter from './routes/userAuth.js';
import webhooksRouter from './routes/webhooks.js';
import connectionsRouter from './routes/connections.js';
import dataRouter from './routes/data.js';
import aiRouter from './routes/ai.js';
import oauthRouter from './routes/oauth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 4000;

// --- Raw body capture for webhook HMAC verification (MUST be before json parser) ---
app.use('/api/webhooks', express.raw({ type: 'application/json', limit: '5mb' }), (req, res, next) => {
  req.rawBody = req.body.toString('utf8');
  req.body = JSON.parse(req.rawBody);
  next();
});

// --- Global middleware ---
app.use(securityHeaders);
app.use(addRequestId);
app.use(auditLog);
app.use(sanitizeRequest);
app.use(cors(getCorsConfig()));
app.use(express.json({ limit: '10mb' }));

// --- Session token verification (for embedded Shopify apps) ---
// Extracts JWT from Authorization header and sets req.shopDomain if valid
// Falls back gracefully to X-Shop-Domain header auth if no token
app.use(verifySessionToken);

// --- Public routes (no auth required) ---

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    security: 'enabled',
  });
});

// Root endpoint — serve SPA if frontend is built, otherwise API info
app.get('/', (req, res) => {
  const indexPath = path.join(clientDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      // Frontend not built — return API info
      res.json({
        name: 'Slay Season — Ecommerce Analytics API',
        version: '2.0.0',
        security: 'AES-256-GCM encryption, HMAC verification, rate limiting',
        status: 'Frontend not built. Run: cd client && npm run build',
      });
    }
  });
});

// --- User authentication routes (for dashboard login/signup) ---
// These must be mounted BEFORE the Shopify auth router to avoid the catch-all GET /
// Routes: POST /api/auth/signup, POST /api/auth/login, GET /api/auth/me, etc.
app.use('/api/auth', userAuthRouter);

// --- Shopify OAuth auth routes (handles GET / for OAuth flow) ---
app.use('/api/auth', authRouter);

// --- Webhook routes (HMAC verified, rate limited) ---
app.use('/api/webhooks', webhookRateLimiter, webhooksRouter);

// --- Serve built frontend (for Shopify embedded app + standalone) ---
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath, { index: false }));

// --- Shopify embedded app entry ---
app.get('/app', verifyShopifyRequest, (req, res) => {
  // Serve the SPA — the frontend reads shop/host from URL query params
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// --- Protected API routes (require authenticated shop) ---
app.use('/api/connections', apiRateLimiter, requireShopAuth, connectionsRouter);
app.use('/api/data', apiRateLimiter, requireShopAuth, dataRouter);
app.use('/api/ai', apiRateLimiter, requireShopAuth, aiRouter);
app.use('/api/oauth', apiRateLimiter, requireShopAuth, oauthRouter);

// Forecast endpoint placeholder
app.post('/api/forecast', apiRateLimiter, requireShopAuth, (req, res) => {
  res.json({ mock: true, message: 'Forecasting engine — Phase 3' });
});

// --- API 404 handler ---
app.all('/api/{*splat}', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// --- SPA fallback: serve frontend for non-API routes ---
app.use((req, res) => {
  if (req.method !== 'GET') {
    return res.status(404).json({ error: 'Not found' });
  }
  // Serve the SPA (handles React Router routes like /settings, /forecast, /privacy, /terms)
  const indexPath = path.join(clientDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      // Frontend not built yet — return API info
      res.status(404).json({ error: 'Frontend not built. Run: cd client && npm run build' });
    }
  });
});

// --- Error handling middleware ---
app.use((err, req, res, next) => {
  // Don't leak error details in production
  const isDev = process.env.NODE_ENV !== 'production';

  console.error(`[Error] ${req.requestId}:`, isDev ? err : err.message);

  // CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'Origin not allowed' });
  }

  res.status(err.status || 500).json({
    error: isDev ? err.message : 'Internal Server Error',
    requestId: req.requestId,
  });
});

// --- Start server ---
async function startServer() {
  try {
    await initDB();
    console.log('[Database] Initialized with encrypted storage');

    startCronJobs();
    console.log('[Cron] Jobs started');

    // Security status
    const hasApiKey = !!process.env.SHOPIFY_API_KEY;
    const hasSecret = !!process.env.SHOPIFY_API_SECRET;
    const hasEncryptionKey = !!process.env.ENCRYPTION_KEY;

    app.listen(PORT, () => {
      console.log(`\n[Server] Slay Season API v2.0.0 running on port ${PORT}`);
      console.log(`[Security] Helmet: ✅ | Rate limiting: ✅ | HMAC: ✅ | AES-256-GCM: ✅`);
      console.log(`[Shopify] API Key: ${hasApiKey ? '✅' : '⚠️ missing'} | Secret: ${hasSecret ? '✅' : '⚠️ missing'}`);
      console.log(`[Crypto] Encryption key: ${hasEncryptionKey ? '✅ (from env)' : '⚠️ auto-generated (set ENCRYPTION_KEY for persistence)'}`);
      console.log(`\n  Health: GET http://localhost:${PORT}/api/health`);
      console.log(`  Auth:   GET http://localhost:${PORT}/api/auth?shop=yourstore.myshopify.com`);
      console.log(`  Data:   GET http://localhost:${PORT}/api/data/dashboard (requires auth)\n`);
    });
  } catch (error) {
    console.error('[Server] Startup error:', error);
    process.exit(1);
  }
}

startServer();
