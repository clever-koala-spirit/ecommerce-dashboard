# Product Requirements Document (PRD)
# Ecommerce Command Center Dashboard

**Version:** 1.0
**Author:** Leo
**Last Updated:** February 2025
**Status:** Active Development

---

## 1. Executive Summary

The Ecommerce Command Center is a unified analytics dashboard designed for DTC (Direct-to-Consumer) ecommerce brands. It consolidates data from five major platforms — Shopify, Meta Ads, Google Ads, Klaviyo, and Google Analytics 4 — into a single, real-time interface. The product includes AI-powered forecasting, budget optimization, an AI chat assistant, and a custom code editor, enabling merchants to make data-driven decisions without switching between multiple tools.

### Problem Statement

Ecommerce operators currently juggle 5-10 separate platforms daily to understand their business performance. This fragmentation leads to delayed decisions, missed optimization opportunities, and an inability to see the full picture of customer acquisition costs, true profitability, and channel attribution. Existing solutions like Triple Whale ($300-$2,000/mo) and Northbeam ($1,000+/mo) are expensive and often lack customization.

### Solution

A self-hosted, open-source command center that provides enterprise-grade analytics at zero subscription cost, with full data ownership and extensibility through a built-in code editor.

---

## 2. Target Users

### Primary Persona: DTC Brand Operator
- Runs a Shopify-based ecommerce business ($500K-$50M annual revenue)
- Manages paid advertising across Meta and Google
- Uses Klaviyo for email/SMS marketing
- Needs daily visibility into profitability, not just revenue
- Makes budget allocation decisions weekly or bi-weekly

### Secondary Persona: Ecommerce Agency
- Manages multiple client accounts
- Needs white-label dashboards
- Requires quick cross-client performance comparison
- Values automation and AI-powered insights

### Tertiary Persona: Data-Savvy Founder
- Wants to write custom queries and scripts
- Needs raw data access alongside visualizations
- Values the code editor and API extensibility

---

## 3. Product Goals & Success Metrics

### Goals
1. Reduce time-to-insight from 30+ minutes (multi-platform login) to under 60 seconds
2. Provide true profitability metrics (not just revenue) by incorporating COGS, shipping, fees, and fixed costs
3. Enable data-driven budget allocation through AI forecasting and optimization
4. Democratize analytics customization through the built-in code editor

### Success Metrics (KPIs)
| Metric | Target | Measurement |
|--------|--------|-------------|
| Daily active usage | 5+ sessions/week per user | Session tracking |
| Time to first insight | < 60 seconds from login | Page load + interaction timing |
| Forecast accuracy (MAPE) | < 20% on 30-day horizon | Backtesting against actuals |
| Budget optimization lift | 10-15% improvement in blended ROAS | A/B comparison with manual allocation |
| AI chat engagement | 3+ queries per session | Chat interaction logging |

---

## 4. Feature Requirements

### 4.1 Dashboard — Real-Time KPI Overview

**Priority:** P0 (Must Have)
**Status:** ✅ Built

#### 4.1.1 KPI Cards Row
Display 6 primary KPIs with real-time data:

| KPI | Formula | Source |
|-----|---------|--------|
| Gross Revenue | Sum of all order totals | Shopify |
| Net Profit | Revenue - COGS - Shipping - Fees - Ad Spend - Fixed Costs | Shopify + Meta + Google |
| Blended ROAS | (Meta Revenue + Google Revenue) / Total Ad Spend | Meta + Google |
| Total Ad Spend | Meta Spend + Google Spend | Meta + Google |
| Blended CAC | Total Ad Spend / New Customers | Meta + Google + Shopify |
| Net Margin % | Net Profit / Gross Revenue × 100 | Calculated |

Each card must include:
- Current period value with appropriate formatting (currency, ratio, percentage)
- Period-over-period delta (% change vs previous period) with green/red indicator
- Sparkline chart showing daily trend over selected date range
- Loading skeleton state during data fetch
- Tooltip with detailed breakdown on hover

#### 4.1.2 Revenue Waterfall Chart
Waterfall visualization showing the journey from Gross Revenue to Net Profit:
- Bars: Gross Revenue → Refunds → COGS → Shipping → Transaction Fees → Ad Spend → Fixed Costs → Net Profit
- Color coding: green for additions, red for deductions, blue for totals
- Hover tooltips with exact amounts and percentages

