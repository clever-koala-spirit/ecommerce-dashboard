/**
 * Authentication Routes
 * Handles Shopify OAuth flow and session management
 */
import { Router } from 'express';
import { handleAuthStart, handleAuthCallback } from '../auth/shopify.js';
import { getShop, getAllPlatformConnections } from '../db/database.js';
import { authRateLimiter } from '../middleware/security.js';

const router = Router();

// --- Start OAuth flow ---
// GET /api/auth?shop=mystore.myshopify.com
router.get('/', authRateLimiter, handleAuthStart);

// --- OAuth callback ---
// GET /api/auth/callback?code=xxx&hmac=xxx&shop=xxx&state=xxx
router.get('/callback', authRateLimiter, handleAuthCallback);

// --- Get current shop session info ---
// GET /api/auth/session
router.get('/session', (req, res) => {
  try {
    const shopDomain = req.headers['x-shop-domain'] || req.query.shop;

    if (!shopDomain) {
      return res.status(401).json({ authenticated: false, error: 'No shop domain' });
    }

    const shop = getShop(shopDomain);
    if (!shop || !shop.isActive) {
      return res.status(401).json({ authenticated: false, error: 'Shop not installed' });
    }

    // Return shop info (never return the access token to frontend!)
    const connections = getAllPlatformConnections(shopDomain);

    res.json({
      authenticated: true,
      shop: {
        domain: shop.shopDomain,
        name: shop.shopName,
        email: shop.shopEmail,
        plan: shop.planName,
        installedAt: shop.installedAt,
      },
      connections: connections.map(c => ({
        platform: c.platform,
        status: c.status,
        lastSyncAt: c.lastSyncAt,
      })),
    });
  } catch (error) {
    console.error('[Auth Session Error]', error);
    res.status(500).json({ authenticated: false, error: 'Internal server error' });
  }
});

// --- Check if app is installed for a shop ---
// GET /api/auth/check?shop=mystore.myshopify.com
router.get('/check', (req, res) => {
  const { shop } = req.query;

  if (!shop) {
    return res.json({ installed: false });
  }

  // Validate shop domain format
  const shopDomainRegex = /^[a-z0-9-]+\.myshopify\.com$/i;
  if (!shopDomainRegex.test(shop)) {
    return res.status(400).json({ installed: false, error: 'Invalid shop domain format' });
  }

  const shopData = getShop(shop);
  res.json({ installed: !!(shopData && shopData.isActive) });
});

export default router;
