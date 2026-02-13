# Ecommerce Command Center Dashboard

A live, production-grade ecommerce analytics dashboard with AI-powered forecasting, multi-channel data integration, and an AI chat assistant. Built with React 19, Vite 7, Express 5, and Tailwind CSS 4.

![Status](https://img.shields.io/badge/status-active%20development-yellow)
![React](https://img.shields.io/badge/React-19-blue)
![Vite](https://img.shields.io/badge/Vite-7-purple)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Quick Start

```bash
git clone https://github.com/YOUR_USERNAME/ecommerce-dashboard.git
cd ecommerce-dashboard
cp .env.example .env
./start.sh
# Open http://localhost:3000 (or whichever port Vite reports)
```

The app runs with **mock data out of the box** — no API keys needed to explore.

---

## Project Vision & Goals

Build a **Triple Whale / Northbeam-class** analytics command center for DTC ecommerce brands that:

- Aggregates data from Shopify, Meta Ads, Google Ads, Klaviyo, and GA4 into one view
- Provides real-time KPI tracking (Revenue, Profit, ROAS, CAC, Margin)
- Runs AI-powered forecasting with multiple algorithms (Holt-Winters, exponential smoothing, linear regression)
- Offers budget optimization with diminishing returns modeling
- Includes an AI chat assistant ("Ask Your Data Anything") powered by OpenAI, Anthropic, or Ollama
- Features a sandboxed code editor for custom analytics scripts
- Works entirely offline with client-side forecasting (no ML backend required)

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  React 19 + Vite 7              │
│  ┌─────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │Dashboard │ │ Forecast │ │    Settings      │ │
│  │  Page    │ │   Page   │ │ (Connections/AI) │ │
│  └────┬─────┘ └────┬─────┘ └────────┬─────────┘ │
│       │             │                │           │
│  ┌────┴─────────────┴────────────────┴─────────┐ │
│  │          Zustand Store (7 slices)           │ │
│  │  filter | data | forecast | connection      │ │
│  │  cost   | insight | ui                      │ │
│  └────┬────────────────────────────────────────┘ │
│       │                                          │
│  ┌────┴────────────────────────────────────────┐ │
│  │  API Service Layer (mock fallback built-in) │ │
│  └────┬────────────────────────────────────────┘ │
└───────┼──────────────────────────────────────────┘
        │ HTTP
┌───────┼──────────────────────────────────────────┐
│       ▼     Express 5 (BFF Server)               │
│  ┌─────────────────────────────────────────────┐ │
│  │ Routes: /connections, /data, /ai, /forecast │ │
│  ├─────────────────────────────────────────────┤ │
│  │ Services: Shopify, Meta, Google, Klaviyo,   │ │
│  │           GA4, AI Chat, AI Context          │ │
│  ├─────────────────────────────────────────────┤ │
│  │ Middleware: Cache (5min TTL), Rate Limiter  │ │
│  ├─────────────────────────────────────────────┤ │
│  │ Database: sql.js (WASM SQLite) + Cron Jobs  │ │
│  └─────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 19, Vite 7 | UI framework & build tool |
| Styling | Tailwind CSS 4 | Utility-first CSS with dark theme |
| State | Zustand 5 | Lightweight state management (7 slices) |
| Charts | Recharts 3 | All data visualizations |
| Data Fetching | TanStack React Query 5 | API caching & sync |
| Backend | Express 5 | BFF (Backend-For-Frontend) API |
| Database | sql.js (WASM) | Client-side SQLite, no native deps |
| Forecasting | Custom JS | Holt-Winters, exponential smoothing, regression |
| AI Chat | Multi-provider | OpenAI / Anthropic / Ollama (BYOK) |

---

## Features Built

### Dashboard Page
- **6 KPI Cards** with sparklines and period-over-period comparison: Gross Revenue, Net Profit, Blended ROAS, Total Ad Spend, Blended CAC, Net Margin %
- **Revenue Waterfall** chart (Gross → Net Profit breakdown)
- **Channel Performance Table** with sorting and CSV export
- **Revenue by Channel** donut chart
- **Paid Ads Chart** — dual-axis line chart with Meta/Google toggle
- **Klaviyo Chart** — stacked bar + email flow performance
- **Cost Breakdown** — stacked area + pie chart
- **Efficiency Charts** — MER, LTV:CAC, Contribution Margin

### Forecast Page
- **Revenue Forecast** with 7/14/30/60/90-day horizons and confidence bands
- **Channel Forecast** — per-channel projections for Meta, Google, Klaviyo, Organic
- **Budget Simulator** — interactive sliders with auto-optimize for profit-maximizing allocation
- **Profit Forecast** — 3-scenario (Conservative/Expected/Optimistic) P&L + 60-day cash flow
- **Goal Tracker** — monthly targets with probability of hitting
- **Insights Engine** — 8 automated insight types with severity levels

### Settings Page
- **Connection Cards** for all 5 platforms with test/sync controls
- **AI Configuration** — provider selection, API key entry, model choice
- **Cost Manager** — CRUD for fixed business costs

### AI & Editor
- **AI Chat Panel** — slide-out panel with data context injection, wired to multi-provider backend
- **Code Editor** — tabbed interface with 5 template scripts, sandboxed execution, custom widget output

### Navigation & Layout
- **Top Nav** with Dashboard / Forecast / Settings tabs
- **Filter Bar** with date range chips, comparison toggle, channel multi-select, customer type filter, saved views
- **Dark Theme** with CSS custom properties and glass-morphism design
- **Right Sidebar** for AI insights

---

## Project Structure

```
ecommerce-dashboard/
├── client/                          # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ai/                  # AI chat panel
│   │   │   ├── charts/              # 7 chart components
│   │   │   ├── common/              # ExportButton, SkeletonCard
│   │   │   ├── connections/         # Platform connection cards
│   │   │   ├── costs/               # Fixed cost manager
│   │   │   ├── editor/              # Code editor + custom widgets
│   │   │   ├── forecast/            # 6 forecast components
│   │   │   ├── kpi/                 # KPI cards and row
│   │   │   └── layout/              # DashboardLayout, TopNav, FilterBar, Sidebar
│   │   ├── hooks/                   # useLiveData custom hook
│   │   ├── mock/                    # 365-day mock data generator
│   │   ├── pages/                   # Dashboard, Forecast, Settings
│   │   ├── services/                # API wrapper with mock fallback
│   │   ├── store/                   # Zustand store + 7 slices
│   │   └── utils/                   # formatters, colors, forecast, budgetOptimizer
│   ├── vite.config.js
│   └── package.json
│
├── server/                          # Express backend
│   ├── cron/                        # Daily metric snapshot jobs
│   ├── db/                          # sql.js database setup
│   ├── middleware/                   # Cache (node-cache) + Rate limiter
│   ├── mock/                        # Server-side mock data
│   ├── routes/                      # connections, data, ai
│   ├── services/                    # Shopify, Meta, Google, Klaviyo, GA4, AI
│   ├── index.js                     # Server entry point
│   └── package.json
│
├── .env.example                     # Environment variables template
├── start.sh                         # One-click start script
├── package.json                     # Root: combined dev scripts
├── API_INTEGRATION_GUIDE.md         # Detailed API connection docs
├── BUILD_SUMMARY.md                 # Technical build summary
├── FORECASTING_SYSTEM.md            # Forecasting algorithms deep-dive
├── IMPLEMENTATION_SUMMARY.md        # Implementation details
└── QUICK_START.md                   # Forecasting quick start guide
```

**Stats:** ~70 source files, ~16,000 lines of code

---

## Development History

### Phase 0 — Research & Planning
- Competitive analysis of Triple Whale, Northbeam, Polar Analytics, Lifetimely, BeProfit
- API documentation research for all 5 platforms (Shopify Admin, Meta Marketing, Google Ads, Klaviyo, GA4)
- Forecasting methods comparison (Holt-Winters vs ARIMA vs Prophet vs custom)
- 9 architecture decisions documented
- 25-task project plan across 5 phases

### Phase 1 — Core Dashboard
- Project scaffolding (React 19 + Vite 7 + Tailwind CSS 4)
- Layout system with TopNav, FilterBar, Sidebar
- Mock data layer generating 365 days of realistic ecommerce data with seasonal patterns
- Zustand store with 7 slices and persistence
- 6 KPI cards with sparklines and delta comparison
- 7 chart components using Recharts

### Phase 2 — Backend & API Layer
- Express 5 server with 11 API endpoints
- Service layer for all 5 platforms (Shopify, Meta, Google, Klaviyo, GA4)
- sql.js (WASM SQLite) database — no native compilation needed
- Caching middleware (5-min TTL) and per-platform rate limiting with exponential backoff
- Cron jobs for daily metric snapshots
- Mock data fallback when no API credentials configured

### Phase 3 — Forecasting Engine
- 4 forecasting algorithms in pure JavaScript (no ML backend)
- Auto-algorithm selection based on data characteristics
- Seasonality detection via autocorrelation
- Confidence intervals with dynamic widening
- Budget optimizer with diminishing returns modeling
- 6 forecast UI components

### Phase 4 — AI & Code Editor
- Multi-provider AI chat (OpenAI, Anthropic, Ollama) using native fetch
- Data context injection — AI sees your dashboard metrics
- Sandboxed code editor with 5 template scripts
- Custom widget rendering from user code

### Phase 5 — QA & Bug Fixes
10 bugs found and fixed during overnight QA:
1. Server mock data self-reference crash (arrays built separately)
2. React hooks violation in KPIRow (hooks moved to component level)
3. FilterBar setDateRange wrong parameter shape
4. FilterBar channel name case mismatch (shopify vs Shopify)
5. FilterBar customer type case mismatch
6. KPIRow isLoading defensive checks added
7. CostManager addCost signature mismatch
8. SettingsPage unused imports removed
9. InsightsEngine template literal syntax errors (2 instances)
10. App.jsx/main.jsx duplicate providers removed

Additional fixes:
- Server error handler moved after routes (Express requirement)
- Broken /ai nav link removed (AI chat is a panel, not a page)
- CSS border syntax fix in TopNav
- Loading state variable renamed for clarity

---

## Connecting Real APIs

The dashboard runs with mock data by default. To connect real platforms, copy `.env.example` to `.env` and fill in your credentials:

```env
# Shopify
SHOPIFY_STORE=your-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=shpat_xxxxx

# Meta (Facebook) Ads
META_ACCESS_TOKEN=EAA...
META_AD_ACCOUNT_ID=act_123456

# Google Ads
GOOGLE_ADS_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_ADS_CLIENT_SECRET=xxx
GOOGLE_ADS_REFRESH_TOKEN=xxx
GOOGLE_ADS_CUSTOMER_ID=123-456-7890

# Klaviyo
KLAVIYO_API_KEY=pk_xxx

# GA4
GA4_PROPERTY_ID=properties/123456
GA4_CLIENT_EMAIL=xxx@xxx.iam.gserviceaccount.com
GA4_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."

# AI Chat (pick one)
OPENAI_API_KEY=sk-xxx
# ANTHROPIC_API_KEY=sk-ant-xxx
# OLLAMA_BASE_URL=http://localhost:11434
```

See `API_INTEGRATION_GUIDE.md` for detailed setup instructions per platform.

---

## Current Status

| Component | Status |
|-----------|--------|
| Dashboard UI & Charts | ✅ Built |
| Forecast Engine | ✅ Built |
| Backend API | ✅ Built |
| Mock Data | ✅ Working |
| Build | ✅ Passes clean |
| Server Startup | ✅ All 11 endpoints |
| Real API Connections | ⏳ Needs credentials |
| AI Chat | ⏳ Needs LLM API key |
| Visual QA | 🔄 In progress |
| Mobile Responsive | ⏳ Pending |

---

## Roadmap

- [ ] Visual QA pass — fix any rendering/layout issues
- [ ] Connect real Shopify/Meta/Google/Klaviyo/GA4 APIs
- [ ] Configure AI chat with preferred LLM provider
- [ ] Mobile responsive layout improvements
- [ ] Code splitting for bundle size optimization
- [ ] End-to-end testing with Playwright
- [ ] Deploy to Vercel (frontend) + Railway (backend)

---

## License

MIT

---

*Built by Leo with AI assistance. Last updated: February 2025.*