#### 4.1.3 Channel Performance Table
Sortable, exportable table with columns:
- Channel name (Shopify Organic, Meta, Google, Klaviyo, Direct)
- Revenue, Orders, AOV, Ad Spend, ROAS, CPA, Profit, Margin %
- Sort by any column ascending/descending
- CSV export button
- Conditional formatting (red/green) for performance indicators

#### 4.1.4 Revenue by Channel (Donut Chart)
- Proportional donut showing revenue contribution by channel
- Interactive segments with hover details
- Center text showing total revenue
- Legend with channel colors

#### 4.1.5 Paid Ads Performance Chart
- Dual-axis line chart: Spend (left axis) vs ROAS (right axis) over time
- Platform toggle: Meta only / Google only / Combined
- Date range synced with global filter
- Trend line overlay option

#### 4.1.6 Klaviyo Performance Chart
- Stacked bar chart: Revenue from Flows vs Campaigns vs Automations
- Email flow performance table: Flow name, Sent, Opens, Clicks, Revenue, RPR
- Open rate and click rate trend lines

#### 4.1.7 Cost Breakdown Charts
- Stacked area chart showing cost categories over time (COGS, Shipping, Ads, Fixed)
- Pie chart showing proportional cost breakdown for selected period
- Total cost summary with period comparison

#### 4.1.8 Efficiency Metrics Charts
- MER (Marketing Efficiency Ratio): Total Revenue / Total Marketing Spend
- LTV:CAC Ratio trend line with 3:1 benchmark indicator
- Contribution Margin trend with target line

---

### 4.2 Filter System

**Priority:** P0 (Must Have)
**Status:** ✅ Built

#### Requirements:
- **Date Range Presets:** Today, Yesterday, Last 7 Days, Last 14 Days, Last 30 Days, Last 90 Days, This Month, Last Month, Year to Date, Custom Range
- **Comparison Toggle:** Enable/disable period-over-period comparison
- **Channel Filter:** Multi-select for Shopify, Meta, Google, Klaviyo, GA4
- **Customer Type:** All, New Customers, Returning Customers
- **Saved Views:** Save and load custom filter combinations
- All filters must apply globally across all dashboard components
- URL state persistence (filters survive page refresh)

---

### 4.3 Forecasting Engine

**Priority:** P0 (Must Have)
**Status:** ✅ Built

#### 4.3.1 Revenue Forecast
- Selectable horizons: 7, 14, 30, 60, 90 days
- Multiple algorithms with auto-selection:
  - Holt-Winters (for seasonal data, 60+ days history)
  - Double Exponential Smoothing (for trend data, 14+ days)
  - Simple Exponential Smoothing (baseline)
  - Linear Regression (fallback for minimal data)
- 95% confidence interval displayed as shaded band
- Accuracy metrics: MAPE, RMSE, MAE (backtested on last 20% of data)
- Visual: actual data (solid line) + forecast (dashed line) + confidence band

#### 4.3.2 Channel-Level Forecast
- Independent forecasts for Meta, Google, Klaviyo, Organic
- Toggle channel visibility on/off
- 30-day default projection per channel
- Comparative analysis across channels

#### 4.3.3 Budget Simulator
- Interactive sliders for each paid channel's monthly budget
- Real-time projection updates as sliders move
- "Auto-Optimize" button: gradient-based search for profit-maximizing allocation
- Diminishing returns modeling per channel
- Projected ROAS, Revenue, and Profit for each allocation scenario
- Breakeven analysis per channel

#### 4.3.4 Profit Forecast (Scenario Analysis)
- Three scenarios: Conservative (P10), Expected (P50), Optimistic (P90)
- P&L table: Revenue, COGS, Shipping, Fees, Ad Spend, Fixed Costs, Net Profit
- 60-day cash flow chart for each scenario
- Scenario comparison side-by-side

#### 4.3.5 Goal Tracker
- Set monthly revenue and profit targets
- Progress bar showing current vs target
- Probability percentage of hitting each target (based on forecast)
- Days remaining indicator
- Trend arrow (on track / at risk / behind)

#### 4.3.6 Automated Insights Engine
8 insight types with severity levels (info, warning, critical, success):
1. Revenue anomaly detection (sudden spikes/drops)
2. Ad spend efficiency alerts (ROAS below threshold)
3. Channel performance comparison (winner/loser)
4. Seasonal pattern notifications
5. Budget pacing alerts (over/under spending)
6. Customer acquisition trend changes
7. Profit margin warnings
8. Forecast accuracy degradation alerts

