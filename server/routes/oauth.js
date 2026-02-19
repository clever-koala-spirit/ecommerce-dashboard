/**
 * OAuth Routes for Platform Connections
 * Handles one-click OAuth flows for Meta Ads, Google Ads, Klaviyo, and GA4
 *
 * Flow:
 * 1. GET /api/oauth/:platform/start → Generate state/PKCE, redirect to platform auth URL
 * 2. GET /api/oauth/:platform/callback → Exchange code for token, save to DB
 */

import express from 'express';
import crypto from 'crypto';
import { savePlatformConnection, getPlatformConnection, saveOAuthState, getOAuthState, deleteOAuthState, getDB } from '../db/database.js';
import { log } from '../utils/logger.js';
import { validateOAuthInitiate, validateOAuthCallback } from '../middleware/validation.js';

const router = express.Router();

// OAuth state is now stored in the database (oauth_states table)
// This was previously stored in memory which was a security vulnerability

// --- Helper Functions ---

function generateState() {
  return crypto.randomBytes(32).toString('hex');
}

function generatePKCE() {
  const verifier = crypto
    .randomBytes(32)
    .toString('base64url')
    .replace(/[^a-zA-Z0-9._-]/g, '');
  const challenge = crypto
    .createHash('sha256')
    .update(verifier)
    .digest('base64url')
    .replace(/[^a-zA-Z0-9._-]/g, '');
  return { verifier, challenge };
}

function getOAuthConfig(platform) {
  const config = {
    meta: {
      authUrl: 'https://www.facebook.com/v19.0/dialog/oauth',
      tokenUrl: 'https://graph.facebook.com/v19.0/oauth/access_token',
      scope: 'ads_read,ads_management',
      clientId: process.env.META_APP_ID,
      clientSecret: process.env.META_APP_SECRET,
    },
    google: {
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      scope: 'openid email profile https://www.googleapis.com/auth/adwords',
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      usesPKCE: true,
      extraParams: { access_type: 'offline', prompt: 'consent' },
    },
    klaviyo: {
      // Klaviyo uses API key, not OAuth — see POST /klaviyo/connect endpoint
      authUrl: null,
      tokenUrl: null,
      scope: null,
      clientId: null,
      clientSecret: null,
      usesPKCE: false,
    },
    ga4: {
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      scope: 'openid email profile https://www.googleapis.com/auth/analytics.readonly',
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      usesPKCE: true,
      extraParams: { access_type: 'offline', prompt: 'consent' },
    },
    tiktok: {
      authUrl: 'https://business-api.tiktok.com/portal/auth',
      tokenUrl: 'https://business-api.tiktok.com/open_api/v1.3/oauth2/access_token/',
      scope: 'read:ads_data,read:campaign_data,read:report_data',
      clientId: process.env.TIKTOK_APP_ID,
      clientSecret: process.env.TIKTOK_APP_SECRET,
      usesPKCE: false,
    },
    shopify: {
      authUrl: null, // Dynamic based on shop domain
      tokenUrl: null,
      scope: 'read_orders,read_products,read_customers,read_analytics',
      clientId: process.env.SHOPIFY_APP_CLIENT_ID,
      clientSecret: process.env.SHOPIFY_APP_CLIENT_SECRET,
      usesPKCE: false,
    },
  };

  return config[platform];
}

// --- Routes ---

/**
 * GET /api/oauth/:platform/start
 * Initiates OAuth flow — redirects user to platform authorization page
 */
