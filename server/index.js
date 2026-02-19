import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Load environment variables FIRST
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { initDB, getDB } from './db/database.js';
import { startCronJobs } from './cron/snapshots.js';
import { startSyncSchedule } from './services/sync.js';
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
  loadShopData,
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
import chatRouter from './routes/chat.js';
import contactRouter from './routes/contact.js';
import newsletterRouter from './routes/newsletter.js';

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
app.use(loadShopData);

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
      uptime: process.env.NODE_ENV !== 'production' ? process.uptime() : undefined,
      memory: process.env.NODE_ENV !== 'production' ? process.memoryUsage() : undefined,
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
    // Embedded app: serve App Bridge page with a link to the session endpoint
    // App Bridge intercepts target="_top" links and handles navigation properly
    const sessionUrl = `https://api.slayseason.com/api/auth/shopify/session?shop=${encodeURIComponent(shop)}`;
    return res.send(`<!DOCTYPE html>
<html><head>
  <meta charset="utf-8">
  <meta name="shopify-api-key" content="${process.env.SHOPIFY_API_KEY}">
  <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js"></script>
  <title>Slay Season</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #f6f6f7; color: #202223; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .container { text-align: center; padding: 40px; }
    .logo { width: 56px; height: 56px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px; }
    .logo span { color: white; font-weight: 700; font-size: 20px; }
    h1 { font-size: 20px; font-weight: 600; margin-bottom: 8px; }
    p { color: #6d7175; font-size: 14px; margin-bottom: 24px; }
    .btn { display: inline-block; padding: 12px 32px; background: #5c6ac4; color: white; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 600; transition: background 0.15s; }
    .btn:hover { background: #4959bd; }
    .spinner { width: 32px; height: 32px; border: 3px solid #e0e0e0; border-top-color: #5c6ac4; border-radius: 50%; animation: spin 0.7s linear infinite; margin: 0 auto 16px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .status { color: #8c9196; font-size: 13px; margin-top: 16px; }
  </style>
</head><body>
  <div class="container">
    <div class="logo"><span>SS</span></div>
    <h1>Slay Season</h1>
    <p>E-commerce analytics dashboard</p>
    <div class="spinner" id="spinner"></div>
    <a id="dashboardLink" href="${sessionUrl.replace(/"/g, '&quot;')}" target="_top" class="btn" style="display:none;">Open Dashboard</a>
    <div class="status" id="status">Connecting...</div>
  </div>
  <script>
    // Wait for App Bridge to initialize, then auto-navigate
    var link = document.getElementById('dashboardLink');
    var spinner = document.getElementById('spinner');
    var status = document.getElementById('status');

    setTimeout(function() {
      // Show the button as fallback
      link.style.display = 'inline-block';
      spinner.style.display = 'none';
      status.textContent = 'Click the button to open your dashboard';

      // Try auto-click after App Bridge has had time to set up
      try { link.click(); } catch(e) {}
    }, 800);
  </script>
</body></html>`);
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

// --- Public chat routes (no auth required) ---
app.use('/api/chat', chatRouter);
app.use('/api/contact', contactRouter);
app.use('/api/newsletter', newsletterRouter);

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
// OAuth routes need auth but shop context is optional (loadShopData already ran)
app.use('/api/oauth', (req, res, next) => {
  if (req.path.includes('/callback')) {
    console.log('[OAuth Raw Debug] Path:', req.path);
    console.log('[OAuth Raw Debug] Full URL:', req.originalUrl);
    console.log('[OAuth Raw Debug] Query:', JSON.stringify(req.query));
    console.log('[OAuth Raw Debug] Hash present:', req.originalUrl.includes('#'));
  }
  next();
}, apiRateLimiter, (req, res, next) => {
  // Callback routes don't carry auth headers (browser redirect from OAuth provider)
  // They authenticate via stored state/userId in the database instead
  if (req.path.includes('/callback')) {
    return next();
  }
  // All other OAuth routes require auth
  if (!req.userId && !req.shopDomain) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  next();
}, oauthRouter);
app.use('/api/billing', apiRateLimiter, billingRouter);

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
  const indexPath = path.resolve(clientDistPath, 'index.html');
  console.log('[SPA] Attempting sendFile:', indexPath, 'exists:', fs.existsSync(indexPath));
  res.sendFile(indexPath, (err) => {
    console.log('[SPA] sendFile callback, err:', err ? err.message : null, 'headersSent:', res.headersSent);
    if (err && !res.headersSent) {
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

    startSyncSchedule();
    log.info('Background data sync scheduled');

    // Security status
    const hasApiKey = !!process.env.SHOPIFY_API_KEY;
    const hasSecret = !!process.env.SHOPIFY_API_SECRET;
    const hasEncryptionKey = !!process.env.ENCRYPTION_KEY;

    app.listen(PORT, '127.0.0.1', () => {
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