Each insight includes: title, description, severity, recommended action, dismiss/snooze/bookmark controls.

---

### 4.4 Data Connections

**Priority:** P0 (Must Have)
**Status:** ✅ Built (Backend ready, awaiting credentials)

#### 4.4.1 Shopify Integration
- **API:** Shopify Admin REST API (2024-01)
- **Data pulled:** Orders, customers, products, refunds, inventory
- **Metrics derived:** Revenue, AOV, order count, new vs returning customers, COGS, refund rate
- **Sync frequency:** Every 15 minutes (configurable)
- **Auth:** Private app access token

#### 4.4.2 Meta (Facebook) Ads Integration
- **API:** Meta Marketing API v18.0
- **Data pulled:** Campaigns, ad sets, ads, spend, impressions, clicks, conversions, ROAS
- **Metrics derived:** Spend, CPA, ROAS, CTR, CPM, frequency
- **Sync frequency:** Every 30 minutes
- **Auth:** Long-lived access token + Ad Account ID

#### 4.4.3 Google Ads Integration
- **API:** Google Ads API v15
- **Data pulled:** Campaigns, spend, conversions, conversion value, clicks, impressions
- **Metrics derived:** Spend, CPA, ROAS, CTR, CPC, conversion rate
- **Sync frequency:** Every 30 minutes
- **Auth:** OAuth 2.0 (Client ID, Secret, Refresh Token, Customer ID)

#### 4.4.4 Klaviyo Integration
- **API:** Klaviyo API v2024-02-15
- **Data pulled:** Campaigns, flows, metrics (revenue, opens, clicks, bounces)
- **Metrics derived:** Email revenue, RPR (Revenue per Recipient), open rate, click rate, flow performance
- **Sync frequency:** Every 60 minutes
- **Auth:** Private API key

#### 4.4.5 Google Analytics 4 Integration
- **API:** GA4 Data API v1
- **Data pulled:** Sessions, users, bounce rate, session duration, source/medium, events
- **Metrics derived:** Traffic by source, conversion rate, session quality, user behavior
- **Sync frequency:** Every 60 minutes
- **Auth:** Service account (Client Email + Private Key + Property ID)

#### Connection Management UI
- Per-platform connection cards with status indicators (connected/disconnected/error)
- Test connection button (validates credentials without full sync)
- Manual sync trigger
- Last sync timestamp and next sync ETA
- Error messages with troubleshooting guidance

---

### 4.5 AI Chat Assistant ("Ask Your Data Anything")

**Priority:** P1 (Should Have)
**Status:** ✅ Built (Backend ready, needs LLM API key)

#### Requirements:
- Slide-out chat panel from right side of screen
- BYOK (Bring Your Own Key) model: user provides their own API key
- Multi-provider support: OpenAI (GPT-4/4o), Anthropic (Claude), Ollama (local)
- Data context injection: AI receives current dashboard metrics, date range, and trends
- Natural language queries: "Why did ROAS drop last week?", "What's my best performing channel?", "Should I increase Meta spend?"
- Conversation history within session
- Provider/model selection in settings
- Streaming responses for real-time feel

#### Example Queries:
| Query | Expected Behavior |
|-------|-------------------|
| "What's my CAC trend?" | Pulls CAC data, describes trend, suggests optimizations |
| "Compare Meta vs Google performance" | Side-by-side analysis of key metrics |
| "Predict next month's revenue" | Runs forecast, presents with confidence interval |
| "Where should I cut costs?" | Analyzes cost breakdown, identifies opportunities |

---

### 4.6 Custom Code Editor

**Priority:** P2 (Nice to Have)
**Status:** ✅ Built

#### Requirements:
- Tabbed interface with multiple open scripts
- 5 pre-loaded template scripts:
  1. Custom KPI Calculator
  2. Channel Comparison Script
  3. Date Range Analysis
  4. Custom Chart Generator
  5. Data Export Script
- Sandboxed execution environment (no access to window/document)
- Exposed dashboard APIs: `getMetrics()`, `getDateRange()`, `getChannelData()`
- Output rendering: text results, Recharts components, or data tables
- Custom widget injection: code output renders as a dashboard widget

---

### 4.7 Settings & Configuration

**Priority:** P0 (Must Have)
**Status:** ✅ Built