router.get('/:platform/start', (req, res) => {
  try {
    const { platform } = req.params;

    // Get shopDomain from user's DB record instead of middleware
    const db = getDB();
    let shopDomain = req.query.shopDomain;
    if (req.userId) {
      try {
        const result = db.exec('SELECT shop_domain FROM users WHERE id = ?', [req.userId]);
        if (result.length > 0 && result[0].values.length > 0) {
          shopDomain = result[0].values[0][0] || shopDomain;
        }
      } catch (e) { /* fallback to query param */ }
    }

    // Validate platform
    const validPlatforms = ['meta', 'google', 'klaviyo', 'ga4', 'tiktok', 'shopify'];
    if (!validPlatforms.includes(platform)) {
      log.security('oauth_invalid_platform_attempt', {
        platform,
        shopDomain,
        ip: req.ip
      });
      return res.status(400).json({ error: 'Unknown platform' });
    }

    const config = getOAuthConfig(platform);
    if (!config) {
      return res.status(400).json({ error: 'Platform configuration missing' });
    }

    // Handle platforms that are not configured yet
    if (platform === 'tiktok' && (!config.clientId || !config.clientSecret)) {
      log.warn('OAuth credentials not configured', { platform });
      return res.status(501).json({
        error: `TikTok API credentials not configured. Contact admin.`,
        platform,
        configured: false,
      });
    }
    
    if (platform === 'meta' && (!config.clientId || !config.clientSecret)) {
      log.warn('OAuth credentials not configured', { platform });
      return res.status(501).json({
        error: `Meta API credentials not configured. Contact admin.`,
        platform,
        configured: false,
      });
    }

    // Validate credentials are configured
    if (!config.clientId || !config.clientSecret) {
      log.warn('OAuth credentials not configured', { platform });
      return res.status(501).json({
        error: `${platform} integration is not configured yet. API credentials are needed.`,
        platform,
        configured: false,
      });
    }

    // Generate CSRF protection
    const state = generateState();

    // Generate PKCE if needed (Google Ads, Klaviyo, GA4)
    let pkce = null;
    if (config.usesPKCE) {
      pkce = generatePKCE();
    }

    // Store state in database for verification in callback (replaces in-memory store)
    // Include userId so callback can authenticate the user after redirect
    saveOAuthState(platform, state, pkce?.verifier || null, shopDomain || null, req.userId || null);

    log.oauth(platform, 'flow_started', {
      shopDomain,
      state: state.substring(0, 8) + '...',
      usesPKCE: !!config.usesPKCE
    });

    // Build OAuth authorization URL
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: `${process.env.APP_URL || 'http://localhost:4000'}/api/oauth/${platform}/callback`,
      response_type: 'code',
      state,
      scope: config.scope,
    });

    // Add PKCE challenge if needed
    if (pkce) {
      params.append('code_challenge', pkce.challenge);
      params.append('code_challenge_method', 'S256');
    }

    // Add extra params (e.g. access_type, prompt for Google)
    if (config.extraParams) {
      for (const [key, value] of Object.entries(config.extraParams)) {
        params.append(key, value);
      }
    }

    // Platform-specific parameters
    if (platform === 'meta') {
      params.set('display', 'popup');
    }

    if (platform === 'tiktok') {
      // TikTok uses app_id instead of client_id
      params.delete('client_id');
      params.set('app_id', config.clientId);
    }

    if (platform === 'shopify') {
      // Shopify needs the shop domain to construct the auth URL
      const shopDomainParam = req.query.shopDomain || shopDomain;
      if (!shopDomainParam) {
        return res.status(400).json({ error: 'Shop domain is required for Shopify connection' });
      }
      const shopifyAuthUrl = `https://${shopDomainParam}/admin/oauth/authorize`;
      const authUrlFinal = `${shopifyAuthUrl}?${params.toString()}`;
      return res.redirect(authUrlFinal);
    }

    const authUrl = `${config.authUrl}?${params.toString()}`;

    res.redirect(authUrl);
  } catch (error) {
    log.error('OAuth flow initialization failed', error, { 
      platform: req.params.platform
    });
    res.status(500).json({ error: 'OAuth initialization failed' });
  }
});

/**
 * GET /api/oauth/:platform/callback
 * Handles OAuth callback — exchanges authorization code for access token
 */
