# Shopify Session Token Authentication - Flow Diagrams

## 1. Embedded Mode (Inside Shopify Admin)

### Request Flow Diagram

```
┌─────────────────────────────────────┐
│   Browser (Shopify Admin iframe)    │
│                                     │
│  1. User clicks button              │
│     └─→ Component calls API         │
│                                     │
│  2. API call reaches apiFetch()     │
│     ├─ Checks if embedded           │
│     ├─ Calls window.shopify ────┐   │
│     │                           │   │
│     └─────────────────────────┐ │   │
│                               │ │   │
└───────────────────────────────┼─┼───┘
                                │ │
                                │ │ 3. Shopify App Bridge
                                │ │    generates JWT token
                                │ │    (signed by Shopify)
                                │ │
                                └─┼───────────────────┐
                                  │                   │
                                  │ Token contents:   │
                                  │ - iss: shop URL   │
                                  │ - aud: API key    │
                                  │ - exp: ~1 min     │
                                  │ - sub: user ID    │
                                  │                   │
┌─────────────────────────────────┼───────────────────┼───────┐
│                                 │                   │       │
│  4. Frontend includes token     │                   │       │
│                                 │                   │       │
│     Authorization: Bearer <jwt> │←──────────────────┘       │
│     Content-Type: application/json                          │
│     X-Shop-Domain: store.myshopify.com                      │
│                                                             │
│  5. Send HTTP POST to /api/data/dashboard                  │
│                                                             │
│     ┌─────────────────────────────────────┐                │
│     │ POST /api/data/dashboard             │                │
│     │ Authorization: Bearer eyJhbGc...    │                │
│     │ Content-Type: application/json      │                │
│     │                                     │                │
│     │ {"filter": "last_30_days"}          │                │
│     └─────────────────────────────────────┘                │
│                                 │                          │
└─────────────────────────────────┼──────────────────────────┘
                                  │
                    ┌─────────────▼───────────────┐
                    │                             │
                    │   NETWORK TRANSMISSION      │
                    │  (to backend server)        │
                    │                             │
                    └─────────────┬───────────────┘
                                  │
                    ┌─────────────▼─────────────────────┐
                    │                                   │
                    │   Express Server                  │
                    │                                   │
                    │  6. Request arrives at backend    │
                    │     - Has Authorization header   │
                    │     - Headers: {                 │
                    │         authorization:           │
                    │         "Bearer <token>",       │
                    │         ...                      │
                    │       }                          │
                    │                                   │
                    │  7. verifySessionToken middleware│
                    │     ├─ Extract token             │
                    │     ├─ Remove "Bearer " prefix   │
                    │     └─ Token = "eyJhbGc..."      │
                    │                                   │
                    └─────────────┬───────────────────┘
                                  │
        ┌─────────────────────────▼────────────────┐
        │                                          │
        │  8. JWT Verification (jwt.verify)        │
        │                                          │
        │  jwt.verify(token, SHOPIFY_API_SECRET)   │
        │                                          │
        │  Verifies:                               │
        │  ✓ Signature valid (HMAC-SHA256)        │
        │  ✓ Not tampered with                     │
        │  ✓ Signed by Shopify (using secret)     │
        │                                          │
        │  Returns decoded payload:                │
        │  {                                       │
        │    iss: "https://store.myshopify.com",  │
        │    dest: "https://store.myshopify.com/admin",
        │    aud: "abc123..." (API key),          │
        │    sub: "gid://shopify/User/12345",    │
        │    exp: 1705363200,                     │
        │    iat: 1705363140                      │
        │  }                                       │
        │                                          │
        └─────────────────┬──────────────────────┘
                          │
        ┌─────────────────▼──────────────────────┐
        │                                        │
        │  9. Validate Claims                    │
        │                                        │
        │  ✓ Check aud === SHOPIFY_API_KEY      │
        │    If not: return 401 INVALID_AUDIENCE│
        │                                        │
        │  ✓ Check exp > now                     │
        │    If not: return 401 TOKEN_EXPIRED    │
        │                                        │
        │  ✓ Check dest is valid URL             │
        │    If not: return 401 INVALID_FORMAT   │
        │                                        │
        └─────────────────┬──────────────────────┘
                          │
        ┌─────────────────▼──────────────────────┐
        │                                        │
        │  10. Extract Shop Domain               │
        │                                        │
        │  destUrl = new URL(decoded.dest)      │
        │  shopDomain = destUrl.hostname         │
        │                                        │
        │  Result: "store.myshopify.com"        │
        │                                        │
        │  11. Attach to Request                 │
        │                                        │
        │  req.shopDomain = "store.myshopify.com"
        │  req.sessionTokenPayload = {...}      │
        │  req.authMethod = "session_token"     │
        │                                        │
        └─────────────────┬──────────────────────┘
                          │
        ┌─────────────────▼──────────────────────┐
        │                                        │
        │  12. Next Middleware (requireShopAuth) │
        │                                        │
        │  req.shopDomain already set!           │
        │  ├─ Look up shop in database           │
        │  ├─ Verify shop is active              │
        │  └─ Continue to route handler          │
        │                                        │
        └─────────────────┬──────────────────────┘
                          │
        ┌─────────────────▼──────────────────────┐
        │                                        │
        │  13. Route Handler                     │
        │                                        │
        │  router.get('/api/data/dashboard',    │
        │    (req, res) => {                    │
        │      const shopDomain =               │
        │        req.shopDomain;                │
        │      // ✓ Authenticated and verified! │
        │      const data = getData(shopDomain);│
        │      res.json(data);                  │
        │    }                                  │
        │  )                                    │
        │                                        │
        └─────────────────┬──────────────────────┘
                          │
                ┌─────────▼──────────┐
                │                    │
                │  14. Response sent │
                │  HTTP 200          │
                │  {                 │
                │    "revenue": ..., │
                │    "orders": ...,  │
                │    ...             │
                │  }                 │
                │                    │
                └─────────┬──────────┘
                          │
        ┌─────────────────▼──────────────────────┐
        │                                        │
        │  15. Browser Receives Response         │
        │                                        │
        │  Component gets data                   │
        │  ├─ Updates state                      │
        │  ├─ Re-renders                         │
        │  └─ Shows dashboard data               │
        │                                        │
        └────────────────────────────────────────┘
```

