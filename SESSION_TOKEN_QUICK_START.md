# Shopify Session Token Auth - Quick Reference

## TL;DR - What Changed?

The Slay Season app now uses **JWT session tokens** instead of cookie-based auth. When running inside Shopify admin (embedded), the frontend automatically gets a JWT from Shopify App Bridge and sends it to the backend for verification.

**Mode** | **Auth Method** | **Header**
---------|---|---
**Embedded** (Shopify admin) | JWT token | `Authorization: Bearer <token>`
**Standalone** (dev/deployed) | Shop domain | `X-Shop-Domain: store.myshopify.com`

Both modes are supported automatically—no manual configuration needed.

---

## For Frontend Developers

### How It Works
1. **App Bridge loads**: `window.shopify` API is available when embedded
2. **Get token**: Call `await window.shopify.idToken()` before API requests
3. **Send token**: Include in `Authorization: Bearer <token>` header
4. **Automatic handling**: `ShopifyProvider` and `apiFetch` do this automatically

### No Manual Changes Needed
The providers handle everything:
- `ShopifyProvider.jsx` — Gets tokens for authenticated requests
- `api.js` — Gets tokens for all API calls
- Both fall back to `X-Shop-Domain` header if not embedded

### Example: Using apiFetch
```javascript
// This automatically gets and includes the session token
import { fetchDashboardData } from '@/services/api';

const data = await fetchDashboardData(); // Token included automatically
```

### Example: Using authenticatedFetch from context
```javascript
import { useShopify } from '@/providers/ShopifyProvider';

export function MyComponent() {
  const { authenticatedFetch } = useShopify();

  // Token is automatically included
  const response = await authenticatedFetch('/api/data/dashboard');
  const data = await response.json();

  return <div>{/* ... */}</div>;
}
```

---

## For Backend Developers

### How It Works
1. **Request arrives** with `Authorization: Bearer <token>` (embedded) or `X-Shop-Domain` header (standalone)
2. **verifySessionToken middleware** extracts and verifies the JWT
3. **req.shopDomain is set** from the JWT's `dest` field
4. **requireShopAuth middleware** uses the verified shop domain to authorize the request

### Key Env Variables
```bash
SHOPIFY_API_KEY=abc123...      # Verify token audience
SHOPIFY_API_SECRET=xyz789...   # Verify JWT signature (CRITICAL)
```

### Accessing Shop Info in Routes
```javascript
// Session token verified automatically at this point
router.get('/data/dashboard', (req, res) => {
  const shopDomain = req.shopDomain;     // "store.myshopify.com"
  const shop = req.shopData;             // Full shop record from DB
  const token = req.sessionTokenPayload; // JWT payload (if embedded)
  const method = req.authMethod;         // "session_token" or undefined

  // Now use shopDomain to fetch shop-specific data
  res.json({ dashboard: getShopData(shopDomain) });
});
```

### Debugging Token Issues
```javascript
// In server logs, look for:
[SessionToken] Verified for shop: example-store.myshopify.com  // Success
[SessionToken] Verification failed: jwt expired                 // Failed (falls back)
[SessionToken] Invalid token audience: xyz                      // Wrong API key
```

### Testing Session Tokens Locally
```bash
# In development (standalone mode), X-Shop-Domain is used instead
# Tokens only work when app is inside Shopify admin iframe

# To test tokens:
# 1. Deploy to Shopify Partner account
# 2. Install in development store
# 3. Open app in admin
# 4. Check Network tab for Authorization headers
```

---

## Middleware Chain

