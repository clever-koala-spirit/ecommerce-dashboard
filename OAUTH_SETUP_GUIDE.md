# OAuth One-Click Connect Setup Guide

This guide explains how to set up OAuth "one-click connect" flows for Meta Ads, Google Ads, Klaviyo, and GA4 in the Slay Season app. Users can now click a button and authenticate with each platform without copying/pasting API keys.

## Architecture Overview

The OAuth implementation follows a secure pattern:

1. **Frontend**: User clicks "Connect with [Platform]" button
2. **Backend Start**: `GET /api/oauth/:platform/start` generates state (CSRF) + PKCE (if needed) and redirects to platform auth URL
3. **Platform Auth**: User logs in and grants permissions
4. **Backend Callback**: `GET /api/oauth/:platform/callback` exchanges code for token and saves encrypted credentials to DB
5. **Redirect Back**: User is redirected to `/settings?platform=X&connected=true`

## Environment Configuration

Add the following to your `.env` file (template available in `.env.example`):

### Meta Ads OAuth

```env
META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret
```

**How to get these:**
1. Go to https://developers.facebook.com/
2. Create or select your app
3. Add "Facebook Login" product
4. Go to Settings → Basic to find App ID and App Secret
5. Set Redirect URIs: `https://your-domain.com/api/oauth/meta/callback` and `http://localhost:4000/api/oauth/meta/callback` (for dev)

### Google OAuth (for Google Ads & GA4)

```env
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

**How to get these:**
1. Go to https://console.cloud.google.com/
2. Create a new project (or select existing)
3. Enable "Google Ads API" and "Google Analytics Reporting API"
4. Go to Credentials → Create OAuth 2.0 Client ID
5. Application type: "Web application"
6. Add Authorized redirect URIs:
   - `https://your-domain.com/api/oauth/google/callback`
   - `https://your-domain.com/api/oauth/ga4/callback`
   - `http://localhost:4000/api/oauth/google/callback` (for dev)
   - `http://localhost:4000/api/oauth/ga4/callback` (for dev)

### Klaviyo OAuth

```env
KLAVIYO_CLIENT_ID=your_klaviyo_client_id
KLAVIYO_CLIENT_SECRET=your_klaviyo_client_secret
```

**How to get these:**
1. Go to https://www.klaviyo.com/account/apps
2. Click "Create App"
3. Name it "Slay Season" (or your app name)
4. Redirect URI: `https://your-domain.com/api/oauth/klaviyo/callback` and `http://localhost:4000/api/oauth/klaviyo/callback` (for dev)
5. Copy Client ID and Client Secret

## API Endpoints

### 1. Start OAuth Flow

```
GET /api/oauth/:platform/start?shop=merchant.myshopify.com
```

**Platforms:** `meta`, `google`, `klaviyo`, `ga4`

**Response:** Redirects user to platform authorization page

**Example:**
```
GET /api/oauth/meta/start?shop=mystore.myshopify.com
```

### 2. OAuth Callback Handler

```
GET /api/oauth/:platform/callback?code=...&state=...
```

**Platforms:** `meta`, `google`, `klaviyo`, `ga4`

**What it does:**
- Verifies state parameter (CSRF protection)
- Exchanges authorization code for access token
- Fetches platform account info (ad accounts, properties, etc.)
- Saves encrypted credentials to database
- Redirects back to `/settings?platform=X&connected=true`

**Example redirect from platform:**
```
GET /api/oauth/meta/callback?code=AQCm...&state=abc123def456
```

### 3. Disconnect Platform

```
POST /api/oauth/:platform/disconnect
```

**Headers:**
```
X-Shop-Domain: merchant.myshopify.com
Content-Type: application/json
```

**Response:**
```json
{
  "message": "Successfully disconnected meta",
  "platform": "meta"
}
```

## Frontend Implementation

The SettingsPage component has been updated with:

### Connect Button

When platform is NOT connected:
```jsx
<button
  onClick={() => initiateOAuthFlow('meta')}
  style={styles.btnOAuth}
>
  <Link size={16} /> Connect with Meta
</button>
```

### Account Info Display

When platform IS connected:
```jsx
<div style={styles.accountInfoBox}>
  <span>Account: Meta Ads Account Name</span>
</div>
```

### Disconnect Button

```jsx
<button
  onClick={() => disconnectPlatform('meta')}
  style={styles.btnDanger}
>
  <Trash2 size={16} /> Disconnect
</button>
```

### Connection Status Check

On mount, the component checks `/api/connections` to load platform connection status:

```javascript
useEffect(() => {
  const checkConnections = async () => {
    const response = await fetch('/api/connections', {
      headers: { 'X-Shop-Domain': shop?.shopifyDomain }
    });
    const data = await response.json();
    // data.meta.connected, data.google.connected, etc.
  };
}, [shop?.shopifyDomain]);
```

## Security Features

### State Parameter (CSRF Protection)

- Generated as random 32-byte hex string on `/start`
- Verified on `/callback` before exchanging code
- Expired after 15 minutes
- Stored in-memory (production should use Redis/DB)

### PKCE (Proof Key for Code Exchange)

Used by: `google`, `klaviyo`, `ga4`

- Code verifier: random 43-character string
- Code challenge: SHA256(verifier) in base64url encoding
- Prevents authorization code interception

### Encrypted Storage

All credentials are encrypted with AES-256-GCM:
```javascript
// In database
const encrypted = encrypt(JSON.stringify(credentials));

// Retrieved as
const { credentials } = getPlatformConnection(shopDomain, platform);
```

### Per-Shop Isolation

Each shop's credentials are stored separately:
```sql
UNIQUE(shop_domain, platform)
```

## Data Flow: Complete Example

### User clicks "Connect Meta"

```
1. Frontend: Click button
   initiateOAuthFlow('meta')

2. Redirect to:
   GET /api/oauth/meta/start?shop=mystore.myshopify.com

3. Backend generates:
   - state: "abc123def456..." (32 bytes hex)
   - Stored: { verifier: null, shopDomain: "mystore.myshopify.com", timestamp: ... }

4. Redirect to Meta:
   https://www.facebook.com/v19.0/dialog/oauth
     ?client_id=META_APP_ID
     &redirect_uri=https://api.slayseason.com/api/oauth/meta/callback
     &response_type=code
     &state=abc123def456...
     &scope=ads_read,ads_management
     &display=popup
```

### User authorizes and Meta redirects back

```
1. Meta redirects:
   GET /api/oauth/meta/callback?code=AQCm...&state=abc123def456...

2. Backend verifies:
   - State matches stored value ✓
   - State not expired ✓

3. Exchange code for token:
   POST https://graph.facebook.com/v19.0/oauth/access_token
   {
     client_id: META_APP_ID,
     client_secret: META_APP_SECRET,
     code: "AQCm...",
     redirect_uri: "https://api.slayseason.com/api/oauth/meta/callback"
   }

4. Response:
   {
     access_token: "EAACCC...",
     token_type: "bearer",
     expires_in: 5184000
   }

5. Fetch account info:
   GET https://graph.facebook.com/v19.0/me/adaccounts
   Returns: [{ id: "act_123456", name: "My Ad Account" }]

6. Save to database:
   INSERT INTO platform_connections
   (shop_domain, platform, credentials_encrypted, status)
   VALUES (
     "mystore.myshopify.com",
     "meta",
     encrypt({
       accessToken: "EAACCC...",
       adAccountId: "act_123456",
       accountName: "My Ad Account",
       tokenType: "bearer",
       expiresAt: "2025-02-20T..."
     }),
     "active"
   )

7. Redirect back to frontend:
   /settings?platform=meta&connected=true
```

## Testing Locally

### 1. Set up tunnel to localhost

Use ngrok or similar to get a public URL:

```bash
ngrok http 4000
# Output: https://abc123.ngrok.io
```

### 2. Update environment variables

```env
APP_URL=https://abc123.ngrok.io
FRONTEND_URL=https://abc123.ngrok.io
```

### 3. Update OAuth app callback URLs

In each platform's settings, add:
- `https://abc123.ngrok.io/api/oauth/:platform/callback`

### 4. Start server and test

```bash
cd server
npm run dev

# In another terminal
cd client
npm run dev
```

Navigate to `http://localhost:3000/settings` and click "Connect with Meta"

## Troubleshooting

### "OAuth not configured for meta. Contact support."

**Cause:** `META_APP_ID` or `META_APP_SECRET` not set in `.env`

**Fix:** Add credentials to `.env` and restart server

### "Invalid or expired state parameter"

**Cause:** State was not found or >15 minutes old

**Fix:** May indicate:
1. Server restarted (in-memory store cleared)
2. User took too long to authorize
3. Browser session lost

### "Token exchange failed"

**Cause:** Invalid code or wrong redirect URI

**Fix:** Verify:
1. Redirect URI matches exactly in platform settings
2. Code is not expired (usually 10 minutes)
3. Client ID/Secret are correct