---

## 2. Standalone Mode (Development)

### Request Flow Diagram

```
┌─────────────────────────────────────────┐
│   Browser (localhost or external site)   │
│                                         │
│  1. User visits app (not in Shopify)   │
│     isEmbedded() = false                │
│                                         │
│  2. Enter shop domain manually          │
│     └─→ Component calls API             │
│                                         │
│  3. API call reaches apiFetch()         │
│     ├─ Checks if embedded: NO           │
│     ├─ Tries window.shopify.idToken()   │
│     │  └─ FAILS (not in Shopify)        │
│     └─ Falls back to header auth        │
│                                         │
│  4. Prepare headers:                    │
│     X-Shop-Domain: store.myshopify.com  │
│     Content-Type: application/json      │
│     (NO Authorization header)           │
│                                         │
│  5. Send HTTP POST to /api/data/dashboard
│                                         │
│     ┌──────────────────────────────┐   │
│     │ POST /api/data/dashboard     │   │
│     │ X-Shop-Domain: store...      │   │
│     │ Content-Type: application/json
│     │                              │   │
│     │ {"filter": "last_30_days"}   │   │
│     └──────────────────────────────┘   │
│                                         │
└────────────────────┬────────────────────┘
                     │
       ┌─────────────▼──────────────┐
       │                            │
       │   NETWORK TRANSMISSION     │
       │  (to backend server)       │
       │                            │
       └─────────────┬──────────────┘
                     │
       ┌─────────────▼──────────────────────┐
       │                                    │
       │   Express Server                   │
       │                                    │
       │  6. Request arrives at backend     │
       │     - NO Authorization header      │
       │     - Has X-Shop-Domain header     │
       │     - Headers: {                  │
       │         'x-shop-domain':          │
       │         'store.myshopify.com',   │
       │         ...                       │
       │       }                           │
       │                                    │
       │  7. verifySessionToken middleware  │
       │     ├─ Check Authorization header  │
       │     ├─ NOT present                 │
       │     └─ Fall through (call next())  │
       │                                    │
       └─────────────┬──────────────────────┘
                     │
       ┌─────────────▼──────────────────────┐
       │                                    │
       │  8. requireShopAuth middleware      │
       │                                    │
       │  req.shopDomain not set            │
       │  ├─ Check X-Shop-Domain header    │
       │  ├─ Found: "store.myshopify.com"  │
       │  │                                 │
       │  ├─ Validate domain format         │
       │  │  └─ Matches *.myshopify.com     │
       │  │                                 │
       │  ├─ Look up shop in database       │
       │  │  └─ Found and active            │
       │  │                                 │
       │  └─ Attach to request:             │
       │     req.shopDomain = "store..."   │
       │     req.shopData = {...}          │
       │                                    │
       └─────────────┬──────────────────────┘
                     │
       ┌─────────────▼──────────────────────┐
       │                                    │
       │  9. Route Handler                  │
       │                                    │
       │  router.get('/api/data/dashboard', │
       │    (req, res) => {                │
       │      const shopDomain =           │
       │        req.shopDomain;            │
       │      // ✓ Authenticated via header!
       │      const data = getData(        │
       │        shopDomain                 │
       │      );                           │
       │      res.json(data);              │
       │    }                              │
       │  )                                │
       │                                    │
       └─────────────┬──────────────────────┘
                     │
           ┌─────────▼──────────┐
           │                    │
           │  10. Response sent │
           │  HTTP 200          │
           │  {                 │
           │    "revenue": ..., │
           │    "orders": ...,  │
           │    ...             │
           │  }                 │
           │                    │
           └─────────┬──────────┘
                     │
       ┌─────────────▼──────────────────────┐
       │                                    │
       │  11. Browser Receives Response     │
       │                                    │
       │  Component gets data               │
       │  ├─ Updates state                  │
       │  ├─ Re-renders                     │
       │  └─ Shows dashboard data           │
       │                                    │
       └────────────────────────────────────┘
```

