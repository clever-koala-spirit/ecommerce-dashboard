import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables FIRST
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { initDB, getDB } from './db/database.js';
import { startCronJobs } from './cron/snapshots.js';
import { log, requestLogger, errorLogger } from './utils/logger.js';
import { sanitizeAllInputs } from './middleware/validation.js';
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
import billingRouter from './routes/billing.js';

const app = express();
app.set('trust proxy', 1); // Behind nginx
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
app.use(requestLogger);
app.use(sanitizeRequest);
app.use(sanitizeAllInputs);
app.use(cors(getCorsConfig()));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));

// --- Session token verification (for embedded Shopify apps) ---
// Extracts JWT from Authorization header and sets req.shopDomain if valid
// Falls back gracefully to X-Shop-Domain header auth if no token
app.use(verifySessionToken);

// --- Public routes (no auth required) ---

// Health check
app.get('/api/health', (req, res) => {
  try {
    // Check database connection
    const db = getDB();
    const dbStatus = db.exec('SELECT 1')[0]?.values ? 'connected' : 'error';
    
    // Check if required environment variables are set
    const envCheck = {
      encryption: !!process.env.ENCRYPTION_KEY,
      jwt: !!process.env.JWT_SECRET,
      stripe: !!process.env.STRIPE_SECRET_KEY,
      email: !!process.env.SENDGRID_API_KEY
    };

    const overall = dbStatus === 'connected' && envCheck.encryption && envCheck.jwt ? 'ok' : 'degraded';
    
    res.json({
      status: overall,
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      database: dbStatus,
      environment: envCheck,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      services: {
        billing: !!process.env.STRIPE_SECRET_KEY ? 'configured' : 'not_configured',
        email: !!process.env.SENDGRID_API_KEY ? 'configured' : 'not_configured'
      }
    });
  } catch (error) {
    log.error('Health check failed', error);
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

// Root endpoint — serve SPA if frontend is built, otherwise API info
app.get('/', (req, res) => {
  const shop = req.query.shop;
  if (shop) {
    // Shopify is opening the app — redirect to dashboard
    // Use open() to escape iframe, with multiple fallbacks
    const dashUrl = `https://slayseason.com/dashboard?shop=${encodeURIComponent(shop)}`;
    return res.send(`<!DOCTYPE html>
<html>
<head>
  <script>
    var url = ${JSON.stringify(dashUrl)};
    // Try multiple methods to escape the Shopify admin iframe
    try { window.open(url, '_top'); } catch(e) {}
    try { window.top.location.href = url; } catch(e) {}
    try { window.parent.location.href = url; } catch(e) {}
    setTimeout(function() { window.location.href = url; }, 500);
  </script>
</head>
<body style="font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#0a0a0a;color:#fff">
  <div style="text-align:center">
    <div style="font-size:24px;margin-bottom:16px">🚀</div>
    <p style="margin:0 0 8px;font-size:16px">Opening Slay Season...</p>
    <p style="margin:0;font-size:13px;opacity:0.5"><a href="${dashUrl}" target="_top" style="color:#818cf8">Click here</a> if not redirected</p>
  </div>
</body>
</html>`);
  }
  // No shop param — serve frontend
  const indexPath = path.join(clientDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
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
app.use('/api/billing', apiRateLimiter, requireShopAuth, billingRouter);

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
app.use(errorLogger);
app.use((err, req, res, next) => {
  // Don't leak error details in production
  const isDev = process.env.NODE_ENV !== 'production';

  // CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'Origin not allowed' });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.details || err.message,
      requestId: req.requestId
    });
  }

  res.status(err.status || 500).json({
    error: isDev ? err.message : 'Internal Server Error',
    requestId: req.requestId,
  });
});

// --- Start server ---
async function startServer() {
  try {
    // Validate required environment variables
    const requiredEnvVars = ['ENCRYPTION_KEY', 'JWT_SECRET'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      log.error('Required environment variables are missing', null, { 
        missingVars,
        message: 'Please set these in your .env file. See .env.example for guidance.'
      });
      process.exit(1);
    }

    await initDB();
    log.info('Database initialized with encrypted storage');

    startCronJobs();
    log.info('Cron jobs started');

    // Security status
    const hasApiKey = !!process.env.SHOPIFY_API_KEY;
    const hasSecret = !!process.env.SHOPIFY_API_SECRET;
    const hasEncryptionKey = !!process.env.ENCRYPTION_KEY;

    app.listen(PORT, () => {
      log.info('Server started', {
        version: '2.0.0',
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        security: {
          helmet: true,
          rateLimiting: true,
          hmac: true,
          encryption: 'AES-256-GCM'
        },
        services: {
          shopifyApiKey: hasApiKey,
          shopifySecret: hasSecret,
          encryptionKey: hasEncryptionKey,
          stripe: !!process.env.STRIPE_SECRET_KEY,
          email: !!process.env.SENDGRID_API_KEY
        },
        endpoints: {
          health: `http://localhost:${PORT}/api/health`,
          auth: `http://localhost:${PORT}/api/auth`,
          dashboard: `http://localhost:${PORT}/api/data/dashboard`
        }
      });
      
      // Still output to console for development
      if (process.env.NODE_ENV !== 'production') {
        console.log(`\n🚀 Slay Season API v2.0.0 running on port ${PORT}`);
        console.log(`🔒 Security: Helmet ✅ | Rate limiting ✅ | HMAC ✅ | AES-256-GCM ✅`);
        console.log(`🏪 Shopify: API Key ${hasApiKey ? '✅' : '⚠️'} | Secret ${hasSecret ? '✅' : '⚠️'}`);
        console.log(`💳 Stripe: ${process.env.STRIPE_SECRET_KEY ? '✅' : '⚠️'} | Email: ${process.env.SENDGRID_API_KEY ? '✅' : '⚠️'}`);
        console.log(`\n📊 Health: http://localhost:${PORT}/api/health`);
        console.log(`🔐 Auth: http://localhost:${PORT}/api/auth?shop=yourstore.myshopify.com`);
        console.log(`📈 Data: http://localhost:${PORT}/api/data/dashboard\n`);
      }
    });
  } catch (error) {
    log.error('Server startup failed', error);
    process.exit(1);
  }
}

startServer();
