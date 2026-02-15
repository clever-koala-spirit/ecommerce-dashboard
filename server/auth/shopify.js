/**
 * Shopify OAuth 2.0 Flow
 * Security: HMAC verification, nonce validation, domain validation
 */
import crypto from 'crypto';
import { saveShop, getShop, setShopNonce, getShopNonce } from '../db/database.js';

const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY;
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET;
const SHOPIFY_SCOPES = process.env.SHOPIFY_SCOPES || 'read_orders,read_products,read_customers,read_analytics,read_inventory';
const APP_URL = process.env.APP_URL || 'https://slayseason.com';

// --- Security: Validate Shopify shop domain format ---
function isValidShopDomain(shop) {
  const shopRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/;
  return shopRegex.test(shop);
}

// --- Security: Verify HMAC signature from Shopify ---
export function verifyHMAC(query) {
  const { hmac, ...params } = query;
  if (!hmac) return false;

  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');

  const generatedHmac = crypto
    .createHmac('sha256', SHOPIFY_API_SECRET)
    .update(sortedParams)
    .digest('hex');

  // Timing-safe comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(generatedHmac, 'hex'),
      Buffer.from(hmac, 'hex')
    );
  } catch {
    return false;
  }
}

// --- Security: Verify webhook HMAC ---
export function verifyWebhookHMAC(body, hmacHeader) {
  const generatedHmac = crypto
    .createHmac('sha256', SHOPIFY_API_SECRET)
    .update(body, 'utf8')
    .digest('base64');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(generatedHmac),
      Buffer.from(hmacHeader)
    );
  } catch {
    return false;
  }
}

// --- Step 1: Start OAuth — redirect merchant to Shopify ---
export function handleAuthStart(req, res) {
  const { shop } = req.query;

  if (!shop || !isValidShopDomain(shop)) {
    return res.status(400).json({ error: 'Invalid shop domain. Must be xxx.myshopify.com' });
  }

  // If shop already has a valid token, skip OAuth and issue a session
  const existingShop = getShop(shop);
  if (existingShop && existingShop.accessToken && existingShop.isActive) {
    console.log(`[Auth] Shop already connected: ${shop} — redirecting to session endpoint`);
    return res.redirect(`/api/auth/shopify/session?shop=${encodeURIComponent(shop)}`);
  }

  // Generate cryptographic nonce to prevent CSRF
  const nonce = crypto.randomBytes(16).toString('hex');
  setShopNonce(shop, nonce);

  const redirectUri = `${APP_URL}/api/auth/callback`;
  const installUrl = `https://${shop}/admin/oauth/authorize?` +
    `client_id=${SHOPIFY_API_KEY}` +
    `&scope=${SHOPIFY_SCOPES}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&state=${nonce}`;

  res.redirect(installUrl);
}

// --- Step 2: OAuth Callback — exchange code for access token ---
export async function handleAuthCallback(req, res) {
  const { shop, hmac, code, state, timestamp } = req.query;

  // Security check 1: Validate shop domain
  if (!shop || !isValidShopDomain(shop)) {
    return res.status(400).json({ error: 'Invalid shop domain' });
  }

  // Security check 2: Verify HMAC signature
  if (!verifyHMAC(req.query)) {
    return res.status(403).json({ error: 'HMAC verification failed — request may be tampered' });
  }

  // Security check 3: Verify nonce matches (CSRF protection)
  const savedNonce = getShopNonce(shop);
  if (!savedNonce || savedNonce !== state) {
    return res.status(403).json({ error: 'Nonce mismatch — possible CSRF attack' });
  }

  // Security check 4: Verify timestamp is recent (within 5 minutes)
  const now = Math.floor(Date.now() / 1000);
  const ts = parseInt(timestamp);
  if (isNaN(ts) || Math.abs(now - ts) > 300) {
    return res.status(403).json({ error: 'Request expired — timestamp too old' });
  }

  try {
    // Exchange authorization code for permanent access token
    const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: SHOPIFY_API_KEY,
        client_secret: SHOPIFY_API_SECRET,
        code,
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('[Auth] Token exchange failed:', error);
      return res.status(500).json({ error: 'Failed to get access token from Shopify' });
    }

    const { access_token, scope } = await tokenResponse.json();

    // Fetch shop info for storage
    const shopInfoResponse = await fetch(`https://${shop}/admin/api/2024-01/shop.json`, {
      headers: { 'X-Shopify-Access-Token': access_token },
    });

    let shopInfo = {};
    if (shopInfoResponse.ok) {
      const { shop: shopData } = await shopInfoResponse.json();
      shopInfo = {
        name: shopData.name,
        email: shopData.email,
        plan: shopData.plan_display_name,
      };
    }

    // Clear nonce after successful verification (prevent reuse)
    setShopNonce(shop, '');

    // Save shop with encrypted access token
    saveShop(shop, access_token, scope, shopInfo);

    console.log(`[Auth] Shop installed: ${shop} (${shopInfo.name || 'unknown'})`);

    // Register mandatory GDPR webhooks
    await registerWebhooks(shop, access_token);

    // Redirect to session endpoint to issue a JWT, then to dashboard
    res.redirect(`/api/auth/shopify/session?shop=${encodeURIComponent(shop)}`);

  } catch (error) {
    console.error('[Auth] OAuth callback error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

// --- Register mandatory webhooks (GDPR compliance) ---
async function registerWebhooks(shop, accessToken) {
  const webhooks = [
    { topic: 'app/uninstalled', address: `${APP_URL}/api/webhooks/app-uninstalled` },
    { topic: 'customers/data_request', address: `${APP_URL}/api/webhooks/customers-data-request` },
    { topic: 'customers/redact', address: `${APP_URL}/api/webhooks/customers-redact` },
    { topic: 'shop/redact', address: `${APP_URL}/api/webhooks/shop-redact` },
    { topic: 'orders/create', address: `${APP_URL}/api/webhooks/orders-create` },
  ];

  for (const webhook of webhooks) {
    try {
      await fetch(`https://${shop}/admin/api/2024-01/webhooks.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken,
        },
        body: JSON.stringify({ webhook }),
      });
    } catch (err) {
      console.error(`[Webhooks] Failed to register ${webhook.topic}:`, err.message);
    }
  }
}

// --- Verify installed shop (middleware helper) ---
export function getAuthenticatedShop(shopDomain) {
  if (!shopDomain || !isValidShopDomain(shopDomain)) return null;
  return getShop(shopDomain);
}