---

## 3. Middleware Chain Execution

```
HTTP Request Arrives
        │
        ▼
securityHeaders (Helmet)
├─ Content-Security-Policy
├─ HSTS
├─ X-Frame-Options
└─ X-Content-Type-Options
        │
        ▼
addRequestId
├─ req.requestId = crypto.randomUUID()
└─ X-Request-ID header
        │
        ▼
auditLog
├─ Start timer
└─ Setup finish listener
        │
        ▼
sanitizeRequest
├─ Remove <script> tags
├─ Remove javascript: URLs
└─ Remove on* handlers
        │
        ▼
cors(getCorsConfig())
├─ Check origin
├─ Allow Shopify domains
└─ Allow configured origins
        │
        ▼
express.json({ limit: '10mb' })
├─ Parse JSON body
├─ Set req.body
└─ req.rawBody ready
        │
        ▼
verifySessionToken ◄────── NEW MIDDLEWARE
├─ Check Authorization header
├─ If Bearer token:
│  ├─ Extract token
│  ├─ Verify JWT signature
│  ├─ Validate aud (audience)
│  ├─ Validate exp (expiration)
│  ├─ Set req.shopDomain
│  ├─ Set req.sessionTokenPayload
│  └─ Set req.authMethod = 'session_token'
│
└─ If no Bearer token:
   └─ Continue (fall through)
        │
        ▼
PUBLIC ROUTES (no auth required)
├─ GET  /api/health
├─ POST /api/auth
└─ POST /api/webhooks
        │
        ▼
        └─→ Route handlers
            ├─ Health check
            ├─ OAuth flow
            └─ Webhook processing
        │
        ▼
PROTECTED ROUTES (requireShopAuth required)
│
├─ requireShopAuth middleware
│  ├─ If req.shopDomain already set:
│  │  └─ Use it (from session token)
│  │
│  └─ If req.shopDomain not set:
│     ├─ Check X-Shop-Domain header
│     ├─ Validate domain format
│     ├─ Look up in database
│     └─ Set req.shopDomain
│
├─ Then continue to route handlers:
│  ├─ GET  /api/connections
│  ├─ GET  /api/data/dashboard
│  ├─ POST /api/data/invalidate
│  ├─ GET  /api/ai/suggestions
│  └─ POST /api/oauth/connect
│
        │
        ▼
Error Handlers
├─ CORS errors
├─ Authentication errors
├─ Server errors (500)
└─ Not found (404)
        │
        ▼
Response Sent to Client
└─ Includes X-Request-ID header
```

---

## 4. Token Lifecycle

```
Timeline: Token Generation to Expiration
========================================

T=0s    ┌──────────────────────────────────────────┐
        │ User opens app in Shopify admin          │
        │ App loads Shopify App Bridge             │
        │ window.shopify API becomes available     │
        └──────────────────────────────────────────┘
           │
           ▼
T=1s    ┌──────────────────────────────────────────┐
        │ User clicks button (triggers API call)   │
        │ Frontend calls window.shopify.idToken()  │
        └──────────────────────────────────────────┘
           │
           ▼
T=2s    ┌──────────────────────────────────────────┐
        │ Shopify generates new JWT:               │
        │ {                                        │
        │   "iat": 1705363140 (T=2s)              │
        │   "exp": 1705363200 (T=60s) ← 1 minute  │
        │   "aud": "abc123...",                   │
        │   "iss": "https://store...",            │
        │   "dest": "https://store.../admin",    │
        │   "sub": "gid://shopify/User/123"      │
        │ }                                        │
        │ Signed with SHOPIFY_API_SECRET          │
        └──────────────────────────────────────────┘
           │
           ▼
T=3-58s ┌──────────────────────────────────────────┐
        │ Token is VALID                           │
        │ ✓ Signature verified                     │
        │ ✓ Audience matches                       │
        │ ✓ Not yet expired (exp > now)           │
        │                                          │
        │ Multiple API calls can use this token:  │
        │ Request 1: Authorization: Bearer <JWT> │
        │ Request 2: Authorization: Bearer <JWT> │
        │ Request 3: Authorization: Bearer <JWT> │
        │ (All use same token)                    │
        └──────────────────────────────────────────┘
           │
           ▼
T=59s   ┌──────────────────────────────────────────┐
        │ Token approaching expiration             │
        │ Still valid but near end                 │
        └──────────────────────────────────────────┘
           │
           ▼
T=60s   ┌──────────────────────────────────────────┐
        │ Token EXPIRES (exp = now)                │
        │ Next API call triggers new token fetch   │
        │ window.shopify.idToken() generates new   │
        │ Shopify returns new token:               │
        │ {                                        │
        │   "iat": 1705363200 (new T=0)           │
        │   "exp": 1705363260 (new T=60s)         │
        │   ...same claims...                     │
        │ }                                        │
        │ Process repeats...                       │
        └──────────────────────────────────────────┘
           │
           ▼
T=120s+ ┌──────────────────────────────────────────┐
        │ (Continuous token refresh loop)          │
        │ Every 60 seconds, new token generated    │
        │ Old tokens automatically discarded       │
        │ No manual token management needed        │
        └──────────────────────────────────────────┘
```