#### Requirements:
- **Connections Panel:** Grid of all 5 platform cards with connect/test/sync controls
- **AI Configuration:** Provider dropdown, API key input, model selection, test connection
- **Cost Manager:** CRUD interface for fixed business costs (rent, salaries, software, etc.)
  - Fields: label, monthly amount, category, active toggle
  - Costs factor into net profit calculations across all views
- **Theme Toggle:** Dark/light mode with system preference detection

---

## 5. Technical Requirements

### 5.1 Performance
| Metric | Requirement |
|--------|-------------|
| Initial page load | < 3 seconds |
| KPI card render | < 500ms |
| Chart render | < 1 second |
| Forecast computation | < 200ms |
| API response (cached) | < 50ms |
| API response (fresh) | < 2 seconds |
| Build size (gzipped) | < 300KB JS |

### 5.2 Browser Support
- Chrome 90+ (primary)
- Firefox 90+
- Safari 15+
- Edge 90+
- Mobile Safari / Chrome (responsive, not native)

### 5.3 Data Requirements
- Minimum 30 days of historical data for basic forecasting
- 90+ days recommended for seasonal detection
- 365 days for optimal accuracy
- Mock data layer provides 365 days out of the box for development/demo

### 5.4 Security
- All API keys stored server-side in environment variables, never exposed to client
- CORS restricted to localhost origins
- Rate limiting per platform to avoid API throttling
- No data leaves the user's infrastructure (self-hosted)
- BYOK for AI: user's own API key, no data sent to third parties without consent

### 5.5 Database
- sql.js (WASM-based SQLite) — no native compilation required
- Tables: metric_snapshots, sync_log, forecast_accuracy, fixed_costs, credentials
- Daily snapshots via cron job for historical trend tracking

---

## 6. Non-Functional Requirements

### 6.1 Scalability
- Client-side rendering handles up to 365 days × 5 sources without performance degradation
- Server-side caching (5-min TTL) prevents redundant API calls
- Rate limiter with exponential backoff prevents platform API throttling
- Database snapshots enable long-term trend analysis without re-fetching

### 6.2 Reliability
- Mock data fallback: if backend is unreachable, client operates with demo data
- Graceful error handling: failed API connections show status, don't crash the app
- Auto-retry with backoff on transient failures

### 6.3 Maintainability
- Modular architecture: 7 Zustand slices, separate service files per platform
- ESM modules throughout (both server and client)
- Component-per-feature folder structure
- Comprehensive documentation (5 markdown guides)

### 6.4 Extensibility
- Code editor allows user-written analytics scripts
- Custom widget system: inject computed visualizations into dashboard
- Plugin-ready architecture: new data sources can be added by creating a service file + route

---

## 7. User Interface Design

### 7.1 Design Principles
- **Dark-first:** Optimized for extended screen time
- **Glass-morphism:** Translucent card backgrounds with blur effects
- **Information density:** Maximum data per viewport without clutter
- **Progressive disclosure:** Summary KPIs visible immediately, details on interaction

### 7.2 Layout Structure
```
┌──────────────────────────────────────────────┐
│                  Top Nav Bar                 │
│  Logo | Dashboard | Forecast | Settings | ⚙️ │
├──────────────────────────────────────────────┤
│              Filter Bar                      │
│  Date Range | Compare | Channels | Customer  │
├─────────────────────────────────┬────────────┤
│                                 │            │
│        Main Content Area        │  Sidebar   │
│   (KPIs, Charts, Forecasts)     │ (Insights) │
│                                 │            │
│                                 │            │
└─────────────────────────────────┴────────────┘
                                    ┌──────────┐
                                    │ AI Chat  │
                                    │  Panel   │
                                    │ (Slide)  │
                                    └──────────┘
```

### 7.3 Color Palette
- Background: `#0f1117` (dark), `#f8fafc` (light)
- Cards: `rgba(30, 32, 40, 0.6)` with `backdrop-filter: blur(12px)`
- Accent: `#6366f1` (Indigo)
- Success: `#10b981` (Green)
- Warning: `#f59e0b` (Amber)
- Error: `#ef4444` (Red)
- Channel colors: Shopify `#96bf48`, Meta `#1877f2`, Google `#ea4335`, Klaviyo `#4d4d4d`, GA4 `#f16428`

### 7.4 Typography
- Font family: System font stack (`-apple-system, BlinkMacSystemFont, 'Segoe UI', ...`)
- KPI values: 28px bold
- Card titles: 13px medium, secondary color
- Body text: 14px regular