router.get('/:platform/callback', validateOAuthCallback, async (req, res) => {
  try {
    const { platform } = req.params;
    const { code, state, error, error_description } = req.query;

    // Check for OAuth errors from the platform
    if (error) {
      log.oauth(platform, 'callback_error', {
        error,
        error_description,
        ip: req.ip
      });
      return res.status(400).json({
        error: 'OAuth authorization denied',
        details: error_description || error,
      });
    }

    if (!code || !state) {
      log.security('oauth_callback_missing_params', {
        platform,
        hasCode: !!code,
        hasState: !!state,
        ip: req.ip
      });
      return res.status(400).json({ error: 'Missing authorization code or state' });
    }

    const config = getOAuthConfig(platform);
    if (!config) {
      return res.status(400).json({ error: 'Unknown platform' });
    }

    // Verify state for CSRF protection using database
    const storedData = getOAuthState(platform, state);

    if (!storedData) {
      log.security('oauth_invalid_state', {
        platform,
        state: state.substring(0, 8) + '...',
        ip: req.ip
      });
      return res.status(400).json({ error: 'Invalid or expired state parameter' });
    }

    const { verifier: pkceVerifier, shopDomain, userId: storedUserId } = storedData;
    // Restore userId from stored state (since callback redirect doesn't carry auth headers)
    if (storedUserId && !req.userId) {
      req.userId = storedUserId;
    }
    deleteOAuthState(platform, state); // Clean up state

    // Exchange authorization code for access token
    let tokenPayload;
    let fetchOptions;

    if (platform === 'tiktok') {
      // TikTok uses JSON body format
      tokenPayload = {
        app_id: config.clientId,
        secret: config.clientSecret,
        auth_code: code,
        grant_type: 'authorization_code',
      };
      fetchOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tokenPayload),
      };
    } else {
      // Standard OAuth2 flow for other platforms
      tokenPayload = {
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        redirect_uri: `${process.env.APP_URL || 'http://localhost:4000'}/api/oauth/${platform}/callback`,
        grant_type: 'authorization_code',
      };

      // Add PKCE verifier if used
      if (pkceVerifier) {
        tokenPayload.code_verifier = pkceVerifier;
      }

      fetchOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(tokenPayload).toString(),
      };
    }

    const tokenResponse = await fetch(config.tokenUrl, fetchOptions);

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({}));
      throw new Error(`Token exchange failed: ${errorData.error || tokenResponse.statusText}`);
    }

    const tokenData = await tokenResponse.json();

    // Fetch platform account info and save credentials
    const credentials = await fetchPlatformInfo(platform, tokenData);

    // Save encrypted credentials to database
    savePlatformConnection(shopDomain, platform, credentials);

    // Redirect back to settings page with success
    const redirectUrl = `${
      process.env.FRONTEND_URL || 'http://localhost:3000'
    }/settings?platform=${platform}&connected=true`;
    return res.redirect(redirectUrl);
  } catch (error) {
    log.error('OAuth callback processing failed', error, {
      platform: req.params.platform,
      hasCode: !!req.query.code,
      hasState: !!req.query.state
    });

    // Redirect to settings with error
    const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/settings?platform=${req.params.platform}&error=${encodeURIComponent(error.message)}`;
    return res.redirect(redirectUrl);
  }
});

/**
 * Fetch platform-specific account information and prepare credentials
 */
async function fetchPlatformInfo(platform, tokenData) {
  const credentials = {
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token || null,
    expiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : null,
    tokenType: tokenData.token_type || 'Bearer',
  };

  try {
    if (platform === 'meta') {
      // Fetch Meta ad accounts
      const accountsResponse = await fetch(
        `https://graph.facebook.com/v19.0/me/adaccounts?access_token=${tokenData.access_token}&fields=id,name,currency`
      );
      const accountsData = await accountsResponse.json();

      if (accountsData.data && accountsData.data.length > 0) {
        const primaryAccount = accountsData.data[0];
        credentials.adAccountId = primaryAccount.id;
        credentials.accountName = primaryAccount.name;
        credentials.currency = primaryAccount.currency;
      }
    } else if (platform === 'google') {
      // For Google Ads, we need to get accessible customers
      try {
        const customersResponse = await fetch('https://googleads.googleapis.com/v19/customers:listAccessibleCustomers', {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
            'Content-Type': 'application/json',
            'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN || 'MISSING_DEV_TOKEN',
          },
        });

        if (customersResponse.ok) {
          const customersData = await customersResponse.json();
          if (customersData.resourceNames && customersData.resourceNames.length > 0) {
            // Extract customer ID from the first accessible customer
            const firstCustomer = customersData.resourceNames[0];
            credentials.customerId = firstCustomer.replace('customers/', '');
          }
        }
      } catch (error) {
        console.warn('[OAuth] Could not fetch Google Ads customers:', error.message);
      }
      
      credentials.scope = tokenData.scope || 'https://www.googleapis.com/auth/adwords';
    } else if (platform === 'ga4') {
      // For GA4, we might need to get available properties in the future
      credentials.scope = tokenData.scope || 'https://www.googleapis.com/auth/analytics.readonly';
    } else if (platform === 'klaviyo') {
      credentials.scope = tokenData.scope || 'campaigns:read flows:read metrics:read';
    } else if (platform === 'tiktok') {
      // TikTok API v1.3 response format
      if (tokenData.code === 0 && tokenData.data) {
        credentials.accessToken = tokenData.data.access_token;
        credentials.refreshToken = tokenData.data.refresh_token || null;
        credentials.expiresAt = tokenData.data.expires_in ? 
          new Date(Date.now() + tokenData.data.expires_in * 1000) : null;
        
        // TikTok returns advertiser_ids in the token response
        if (tokenData.data.advertiser_ids?.length > 0) {
          credentials.advertiserId = tokenData.data.advertiser_ids[0];
          credentials.advertiserName = `TikTok Advertiser ${tokenData.data.advertiser_ids[0]}`;
        }
        
        // Store the scope for reference
        credentials.scope = tokenData.data.scope || 'read:ads_data,read:campaign_data,read:report_data';
      } else {
        // Fallback for older response format
        credentials.accessToken = tokenData.access_token;
        if (tokenData.advertiser_ids?.length > 0) {
          credentials.advertiserId = tokenData.advertiser_ids[0];
        }
      }
    } else if (platform === 'shopify') {
      credentials.shopDomain = tokenData.shop || null;
    }
  } catch (error) {
    log.warn('Could not fetch platform account info', {
      platform,
      error: error.message,
      message: 'Continuing with token only'
    });
    // Continue with token only if account info fetch fails
  }

  return credentials;
}