---

## 5. Error Scenarios

### Scenario A: Invalid Signature

```
Request:
  Authorization: Bearer <FORGED_TOKEN>

Processing:
  jwt.verify(token, SHOPIFY_API_SECRET) ──→ FAILS

  Error: JsonWebTokenError: invalid signature

Response:
  [SessionToken] Verification failed: invalid signature
  ↓
  Fall through to next middleware (requireShopAuth)
  ↓
  Check X-Shop-Domain header
  ↓
  If header present: Use fallback auth
  If header absent: 401 Authentication required
```

### Scenario B: Expired Token

```
Request:
  Authorization: Bearer <EXPIRED_TOKEN>
  (token.exp = 1705363140, current time = 1705363200)

Processing:
  jwt.verify() detects exp < now

  Error: TokenExpiredError: jwt expired

Response:
  [SessionToken] Verification failed: jwt expired
  ↓
  Fall through to next middleware (requireShopAuth)
  ↓
  Check X-Shop-Domain header
  ↓
  If header present: Use fallback auth
  (In embedded mode, this shouldn't happen—App Bridge auto-refreshes)
```

### Scenario C: Wrong Audience

```
Request:
  Authorization: Bearer <TOKEN_FOR_DIFFERENT_APP>
  (token.aud = "wrong_api_key_123")

Processing:
  jwt.verify() succeeds (signature valid)
  ↓
  Check: decoded.aud !== SHOPIFY_API_KEY
  ↓
  Mismatch detected!

Response:
  HTTP 401 Unauthorized
  {
    "error": "Invalid token audience",
    "code": "INVALID_AUDIENCE"
  }

  ✓ Request rejected (no fallback for security)
```

---

## 6. Authentication Decision Tree

```
                         Request Arrives
                              │
                              ▼
                    Has Authorization header?
                        /            \
                      YES             NO
                      │                │
                      ▼                ▼
                Bearer token?      Check X-Shop-Domain
                  /      \           /           \
                YES      NO        YES            NO
                │         │         │              │
                ▼         ▼         ▼              ▼
            Verify  Skip token  Extract shop    No shop
            JWT      auth       domain from      domain
             │                  header          provided
             ▼                   │               │
    ┌─────────────┐              │               ▼
    │ Signature   │              │          HTTP 401
    │ valid?      │              │      Authentication
    └──┬──────┬───┘              │        Required
       │      │                  │
      YES     NO                 ▼
       │      │            ┌──────────────┐
       │      │            │ Validate     │
       │      │            │ domain format│
       │      │            └──┬───────┬───┘
       │      │               │       │
       │      │             OK      INVALID
       │      │               │       │
       │      │               ▼       ▼
       │      │          Look up   HTTP 400
       │      │          in DB    Invalid format
       │      │               │
       │      │               ▼
       │      │          Shop active?
       │      │            /      \
       │      │          YES       NO
       │      │           │        │
       ▼      ▼           ▼        ▼
    Verify  Fall      Continue  HTTP 401
    aud     through   to route    Shop not
     │      to header  handler    found
     ▼      auth
  aud OK?
   / \
 YES  NO
  │    │
  ▼    ▼
 Set  HTTP
req.   401
shop  INVALID
domain AUDIENCE
 │
 ▼
Validate
expiration
 │
 ▼
exp OK?
 / \
YES NO
 │   │
 ▼   ▼
Set  HTTP
req. 401
shop TOKEN_
domain EXPIRED
 │
 ▼
Extract
from dest
 │
 ▼
Set
req.shop
Domain
 │
 ▼
Continue
to route
handler
 │
 ▼
✓ Authenticated!
```

---

**Last Updated**: February 13, 2026