### Connection shows "Not Connected" after successful OAuth

**Cause:** Database save failed

**Fix:** Check:
1. `ENCRYPTION_KEY` is set and consistent
2. Database is initialized
3. `savePlatformConnection` was called
4. Check server logs for errors

## Database Schema

```sql
CREATE TABLE platform_connections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  shop_domain TEXT NOT NULL,
  platform TEXT NOT NULL,
  credentials_encrypted TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  last_sync_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(shop_domain, platform)
);
```

**Fields:**
- `shop_domain`: Shopify store domain (e.g., "mystore.myshopify.com")
- `platform`: Platform key (e.g., "meta", "google", "klaviyo", "ga4")
- `credentials_encrypted`: AES-256-GCM encrypted JSON with tokens
- `status`: "active" or "inactive" (for soft delete)
- `last_sync_at`: When data was last synced
- `updated_at`: When credentials were last refreshed

## Credential Storage Format

Each platform's encrypted credentials JSON:

### Meta
```json
{
  "accessToken": "EAACCC...",
  "adAccountId": "act_123456",
  "accountName": "My Ad Account",
  "currency": "USD",
  "tokenType": "bearer",
  "expiresAt": "2025-02-20T..."
}
```

### Google Ads / GA4
```json
{
  "accessToken": "ya29.a0...",
  "refreshToken": "1//0gXX...",
  "tokenType": "Bearer",
  "expiresAt": "2025-02-13T...",
  "scope": "https://www.googleapis.com/auth/adwords https://www.googleapis.com/auth/analytics.readonly"
}
```

### Klaviyo
```json
{
  "accessToken": "pk_test_...",
  "tokenType": "bearer",
  "expiresAt": "2025-02-20T...",
  "scope": "campaigns:read flows:read metrics:read"
}
```

## Refresh Token Handling

Currently, tokens are stored but not automatically refreshed. To implement token refresh:

1. Check token expiry in `getPlatformConnection()`
2. If expired, use `refreshToken` to get new token
3. Update stored credentials

Example (future enhancement):
```javascript
export function getPlatformConnectionWithRefresh(shopDomain, platform) {
  let connection = getPlatformConnection(shopDomain, platform);

  if (connection?.credentials?.expiresAt) {
    const expiresAt = new Date(connection.credentials.expiresAt);
    if (expiresAt < new Date()) {
      // Token expired — refresh it
      const refreshed = await refreshAccessToken(platform, connection.credentials.refreshToken);
      savePlatformConnection(shopDomain, platform, refreshed);
      connection = getPlatformConnection(shopDomain, platform);
    }
  }

  return connection;
}
```

## Next Steps

1. ✅ Created OAuth routes: `/server/routes/oauth.js`
2. ✅ Mounted routes in server: `/server/index.js`
3. ✅ Updated SettingsPage UI: `/client/src/pages/SettingsPage.jsx`
4. ✅ Added env vars: `.env` and `.env.example`
5. **TODO:** Get OAuth credentials from each platform
6. **TODO:** Add to `.env` file
7. **TODO:** Test each platform's OAuth flow
8. **TODO:** Implement token refresh logic (optional)
9. **TODO:** Update services to use stored OAuth tokens instead of env vars

## Integration with Services

To use OAuth tokens in data services (Meta, Google, Klaviyo, GA4):

### Current (using env vars)
```javascript
export class MetaService {
  constructor() {
    this.accessToken = process.env.META_ACCESS_TOKEN;
  }
}
```

### Future (using OAuth tokens)
```javascript
export class MetaService {
  constructor(shopDomain) {
    this.shopDomain = shopDomain;
  }

  getAccessToken() {
    const connection = getPlatformConnection(this.shopDomain, 'meta');
    return connection?.credentials?.accessToken;
  }
}
```

Then in connections.js:
```javascript
const metaService = new MetaService(shopDomain);
const testResult = await metaService.testConnection();
```

## Files Modified

1. **Created:**
   - `/server/routes/oauth.js` - OAuth flow routes

2. **Modified:**
   - `/server/index.js` - Added oauth router import and mount
   - `/client/src/pages/SettingsPage.jsx` - Replaced credential inputs with OAuth buttons
   - `/server/middleware/security.js` - CORS comments for OAuth redirects
   - `.env` - Added OAuth credential placeholders
   - `.env.example` - Added OAuth credential documentation

## Version History

- **v1.0** (2025-02-13): Initial OAuth implementation for Meta, Google, Klaviyo, GA4