/**
 * POST /api/oauth/klaviyo/connect
 * Connects Klaviyo via API key (not OAuth)
 */
router.post('/klaviyo/connect', async (req, res) => {
  try {
    const db = getDB();
    let shopDomain = null;
    if (req.userId) {
      try {
        const result = db.exec('SELECT shop_domain FROM users WHERE id = ?', [req.userId]);
        if (result.length > 0 && result[0].values.length > 0) shopDomain = result[0].values[0][0];
      } catch (e) { /* ignore */ }
    }
    const { apiKey } = req.body;

    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length < 5) {
      return res.status(400).json({ error: 'A valid Klaviyo API key is required' });
    }

    // Validate the key by calling Klaviyo accounts endpoint
    const validateRes = await fetch('https://a.klaviyo.com/api/accounts/', {
      headers: {
        'Authorization': `Klaviyo-API-Key ${apiKey.trim()}`,
        'revision': '2024-02-15',
      },
    });

    if (!validateRes.ok) {
      const errBody = await validateRes.text().catch(() => '');
      log.warn('Klaviyo API key validation failed', { status: validateRes.status, body: errBody.substring(0, 200) });
      return res.status(400).json({ error: 'Invalid Klaviyo API key. Please check and try again.' });
    }

    const accountData = await validateRes.json().catch(() => ({}));
    const accountName = accountData?.data?.[0]?.attributes?.contact_information?.organization_name
      || accountData?.data?.[0]?.id
      || 'Klaviyo Account';

    // Save to platform_connections
    savePlatformConnection(shopDomain, 'klaviyo', {
      accessToken: apiKey.trim(),
      refreshToken: null,
      expiresAt: null,
      tokenType: 'api_key',
      accountName,
    });

    log.oauth('klaviyo', 'api_key_connected', { shopDomain, accountName });

    res.json({
      success: true,
      platform: 'klaviyo',
      accountName,
      message: `Connected to Klaviyo: ${accountName}`,
    });
  } catch (error) {
    log.error('Klaviyo API key connection failed', error, { shopDomain });
    res.status(500).json({ error: 'Failed to connect Klaviyo' });
  }
});

/**
 * GET /api/oauth/:platform/disconnect
 * Disconnects a platform by removing credentials from database
 */
router.post('/:platform/disconnect', async (req, res) => {
  try {
    const { platform } = req.params;
    const db = getDB();
    let shopDomain = null;
    if (req.userId) {
      try {
        const result = db.exec('SELECT shop_domain FROM users WHERE id = ?', [req.userId]);
        if (result.length > 0 && result[0].values.length > 0) shopDomain = result[0].values[0][0];
      } catch (e) { /* ignore */ }
    }

    // Set platform connection status to 'inactive'
    // This is handled via the connections service
    // For now, we'll just verify and acknowledge
    const connection = getPlatformConnection(shopDomain, platform);
    if (!connection) {
      return res.status(404).json({ error: 'Platform not connected' });
    }

    // Mark as disconnected in database
    const dbConn = getDB();
    dbConn.run(
      `UPDATE platform_connections SET status = 'inactive', updated_at = CURRENT_TIMESTAMP WHERE shop_domain = ? AND platform = ? AND status = 'active'`,
      [shopDomain, platform]
    );

    res.json({
      message: `Successfully disconnected ${platform}`,
      platform,
    });
  } catch (error) {
    console.error(`[OAuth] Error disconnecting ${req.params.platform}:`, error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
