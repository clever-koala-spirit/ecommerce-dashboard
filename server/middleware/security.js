/**
 * Security Middleware Stack
 * - Helmet (CSP, HSTS, XSS protection)
 * - Rate limiting (per-IP and per-shop)
 * - Session token verification (for embedded apps)
 * - Shop authentication (fallback to X-Shop-Domain header)
 * - Request sanitization
 * - CORS hardening
 */
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import { getShop } from '../db/database.js';
import { verifyHMAC } from '../auth/shopify.js';
import { verifySessionToken } from './sessionToken.js';

// --- Content Security Policy for Shopify embedded apps ---
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.shopify.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.shopify.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://*.myshopify.com", "https://*.shopify.com"],
      frameSrc: ["'self'", "https://*.myshopify.com", "https://admin.shopify.com"],
      frameAncestors: ["https://*.myshopify.com", "https://admin.shopify.com"],
    },
  },
  crossOriginEmbedderPolicy: false, // Required for Shopify embedding
  crossOriginOpenerPolicy: false,
  xFrameOptions: false, // Let CSP frame-ancestors handle this (X-Frame-Options conflicts with Shopify embedding)
});

// --- Rate limiting: General API ---
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Rate limit per shop + IP combination
    return `${req.shopDomain || 'anonymous'}-${req.ip}`;
  },
  message: { error: 'Too many requests. Please try again later.', retryAfter: 900 },
});

// --- Rate limiting: Auth endpoints (stricter) ---
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // Relaxed for development
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Please try again later.' },
});

// --- Rate limiting: Webhook endpoints ---
export const webhookRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100, // 100 webhooks per minute
  standardHeaders: true,
  legacyHeaders: false,
});

// --- Shop authentication middleware ---
// Works with session tokens (embedded) and X-Shop-Domain header (standalone)
export function requireShopAuth(req, res, next) {
  // Shop domain may already be set by verifySessionToken middleware
  // If not, check header or query params
  const shopDomain = req.shopDomain ||
                     req.headers['x-shop-domain'] ||
                     req.query.shop ||
                     req.session?.shopDomain;

  if (!shopDomain) {
    return res.status(401).json({ error: 'Authentication required. No shop domain provided.' });
  }

  // Validate domain format
  const shopRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/;
  if (!shopRegex.test(shopDomain)) {
    return res.status(400).json({ error: 'Invalid shop domain format.' });
  }

  // Look up shop in database
  const shop = getShop(shopDomain);
  if (!shop || !shop.isActive) {
    return res.status(401).json({ error: 'Shop not found or app not installed.' });
  }

  // Attach shop info to request
  req.shopDomain = shopDomain;
  req.shopData = shop;

  next();
}

// --- Shopify embedded app verification ---
export function verifyShopifyRequest(req, res, next) {
  // If request comes from Shopify (has hmac), verify it
  if (req.query.hmac) {
    if (!verifyHMAC(req.query)) {
      return res.status(403).json({ error: 'Request verification failed.' });
    }
  }
  next();
}

// --- Request sanitization ---
export function sanitizeRequest(req, res, next) {
  // Sanitize query params
  if (req.query) {
    for (const key of Object.keys(req.query)) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '');
      }
    }
  }
  next();
}

// --- Request ID for tracing ---
export function addRequestId(req, res, next) {
  req.requestId = crypto.randomUUID();
  res.setHeader('X-Request-ID', req.requestId);
  next();
}

// --- Request logging (security audit) ---
export function auditLog(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logEntry = {
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      shop: req.shopDomain || 'anonymous',
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.headers['user-agent']?.substring(0, 100),
    };

    // Log security-relevant events
    if (res.statusCode >= 400) {
      console.warn('[Security]', JSON.stringify(logEntry));
    } else if (req.path.includes('/auth') || req.path.includes('/webhook')) {
      console.log('[Audit]', JSON.stringify(logEntry));
    }
  });

  next();
}

// --- Export session token middleware ---
export { verifySessionToken };

// --- CORS configuration ---
export function getCorsConfig() {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'https://slayseason.com',
    'https://www.slayseason.com',
  ];

  return {
    origin: (origin, callback) => {
      // Allow requests with no origin (Shopify webhooks, server-to-server, OAuth redirects)
      if (!origin) return callback(null, true);

      // Allow Shopify admin domains
      if (/^https:\/\/[a-zA-Z0-9-]+\.myshopify\.com$/.test(origin) ||
          /^https:\/\/admin\.shopify\.com$/.test(origin)) {
        return callback(null, true);
      }

      // Allow OAuth redirects from platform servers (no origin header in redirect)
      // OAuth callbacks typically come from server-to-server with no origin header

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Shop-Domain', 'X-Shopify-Hmac-Sha256'],
    maxAge: 86400,
  };
}
