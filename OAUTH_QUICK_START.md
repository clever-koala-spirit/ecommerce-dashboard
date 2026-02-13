# OAuth Quick Start Guide

Get OAuth one-click connect working in 5 minutes.

## 1. Get OAuth Credentials (5-10 minutes per platform)

### Meta Ads
1. Go to https://developers.facebook.com/
2. Create app → Select "Business" → "Manage Business Integrations"
3. Find "Facebook Login" → Set up
4. Under Settings → Basic, copy:
   - App ID → `META_APP_ID`
   - App Secret → `META_APP_SECRET`
5. Settings → Facebook Login → Valid OAuth Redirect URIs:
   ```
   http://localhost:4000/api/oauth/meta/callback
   https://your-production-domain.com/api/oauth/meta/callback
   ```

### Google Ads & GA4
1. Go to https://console.cloud.google.com/
2. Create new project
3. Enable these APIs:
   - Google Ads API
   - Google Analytics Reporting API
4. Create OAuth 2.0 Client ID (Web application)
5. Copy:
   - Client ID → `GOOGLE_CLIENT_ID`
   - Client Secret → `GOOGLE_CLIENT_SECRET`
6. Authorized redirect URIs:
   ```
   http://localhost:4000/api/oauth/google/callback
   http://localhost:4000/api/oauth/ga4/callback
   https://your-production-domain.com/api/oauth/google/callback
   https://your-production-domain.com/api/oauth/ga4/callback
   ```

### Klaviyo
1. Go to https://www.klaviyo.com/account/apps
2. Click "Create App"
3. Name it "Slay Season"
4. Copy:
   - Client ID → `KLAVIYO_CLIENT_ID`
   - Client Secret → `KLAVIYO_CLIENT_SECRET`
5. Redirect URI:
   ```
   http://localhost:4000/api/oauth/klaviyo/callback
   https://your-production-domain.com/api/oauth/klaviyo/callback
   ```

## 2. Update .env File

```bash
# In /sessions/youthful-hopeful-cerf/mnt/Cowork/ecommerce-dashboard/.env

# --- Meta OAuth ---
META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret

# --- Google OAuth ---
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# --- Klaviyo OAuth ---
KLAVIYO_CLIENT_ID=your_klaviyo_client_id
KLAVIYO_CLIENT_SECRET=your_klaviyo_client_secret

# --- URLs (for local testing, change for production) ---
APP_URL=http://localhost:4000
FRONTEND_URL=http://localhost:3000
```

## 3. Start Server

```bash
cd /sessions/youthful-hopeful-cerf/mnt/Cowork/ecommerce-dashboard/server
npm run dev
# Should print:
# [Server] Slay Season API v2.0.0 running on port 4000
```

## 4. Start Frontend

```bash
cd /sessions/youthful-hopeful-cerf/mnt/Cowork/ecommerce-dashboard/client
npm run dev
# Should print:
# ➜  Local:   http://localhost:3000
```

## 5. Test OAuth Flow

1. Open http://localhost:3000
2. Go to Settings page
3. Under "Platform Connections", find "Meta Ads" (or any platform)
4. Click "Connect with Meta"
5. You'll be redirected to Meta login
6. Log in and grant permissions
7. You'll be redirected back to Settings with "Connected" status

## ✓ You're Done!

The OAuth flow is now working. Repeat steps 5-7 for each platform.

## Troubleshooting

### "OAuth not configured for meta. Contact support."
**Fix:** Make sure `META_APP_ID` and `META_APP_SECRET` are set in `.env`

### "Invalid or expired state parameter"
**Fix:** User took too long (>15 mins) or server restarted

### "Token exchange failed"
**Fix:** Check that redirect URI matches exactly in platform settings

### Connection shows "Not Connected" after OAuth succeeds
**Fix:** Check browser console and server logs for errors

## Production Deployment

1. Update `.env` with production values:
   ```env
   APP_URL=https://your-domain.com
   FRONTEND_URL=https://your-domain.com
   ```

2. Update OAuth redirect URIs in each platform to use production domain:
   ```
   https://your-domain.com/api/oauth/:platform/callback
   ```

3. Deploy code and restart server

4. Test OAuth flow again on production domain

## Files Changed

- ✓ `/server/routes/oauth.js` - New OAuth routes
- ✓ `/server/index.js` - Mounted OAuth router
- ✓ `/client/src/pages/SettingsPage.jsx` - Updated UI
- ✓ `/.env` - Added OAuth credentials
- ✓ `/.env.example` - Documentation

## Next Steps

- Read `OAUTH_SETUP_GUIDE.md` for detailed setup
- Read `OAUTH_IMPLEMENTATION_SUMMARY.md` for architecture overview
- Integrate OAuth tokens into data services (optional)

## Need Help?

Check the full setup guide for detailed information:
- Platform-specific setup: See OAUTH_SETUP_GUIDE.md
- Architecture: See OAUTH_IMPLEMENTATION_SUMMARY.md
- Code: `/server/routes/oauth.js`