```
┌─ Request ─────────────────────────────────┐
│                                           │
│ 1. securityHeaders (Helmet CSP, etc)      │
│ 2. addRequestId                           │
│ 3. auditLog                               │
│ 4. sanitizeRequest                        │
│ 5. cors                                   │
│ 6. express.json() ← BODY PARSED HERE      │
│ 7. verifySessionToken ← JWT VERIFIED      │
│    ├─ If Bearer token: Verify JWT         │
│    │  └─ Set req.shopDomain from dest     │
│    └─ If no Bearer: Fall through          │
│                                           │
│ 8. Public routes (no auth)                │
│    ├─ /api/health                         │
│    ├─ /api/auth                           │
│    └─ /api/webhooks                       │
│                                           │
│ 9. Protected routes (requireShopAuth)     │
│    ├─ /api/connections                    │
│    ├─ /api/data                           │
│    ├─ /api/ai                             │
│    └─ /api/oauth                          │
│                                           │
└─ Response ────────────────────────────────┘
```

---

## Files Changed

### Client
- `client/index.html` — Added App Bridge CDN
- `client/src/providers/ShopifyProvider.jsx` — Token fetching in `authenticatedFetch` and `checkAuth`
- `client/src/services/api.js` — Token fetching in `apiFetch`

### Server
- `server/middleware/sessionToken.js` — NEW: JWT verification
- `server/middleware/security.js` — Imported/exported session token middleware
- `server/index.js` — Added session token middleware to chain

---

## Common Issues & Fixes

### "I'm getting 401 Unauthorized"
**Check:**
1. Is `SHOPIFY_API_SECRET` correct in `.env`?
2. Is the shop installed and `isActive` in the database?
3. Are you running inside Shopify admin (embedded)?

**Solution:**
```bash
# Verify env vars
echo $SHOPIFY_API_SECRET  # Should output something

# Check database for shop
sqlite3 database.db "SELECT domain, isActive FROM shops WHERE domain='store.myshopify.com';"
```

### "Token expired" Error
**Cause:** Token was too old (shouldn't happen—App Bridge auto-refreshes)
**Solution:** Check if `window.shopify.idToken()` is throwing errors; check browser console

### "Invalid token audience"
**Cause:** `SHOPIFY_API_KEY` doesn't match token's `aud` claim
**Solution:** Verify `SHOPIFY_API_KEY` in `.env` matches Shopify Partner account

### Token not sent (standalone mode)
**Expected behavior** — In standalone mode (development), tokens aren't available, so `X-Shop-Domain` header is used instead. This is fine.

### "window.shopify is undefined"
**Expected** — Only defined when embedded in Shopify admin. Standalone mode won't have it, which is correct.

---

## Security Notes

✅ **Token signature verified** using `SHOPIFY_API_SECRET`
✅ **Audience validated** against `SHOPIFY_API_KEY`
✅ **Expiration checked** (tokens last ~1 minute)
✅ **Shop domain extracted** from JWT (not user input)
✅ **No cookies stored** (prevents CSRF attacks)
✅ **Fallback auth** if token fails (doesn't break standalone mode)

❌ **Don't**: Try to forge JWTs—Shopify signs them
❌ **Don't**: Skip audience validation—it's in the code
❌ **Don't**: Cache tokens—App Bridge refreshes them automatically

---

## Testing Checklist

### Embedded Mode
- [ ] Deploy to Shopify Partner account
- [ ] Install app in test store
- [ ] Open app in admin
- [ ] Verify Network tab shows `Authorization: Bearer ...` headers
- [ ] Check server logs for `[SessionToken] Verified for shop`
- [ ] Test API requests work correctly

### Standalone Mode
- [ ] Run `npm run dev` in both client and server
- [ ] Manually enter shop domain on connect page
- [ ] Verify Network tab shows `X-Shop-Domain` header (no Bearer)
- [ ] Test API requests work correctly

### Error Cases
- [ ] Stop server, call API — should get 501
- [ ] Modify env vars, call API — should log verification error
- [ ] Test with wrong shop domain — should get 401

---

## References

📖 [Full Implementation Guide](./SESSION_TOKEN_IMPLEMENTATION.md)
📖 [Shopify App Bridge Docs](https://shopify.dev/docs/api/app-bridge)
📖 [JWT Verification with Node.js](https://github.com/auth0/node-jsonwebtoken)

---

**Last Updated:** February 13, 2026
