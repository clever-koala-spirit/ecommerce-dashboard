# Slay Season — Morning Launch Checklist

Everything code-related is done. Here's what only YOU can do (requires credentials/accounts):

---

## Step 1: Generate Encryption Key (2 minutes)
Run this in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy the output and paste it as `ENCRYPTION_KEY=` in your `.env` file.

---

## Step 2: Create Shopify App (10 minutes)
1. Go to https://partners.shopify.com — Create account (if you don't have one)
2. Click **Apps** then **Create app** then **Create app manually**
3. App name: `Slay Season`
4. App URL: `https://api.slayseason.com/app`
5. Allowed redirection URL: `https://api.slayseason.com/api/auth/callback`
6. Copy your **API key** and paste as `SHOPIFY_API_KEY=` in `.env`
7. Copy your **API secret key** and paste as `SHOPIFY_API_SECRET=` in `.env`

### GDPR Webhooks (in App Setup):
- Customer data request URL: `https://api.slayseason.com/api/webhooks/customers-data-request`
- Customer erasure URL: `https://api.slayseason.com/api/webhooks/customers-redact`
- Shop erasure URL: `https://api.slayseason.com/api/webhooks/shop-redact`

---

## Step 3: Revoke Old Token (2 minutes)
The old access token in `.env` (ff53daaa...) needs to be revoked:
1. Go to your Shopify admin then Settings then Apps and sales channels
2. Find the old app connection and remove it
3. Delete lines 19-21 from `.env` (the SHOPIFY_STORE_URL and SHOPIFY_ACCESS_TOKEN)

---

## Step 4: Push to GitHub (5 minutes)
```bash
cd ecommerce-dashboard
git add -A
git commit -m "v2.0 — Shopify App with multi-tenant security, OAuth, GDPR compliance"
git push origin main
```

---

## Step 5: Deploy Frontend to Vercel (5 minutes)
1. Go to https://vercel.com then Import Git Repository
2. Select `ecommerce-dashboard`
3. Framework: **Vite**
4. Root directory: leave blank (vercel.json handles it)
5. Add environment variable: `VITE_API_URL` = `https://api.slayseason.com/api`
6. Click Deploy

### Custom Domain:
1. In Vercel then Settings then Domains then Add `slayseason.com`
2. Follow DNS instructions to point your domain

---

## Step 6: Deploy Backend to GCP VM (10 minutes)
SSH into your VM:
```bash
gcloud compute ssh leo@chip-vm --zone=australia-southeast2-a
```

Then on the VM:
```bash
cd /opt/slayseason
git pull origin main
cd server && npm install --production
sudo cp ../nginx.conf /etc/nginx/sites-available/api.slayseason.com
sudo ln -sf /etc/nginx/sites-available/api.slayseason.com /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo systemctl restart slayseason
```

### Set production .env on VM:
```bash
nano /opt/slayseason/.env
# Set NODE_ENV=production
# Paste your ENCRYPTION_KEY, SHOPIFY_API_KEY, SHOPIFY_API_SECRET
```

### Set up SSL (free with Let's Encrypt):
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.slayseason.com
```

---

## Step 7: DNS Setup (5 minutes)
Point these DNS records:
- `slayseason.com` to Vercel (CNAME to cname.vercel-dns.com)
- `api.slayseason.com` to GCP VM IP `34.151.172.195` (A record)

---

## Step 8: Test Everything (5 minutes)
1. Visit https://slayseason.com — should show Connect page
2. Visit https://api.slayseason.com/api/health — should return `{"status":"ok"}`
3. Enter your test store URL — should redirect to Shopify OAuth
4. Complete OAuth — should redirect back to dashboard
5. Visit https://slayseason.com/privacy — should show privacy policy
6. Visit https://slayseason.com/terms — should show terms of service

---

## Step 9: Delete orphan file
```bash
rm "server/routes/data 2.js"
```

---

## Step 10: Submit to Shopify App Store (when ready)
1. In Shopify Partner Dashboard then Apps then Your app then Listing
2. Use the copy from `SHOPIFY_LISTING.md` in the project
3. Take screenshots of the dashboard, settings, connect page
4. Submit for review

---

## Optional: Connect Ad Platforms (do this after launch)

### Meta Ads OAuth
1. Go to https://developers.meta.com — create app
2. Add "Marketing API" product
3. Copy App ID and App Secret to `.env` as `META_APP_ID` and `META_APP_SECRET`
4. Add OAuth redirect URL: `https://api.slayseason.com/api/oauth/meta/callback`

### Google Ads/GA4 OAuth
1. Go to https://console.cloud.google.com — create OAuth credentials
2. Add authorized redirect URI: `https://api.slayseason.com/api/oauth/google/callback`
3. Copy Client ID and Secret to `.env` as `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

### Klaviyo OAuth
1. Go to Klaviyo Developer Portal — create app
2. Add redirect URI: `https://api.slayseason.com/api/oauth/klaviyo/callback`
3. Copy Client ID and Secret to `.env` as `KLAVIYO_CLIENT_ID` and `KLAVIYO_CLIENT_SECRET`

---

## Quick Reference

| Component | Status | Notes |
|-----------|--------|-------|
| Frontend (React + Vite) | Done | Dark theme, responsive, lazy-loaded legal pages |
| Backend (Express.js) | Done | Multi-tenant, rate-limited, audit-logged |
| Shopify OAuth 2.0 | Done | HMAC verification, timing-safe, nonce protection |
| Shopify Session Tokens | Done | App Bridge JWT auth (required for Shopify review) |
| AES-256-GCM Encryption | Done | All tokens encrypted at rest |
| GDPR Webhooks + Deletion | Done | All 4 webhooks + full shop data deletion |
| OAuth Platform Connect | Done | One-click connect for Meta, Google, Klaviyo, GA4 |
| Privacy Policy | Done | Shopify-compliant, GDPR-ready |
| Terms of Service | Done | Complete legal page |
| Settings Page | Done | OAuth connect buttons (no API key pasting) |
| Mobile Responsive | Done | Hamburger nav, responsive KPI cards |
| Vercel Config | Done | SPA routing, cache headers |
| Nginx Config | Done | Reverse proxy template with SSL |
| App Store Listing | Written | In SHOPIFY_LISTING.md |