---

## 8. Data Model

### 8.1 Shopify Daily Record
```
{
  date: "2025-01-15",
  revenue: 4523.50,
  orders: 47,
  newCustomers: 18,
  returningCustomers: 29,
  aov: 96.24,
  refundAmount: 125.00,
  cogs: 1356.75,
  shipping: 235.00,
  transactionFees: 135.70
}
```

### 8.2 Meta Ads Daily Record
```
{
  date: "2025-01-15",
  spend: 850.00,
  impressions: 125000,
  clicks: 2340,
  conversions: 23,
  revenue: 2185.00,
  ctr: 1.87,
  cpm: 6.80,
  cpc: 0.36,
  roas: 2.57
}
```

### 8.3 Google Ads Daily Record
```
{
  date: "2025-01-15",
  spend: 620.00,
  impressions: 89000,
  clicks: 1560,
  conversions: 15,
  conversionValue: 1425.00,
  ctr: 1.75,
  cpc: 0.40,
  roas: 2.30
}
```

### 8.4 Klaviyo Daily Record
```
{
  date: "2025-01-15",
  emailsSent: 5200,
  opens: 1820,
  clicks: 364,
  revenue: 890.00,
  unsubscribes: 12,
  bounces: 45,
  flowRevenue: 540.00,
  campaignRevenue: 350.00
}
```

### 8.5 GA4 Daily Record
```
{
  date: "2025-01-15",
  sessions: 3200,
  users: 2800,
  newUsers: 1400,
  bounceRate: 0.42,
  avgSessionDuration: 185,
  pageviews: 8900,
  organicSessions: 1200,
  paidSessions: 980,
  directSessions: 620,
  socialSessions: 400
}
```

### 8.6 Database Tables (SQLite)
```sql
-- Daily metric snapshots for trend analysis
CREATE TABLE metric_snapshots (
  id INTEGER PRIMARY KEY,
  date TEXT,
  source TEXT,           -- shopify, meta, google, klaviyo, ga4
  metric_name TEXT,
  metric_value REAL,
  created_at TEXT
);

-- API sync log
CREATE TABLE sync_log (
  id INTEGER PRIMARY KEY,
  source TEXT,
  status TEXT,           -- success, error
  records_synced INTEGER,
  duration_ms INTEGER,
  error_message TEXT,
  synced_at TEXT
);

-- Forecast accuracy tracking
CREATE TABLE forecast_accuracy (
  id INTEGER PRIMARY KEY,
  forecast_date TEXT,
  target_date TEXT,
  predicted_value REAL,
  actual_value REAL,
  method TEXT,
  created_at TEXT
);

-- User-configured fixed costs
CREATE TABLE fixed_costs (
  id INTEGER PRIMARY KEY,
  label TEXT,
  monthly_amount REAL,
  category TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT
);

-- Encrypted credentials storage
CREATE TABLE credentials (
  id INTEGER PRIMARY KEY,
  source TEXT UNIQUE,
  encrypted_data TEXT,
  created_at TEXT,
  updated_at TEXT
);
```

---

## 9. API Endpoints

### Backend API (Express, port 4000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |
| GET | `/api/connections` | List all platform connection statuses |
| POST | `/api/connections/:source/test` | Test a specific platform connection |
| POST | `/api/connections/:source/sync` | Trigger manual data sync |
| GET | `/api/data/dashboard` | Aggregated dashboard data (all sources) |
| GET | `/api/data/shopify/orders` | Shopify orders data |
| GET | `/api/data/meta/campaigns` | Meta ad campaigns data |
| GET | `/api/data/google/campaigns` | Google Ads campaigns data |
| GET | `/api/data/klaviyo/metrics` | Klaviyo email metrics |
| GET | `/api/data/ga4/traffic` | GA4 traffic data |
| POST | `/api/ai/chat` | Send message to AI assistant |
| GET | `/api/ai/config` | Get AI configuration |
| POST | `/api/ai/config` | Update AI configuration |
| POST | `/api/ai/test` | Test AI connection |
| POST | `/api/forecast` | Generate forecast (future: server-side) |

---

## 10. Development Phases

### Phase 0: Research & Planning ✅
- Competitive analysis (Triple Whale, Northbeam, Polar Analytics, Lifetimely, BeProfit)
- API documentation study for all 5 platforms
- Forecasting methods evaluation
- Architecture decisions (9 documented)
- Project plan (25 tasks)

