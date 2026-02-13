# Slay Season

> **All-in-one ecommerce analytics for DTC brands**

![React 19](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![Express 5](https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express)
![Vite 7](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite)
![Shopify](https://img.shields.io/badge/Shopify-Ready-96BE2D?style=flat-square&logo=shopify)
![TypeScript](https://img.shields.io/badge/TypeScript--Ready-3178C6?style=flat-square&logo=typescript)
![License MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)

**Slay Season** is a powerful ecommerce analytics dashboard built specifically for direct-to-consumer (DTC) brands using Shopify. Featuring AI-powered forecasting, multi-channel marketing attribution, and advanced security, it provides actionable insights to scale your business.

- 🎯 **Real-time KPI monitoring** across 6 critical metrics
- 📊 **Multi-channel attribution** (Shopify, Meta, Google Ads, Klaviyo, GA4)
- 🤖 **AI forecasting** with 4 proprietary algorithms
- 🔐 **Enterprise security** (AES-256 encryption, Shopify HMAC verification)
- ⚡ **Shopify App Bridge** embedded dashboard (live since January 2025)
- 🎨 **Beautiful UI** built with React 19, Tailwind CSS 4, and Recharts 3

**[Live App](https://api.slayseason.com/app)** • **[Marketing Site](https://slayseason.com)** • **[GitHub](https://github.com/clever-koala-spirit/ecommerce-dashboard)**

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (LTS recommended)
- npm or yarn
- Shopify Partner account (for app development)
- OAuth credentials (optional for integrations)

### Installation

```bash
# Clone the repository
git clone https://github.com/clever-koala-spirit/ecommerce-dashboard.git
cd ecommerce-dashboard

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Environment Setup

Copy the example environment file and populate with your credentials:

```bash
cp .env.example .env
```

See [Environment Variables](#environment-variables) below for detailed configuration.

### Development Mode

**Terminal 1 — Frontend (Vite dev server on :5173)**
```bash
cd client
npm run dev
```

**Terminal 2 — Backend (Express with --watch on :4000)**
```bash
cd server
npm run dev
```

The application will be available at `http://localhost:5173` with hot module reloading for both client and server.

### Production Build

```bash
# Frontend build (optimized with Vite)
cd client
npm run build

# Backend production mode
cd server
npm start
```

---

## 📋 Environment Variables

Create a `.env` file in the project root using `.env.example` as a template:

```env
# === Server Configuration ===
PORT=4000
NODE_ENV=production
APP_URL=https://slayseason.com
FRONTEND_URL=https://slayseason.com

# === Security (REQUIRED) ===
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ENCRYPTION_KEY=your-32-byte-hex-string

# === Shopify App Setup (REQUIRED for embedded app) ===
# Obtain from Shopify Partner Dashboard → App Settings
SHOPIFY_API_KEY=your-api-key
SHOPIFY_API_SECRET=your-api-secret
SHOPIFY_SCOPES=read_orders,read_products,read_customers,read_analytics,read_inventory

# === Meta / Facebook Ads (optional) ===
# For one-click OAuth integration
META_APP_ID=your-meta-app-id
META_APP_SECRET=your-meta-app-secret

# === Google (optional) ===
# For one-click OAuth integration with Google Ads & GA4
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# === Klaviyo (optional) ===
# For one-click OAuth integration
KLAVIYO_CLIENT_ID=your-client-id
KLAVIYO_CLIENT_SECRET=your-client-secret

# === Google Analytics 4 (optional) ===
GA4_PROPERTY_ID=your-property-id
GA4_SERVICE_ACCOUNT_KEY_PATH=/path/to/service-account.json

# === AI Assistant (optional) ===
# Supported providers: openai, anthropic, ollama
AI_PROVIDER=anthropic
AI_API_KEY=your-api-key
AI_MODEL=claude-3-haiku
OLLAMA_BASE_URL=http://localhost:11434
```

**⚠️ Important Security Notes:**
- **Never commit `.env` to version control** — it contains sensitive credentials
- Generate a secure `ENCRYPTION_KEY` using the provided command above
- OAuth secrets must not be exposed in client code
- See [Security](#security) section for credential encryption details

---

## 📊 Features

### Dashboard

#### KPI Cards
- **Revenue**: Total order value with 7-day sparkline
- **Profit**: Gross profit after marketing spend
- **ROAS**: Return on ad spend across paid channels
- **Ad Spend**: Daily average across Meta, Google, Klaviyo
- **CAC**: Customer acquisition cost by channel
- **Net Margin**: Profit margin percentage with trend

#### Analytics Charts
- **Revenue Waterfall**: Breakdown by traffic source
- **Channel Performance**: Table with conversion rates and CSV export
- **Revenue by Channel**: Donut chart showing contribution
- **Paid Ads Performance**: Dual-axis chart (Meta + Google impressions vs. spend)
- **Email Performance**: Klaviyo metrics (sends, opens, clicks, revenue)
- **Cost Breakdown**: Stacked area chart with cost categories pie chart
- **Efficiency Metrics**: MER, LTV:CAC ratio, Contribution Margin

### AI Forecasting Engine

Advanced forecasting with intelligent algorithm selection:

#### Algorithms
- **Holt-Winters**: Seasonal decomposition (optimal for DTC with holiday patterns)
- **Exponential Smoothing**: Weighted recent trends (best for volatile channels)
- **Linear Regression**: Long-term growth projection
- **Weighted Moving Average**: Balanced historical perspective

#### Features
- **Revenue Forecast**: 7, 30, 60, 90-day horizons with confidence bands (80%, 95%)
- **Channel Projections**: Forecast by traffic source, ad platform, or email
- **Budget Simulator**: Auto-optimize ad spend allocation for target ROAS
- **3-Scenario Profit Forecast**: Conservative, Expected, Optimistic scenarios
- **Goal Tracker**: Set targets and view probability of achievement
- **Automated Insights**: 8 insight types (anomalies, trends, recommendations)

### One-Click Platform Integrations

#### Shopify
- OAuth 2.0 App Bridge session tokens (required since January 2025)
- Multi-tenant support (manage multiple stores)
- Read access: orders, products, customers, analytics, inventory
- GDPR webhook compliance (customer data requests & erasure)

#### Meta / Facebook Ads
- OAuth with `ads_read` scope (standard delegated access)
- Campaign, ad set, ad performance metrics
- Spend, impressions, clicks, conversions tracking

#### Google Ads
- OAuth 2.0 with PKCE flow (secure for desktop/mobile)
- Developer token support for advanced features
- Campaign performance, keyword metrics, conversion tracking

#### Klaviyo
- OAuth 2.0 with PKCE (API keys deprecated per Klaviyo Jan 2025)
- Email campaign performance (sends, opens, clicks, revenue)
- List-level subscriber metrics

#### Google Analytics 4
- OAuth shared credential with Google Ads setup
- Property-level data access via Data API
- Session, user, conversion metrics

### Shopify Embedded App

The dashboard is embedded directly into Shopify's admin interface via App Bridge:

- **Same-origin serving**: Express serves the React frontend to eliminate CORS complexity
- **Session token verification**: 1-minute JWT lifetime with automatic refresh
- **HMAC-verified loading**: All requests include Shopify signature verification
- **Multi-tenant**: Single deployment serves unlimited Shopify stores
- **GDPR compliance**: Webhook handlers for customer data requests, erasure, shop redact

---

## 🔐 Security

Slay Season implements enterprise-grade security across all layers:

### Authentication & Authorization
- **JWT tokens**: Signed with HS256, 1-hour expiry for web, 1-minute for Shopify sessions
- **OAuth 2.0 PKCE**: Secure authorization code flow for Google, Klaviyo
- **Shopify App Bridge**: Session tokens verified on every request
- **HMAC verification**: All Shopify webhook requests validated with API secret

### Data Protection
- **AES-256-GCM encryption**: All stored API credentials encrypted at rest
- **Encrypted payloads**: Sensitive data encrypted in transit
- **Database isolation**: SQL.js WASM SQLite with in-memory execution
- **Nonce protection**: Used once and cleared after verification

### Infrastructure
- **Helmet security headers**: HSTS, CSP, X-Frame-Options, X-Content-Type-Options
- **Rate limiting**: 100 requests per 15 minutes per IP address
- **CORS with regex anchoring**: Prevents subdomain attacks
- **CSRF protection**: State parameter in OAuth flows

### Compliance
- **GDPR webhooks**: Customer data request, erasure, and shop redact handlers
- **PCI DSS ready**: No direct credit card storage (Shopify handles payments)
- **Data isolation**: Multi-tenant architecture prevents cross-store leakage

See [SESSION_TOKEN_README.md](SESSION_TOKEN_README.md) for Shopify session token implementation details.

---

## 🏗️ Project Structure

```
ecommerce-dashboard/
├── client/                           # React 19 frontend (Vite)
│   ├── src/
│   │   ├── pages/                   # Page components
│   │   │   ├── LandingPage.jsx      # Public landing page
│   │   │   ├── LoginPage.jsx        # JWT auth login
│   │   │   ├── SignupPage.jsx       # User registration
│   │   │   ├── ConnectPage.jsx      # OAuth integration setup
│   │   │   ├── DashboardPage.jsx    # Main analytics dashboard
│   │   │   ├── ForecastPage.jsx     # AI forecasting interface
│   │   │   ├── SettingsPage.jsx     # User & integration settings
│   │   │   ├── PrivacyPage.jsx      # Privacy policy
│   │   │   └── TermsPage.jsx        # Terms of service
│   │   ├── providers/               # React context providers
│   │   │   ├── AuthProvider.jsx     # JWT auth context
│   │   │   └── ShopifyProvider.jsx  # Shopify App Bridge context
│   │   ├── components/              # Reusable UI components
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── services/                # API client functions
│   │   ├── store/                   # Zustand state management
│   │   ├── utils/                   # Helper utilities
│   │   ├── styles/                  # Tailwind CSS config
│   │   ├── assets/                  # Images, fonts, icons
│   │   ├── mock/                    # Mock data for fallback
│   │   ├── App.jsx                  # Root app component
│   │   └── main.jsx                 # Vite entry point
│   ├── vite.config.js               # Vite bundler config
│   └── package.json
│
├── server/                          # Express 5 backend (BFF)
│   ├── index.js                     # Express server entry point
│   ├── routes/                      # API route handlers
│   │   ├── auth.js                  # JWT auth & registration
│   │   ├── userAuth.js              # User-specific auth endpoints
│   │   ├── connections.js           # Credential management
│   │   ├── data.js                  # Analytics data endpoints
│   │   ├── oauth.js                 # OAuth callback handlers
│   │   ├── ai.js                    # AI forecasting & chat
│   │   └── webhooks.js              # Shopify GDPR webhooks
│   ├── middleware/                  # Express middleware
│   │   ├── sessionToken.js          # Shopify session verification
│   │   ├── security.js              # Helmet, CORS, CSRF
│   │   ├── rateLimiter.js           # Request rate limiting
│   │   └── cache.js                 # 5-minute response caching
│   ├── services/                    # Platform integration modules
│   │   ├── shopify.js               # Shopify Admin API client
│   │   ├── meta.js                  # Meta Marketing API client
│   │   ├── google.js                # Google Ads API client
│   │   ├── ga4.js                   # Google Analytics 4 client
│   │   ├── klaviyo.js               # Klaviyo API client
│   │   ├── aiChat.js                # Multi-provider AI interface
│   │   └── aiContext.js             # AI context generation
│   ├── auth/                        # Authentication logic
│   │   └── shopify.js               # Shopify App Bridge setup
│   ├── db/                          # Database management
│   │   └── database.js              # SQL.js WASM SQLite
│   ├── cron/                        # Scheduled jobs
│   │   └── snapshots.js             # Daily metric snapshots
│   ├── mock/                        # Mock data provider
│   │   └── mockData.js              # Sample datasets
│   ├── package.json
│   └── .env.example
│
├── .env.example                     # Environment template (shared)
├── .gitignore                       # Git exclusions
├── package.json                     # Root workspace config
└── README.md                        # This file
```

---

## 🛠️ Technology Stack

### Frontend
- **React 19** — Latest UI framework with hooks and concurrent rendering
- **Vite 7** — Lightning-fast module bundler and dev server
- **Tailwind CSS 4** — Utility-first CSS framework
- **Recharts 3** — Composable charting library for React
- **Zustand 5** — Minimal state management
- **TanStack React Query 5** — Server state management with caching
- **React Router 7** — Client-side routing
- **Shopify App Bridge React** — Embedded app integration
- **Lucide React** — Beautiful icon library
- **React Hot Toast** — Toast notifications

### Backend
- **Express 5** — Minimalist Node.js web framework
- **sql.js** — WebAssembly SQLite (no native compilation needed)
- **Node-Cache** — In-memory caching with TTL support
- **Node-Cron** — Scheduled job execution
- **@shopify/shopify-api** — Official Shopify API client
- **JSONWebToken** — JWT signing and verification
- **Helmet** — Express security headers
- **Express Rate Limit** — Middleware for rate limiting
- **CORS** — Cross-origin resource sharing

### Authentication & Security
- **JWT (HS256)** — Token-based authentication
- **OAuth 2.0 PKCE** — Secure authorization flows
- **Shopify App Bridge Session Tokens** — Embedded app authentication
- **AES-256-GCM** — Encryption for stored credentials
- **HMAC-SHA256** — Webhook signature verification

### Integrations
- **Shopify Admin API** — Multi-tenant order & customer data
- **Meta Marketing API** — Ad campaign performance
- **Google Ads API** — Campaign metrics and conversions
- **Google Analytics 4 Data API** — Session and user analytics
- **Klaviyo API** — Email campaign metrics
- **OpenAI / Anthropic / Ollama** — Multi-provider AI chat

---

## 📦 API Endpoints

### Authentication
- `POST /api/auth/signup` — Register new account (JWT)
- `POST /api/auth/login` — Login with credentials
- `POST /api/auth/refresh` — Refresh JWT token
- `POST /api/auth/logout` — Clear session

### Platform Connections
- `GET /api/connections/status` — Check OAuth connection status
- `POST /api/connections/connect/:platform` — Initiate OAuth flow
- `GET /api/oauth/:platform/callback` — OAuth redirect handler
- `DELETE /api/connections/:platform` — Disconnect integration

### Analytics Data
- `GET /api/data/kpis` — KPI cards with sparklines
- `GET /api/data/revenue-waterfall` — Revenue breakdown
- `GET /api/data/channels` — Channel performance table
- `GET /api/data/costs` — Cost breakdown and categories
- `GET /api/data/export/csv` — Channel data CSV export

### AI Forecasting
- `POST /api/ai/forecast` — Generate revenue forecast
- `POST /api/ai/forecast/channel` — Channel-level forecast
- `POST /api/ai/budget-simulator` — Optimize ad budget allocation
- `POST /api/ai/scenarios` — 3-scenario profit forecast
- `POST /api/ai/insights` — Generate automated insights
- `POST /api/ai/chat` — Multi-turn AI assistant conversation

### Shopify Webhooks
- `POST /api/webhooks/customer/redact` — GDPR customer data erasure
- `POST /api/webhooks/customer-data-request` — GDPR data access request
- `POST /api/webhooks/shop/redact` — GDPR shop data erasure

---

## 🚢 Deployment

### Marketing Site (slayseason.com)
- **Platform**: Vercel
- **Repository**: Connected to main GitHub branch
- **Auto-deployment**: On push to main
- **Optimization**: Automatic image optimization, Edge Functions

### Dashboard & API (api.slayseason.com)
- **Platform**: Google Cloud Platform (GCP) VM
- **Server**: Ubuntu 22.04 LTS
- **Process Manager**: PM2
- **Database**: SQL.js in-process (WASM SQLite)
- **SSL**: Let's Encrypt with Certbot auto-renewal
- **DNS**: A records pointing to VM IP

### Environment Files
Place `.env` in the project root on production server:
```bash
scp .env your-server:/path/to/ecommerce-dashboard/.env
```

### First-Time Setup (GCP VM)

```bash
# Install Node.js & npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone https://github.com/clever-koala-spirit/ecommerce-dashboard.git
cd ecommerce-dashboard

# Install dependencies
npm install --production
cd client && npm install && npm run build && cd ..
cd server && npm install && cd ..

# Setup environment
cp .env.example .env
# Edit .env with production credentials

# Start with PM2
npm install -g pm2
pm2 start server/index.js --name "slay-season-api"
pm2 startup
pm2 save
```

### Health Check
```bash
curl https://api.slayseason.com/health
```

---

## 🔧 Shopify App Setup

### Partner Account Requirements
1. Create a Shopify Partner account at https://partners.shopify.com
2. Create a new app in the Partner Dashboard
3. Configure app settings:
   - **App name**: Slay Season
   - **App URL**: https://api.slayseason.com
   - **Redirect URI**: https://api.slayseason.com/oauth/shopify/callback
   - **Scopes**:
     ```
     read_orders
     read_products
     read_customers
     read_analytics
     read_inventory
     ```

### Install Locally
```bash
# Development app setup
SHOPIFY_API_KEY=your-key SHOPIFY_API_SECRET=your-secret npm run dev

# Install on test store
# Visit: https://your-dev-store.myshopify.com/admin/apps/your-app-id
```

### GDPR Webhook Setup
In Shopify Partner Dashboard → Webhook subscriptions, add:
- `customers/redact` — Customer data erasure
- `customer_data_requests/fulfill` — GDPR data access
- `shop/redact` — Store data erasure

---

## 🚀 Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** with clear messages: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request with description

### Code Standards
- ESLint configuration in `client/` and `server/`
- Prettier for code formatting
- Component-based architecture in React
- Service modules for API integration

### Reporting Issues
Found a bug? Open an issue on GitHub with:
- Description and reproduction steps
- Expected vs. actual behavior
- Environment (Node version, OS, browser)
- Screenshots or error logs

---

## 📄 License

This project is licensed under the **MIT License** — see the LICENSE file for details. You are free to use, modify, and distribute this software with proper attribution.

---

## 👤 Author

**Leo** — Creator and maintainer of Slay Season

- **GitHub**: https://github.com/clever-koala-spirit
- **Email**: leo@slayseason.com

---

## 🙌 Acknowledgments

Built with modern technologies and best practices in mind:
- Shopify for the Admin API and App Bridge
- Vercel for hosting the marketing site
- GCP for reliable backend infrastructure
- The open-source community for amazing libraries

---

## 📞 Support

For questions, feedback, or feature requests:

- **Website**: https://slayseason.com
- **Email**: support@slayseason.com
- **GitHub Issues**: https://github.com/clever-koala-spirit/ecommerce-dashboard/issues

---

## 🎯 Features Status

| Feature | Status | Details |
|---------|--------|---------|
| **Core Dashboard** | ✅ Built | KPI cards, charts, real-time data |
| **AI Forecasting** | ✅ Built | 4 algorithms, 7-90 day horizons, scenarios |
| **Shopify Integration** | ✅ Built | App Bridge, session tokens, multi-tenant |
| **Meta Ads Integration** | ✅ Built | OAuth, campaign performance |
| **Google Ads Integration** | ✅ Built | OAuth PKCE, campaign metrics |
| **Google Analytics 4** | ✅ Built | OAuth, session & user data |
| **Klaviyo Integration** | ✅ Built | OAuth, email performance |
| **Budget Simulator** | ✅ Built | Auto-optimize ad allocation |
| **GDPR Compliance** | ✅ Built | Webhook handlers for data requests |
| **Security (AES-256)** | ✅ Built | Encrypted credentials at rest |
| **Rate Limiting** | ✅ Built | 100 req/15min per IP |
| **CSV Export** | ✅ Built | Channel data download |
| **AI Chat Assistant** | ✅ Built | Multi-provider (OpenAI, Anthropic, Ollama) |

---

**Last Updated**: February 2025

Made with ❤️ by the Slay Season team. Empowering DTC brands with data-driven insights.