### Phase 1: Core Dashboard ✅
- Project scaffolding and layout
- Mock data generation (365 days)
- State management (Zustand, 7 slices)
- KPI cards with sparklines
- 7 chart components

### Phase 2: Backend & API Layer ✅
- Express server with 11 endpoints
- Service layer for all platforms
- Database setup (sql.js)
- Caching and rate limiting
- Cron jobs for snapshots

### Phase 3: Forecasting Engine ✅
- 4 forecasting algorithms
- Budget optimizer
- 6 forecast UI components
- Insights engine

### Phase 4: AI & Extensions ✅
- Multi-provider AI chat
- Code editor with sandboxed execution
- Custom widget system

### Phase 5: QA & Polish 🔄
- 10 bugs found and fixed
- Build verification
- Server endpoint testing
- Visual QA in progress

### Phase 6: Production Readiness (Planned)
- Real API credential configuration
- Mobile responsive layout
- Code splitting for performance
- Error boundary implementation
- End-to-end testing (Playwright)
- Deployment (Vercel + Railway)

---

## 11. Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| API rate limiting | Data staleness | Medium | Server-side caching (5-min TTL) + rate limiter with backoff |
| Platform API changes | Breaking integrations | Medium | Version-pinned API calls, abstraction layer per service |
| Forecast inaccuracy | Bad business decisions | Medium | Multiple algorithms, backtesting, confidence intervals, accuracy display |
| Large dataset performance | Slow UI | Low | Client-side pagination, memoized computations, lazy loading |
| Security (API key exposure) | Credential theft | Low | Server-side storage only, CORS restrictions, env variables |

---

## 12. Competitive Landscape

| Feature | Our Dashboard | Triple Whale | Northbeam | Polar Analytics |
|---------|--------------|-------------|-----------|-----------------|
| Price | Free (self-hosted) | $300-$2,000/mo | $1,000+/mo | $300-$800/mo |
| Data ownership | Full (your server) | Cloud-hosted | Cloud-hosted | Cloud-hosted |
| AI chat | ✅ BYOK | ✅ Built-in | ❌ | ❌ |
| Code editor | ✅ | ❌ | ❌ | ❌ |
| Client-side forecasting | ✅ | ❌ (server) | ✅ (server) | ❌ |
| Custom widgets | ✅ | ❌ | ❌ | Limited |
| Open source | ✅ | ❌ | ❌ | ❌ |
| Shopify integration | ✅ | ✅ | ✅ | ✅ |
| Meta integration | ✅ | ✅ | ✅ | ✅ |
| Google Ads integration | ✅ | ✅ | ✅ | ✅ |
| Klaviyo integration | ✅ | ✅ | ❌ | ✅ |
| GA4 integration | ✅ | ✅ | ❌ | ✅ |

---

## 13. Glossary

| Term | Definition |
|------|-----------|
| AOV | Average Order Value — total revenue / number of orders |
| ROAS | Return on Ad Spend — revenue attributed to ads / ad spend |
| CAC | Customer Acquisition Cost — total marketing spend / new customers acquired |
| MER | Marketing Efficiency Ratio — total revenue / total marketing spend |
| LTV | Lifetime Value — predicted total revenue from a customer over their lifetime |
| COGS | Cost of Goods Sold — direct costs of producing goods sold |
| MAPE | Mean Absolute Percentage Error — forecast accuracy metric |
| BFF | Backend for Frontend — server pattern optimized for a specific frontend |
| BYOK | Bring Your Own Key — user provides their own API credentials |
| DTC | Direct to Consumer — selling directly without intermediaries |
| RPR | Revenue Per Recipient — email revenue divided by emails sent |

---

## 14. Appendices

### A. File Inventory
- 70 source files
- ~16,000 lines of code
- 5 documentation files (API guide, build summary, forecasting docs, implementation summary, quick start)

### B. Environment Variables
See `.env.example` for complete list of all configurable environment variables.

### C. Related Documents
- `API_INTEGRATION_GUIDE.md` — Detailed API setup per platform
- `FORECASTING_SYSTEM.md` — Deep-dive on forecasting algorithms
- `BUILD_SUMMARY.md` — Technical build details
- `IMPLEMENTATION_SUMMARY.md` — Implementation notes
- `QUICK_START.md` — Forecasting quick start

---

*Document maintained by Leo. For questions or contributions, open an issue on GitHub.*
