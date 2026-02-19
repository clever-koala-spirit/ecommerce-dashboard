# Competitive Analysis — Slay Season vs Ecommerce Analytics Competitors
**Date:** 2026-02-19

## Competitors Analyzed

### 1. BeProfit ($49-99/mo)
- **USP:** Real-time P&L dashboard, expense tracking, automated email reports
- **Key Features:** Profit & Loss views by product/channel/time, COGS tracking, shipping cost breakdown, predefined report templates
- **KPIs:** Revenue, COGS, Gross Profit, Net Profit, Gross Margin, Net Margin, AOV, refunds

### 2. Triple Whale ($100-600/mo)
- **USP:** "Operating system for eCommerce" — attribution pixel + analytics
- **Key Features:** Custom tracking pixel (Triple Pixel), 6 attribution models, journey mapping, real-time dashboard, AI-powered Moby agent
- **KPIs:** Revenue, ROAS, CAC, ad performance, MER, attribution by touchpoint, creative performance

### 3. Northbeam (Enterprise pricing)
- **USP:** Multi-touch attribution with machine learning
- **Key Features:** Cross-channel attribution, incrementality testing, media mix modeling
- **KPIs:** Attributed revenue, incremental ROAS, channel contribution

### 4. Lifetimely ($34-199/mo)
- **USP:** Customer LTV + cohort analysis
- **Key Features:** LTV by segment/channel, cohort retention tables, predictive LTV with AI, product journey analysis, P&L dashboard
- **KPIs:** LTV, CAC, LTV:CAC ratio, cohort revenue, retention rate, repeat purchase rate, profit by segment

### 5. TrueProfit ($25-100/mo)
- **USP:** Real-time net profit tracking
- **Key Features:** Live profit dashboard, order-level profit, product profit analytics, ad spend auto-sync
- **KPIs:** Net Profit (real-time), profit per order, profit margin, COGS, shipping costs, ad spend

### 6. OrderMetrics (now Conjura)
- **USP:** Profit analytics with blended metrics
- **Key Features:** Automated cost tracking, contribution margin, marketing efficiency
- **KPIs:** Contribution margin, blended CAC, MER, profit per order

### 7. Polar Analytics ($200-1000/mo)
- **USP:** 45+ data source integrations, custom BI
- **Key Features:** Multi-channel unified dashboard, custom report builder, goal tracking, cohort analysis, merchandising analytics
- **KPIs:** CAC, LTV, ROAS, MER, blended metrics, inventory analytics, cohort retention

## Gap Analysis — What Slay Season Was Missing

| Feature | BeProfit | Triple Whale | Lifetimely | TrueProfit | Polar | **Slay Season (Before)** | **Slay Season (After)** |
|---------|---------|-------------|-----------|-----------|-------|------------------------|------------------------|
| P&L Page | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| Marketing Dashboard | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ |
| LTV/Cohort Page | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ |
| 6+ KPIs on main dash | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ (4) | ✅ (6) |
| Net Profit visible | ✅ | ✅ | ✅ | ✅ | ✅ | Hidden | ✅ Primary |
| ROAS visible | ✅ | ✅ | ❌ | ❌ | ✅ | Hidden | ✅ Primary |
| Per-channel ad table | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ |
| MER metric | ❌ | ✅ | ❌ | ❌ | ✅ | In efficiency chart | ✅ Marketing page |
| Cohort table | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ |
| Cost pie chart | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ |

## Improvements Implemented

### 1. Expanded KPI Row (Dashboard)
- Changed from 4 metrics (Revenue, Orders, AOV, Refunds) to 6 metrics
- Now shows: **Gross Revenue, Net Profit, Blended ROAS, Total Ad Spend, Total Orders, AOV**
- Matches competitor pattern of showing profit/ad metrics prominently

### 2. Profit & Loss Page (`/profit-loss`)
- Full P&L waterfall breakdown: Revenue → Refunds → COGS → Gross Profit → Ad Spend → Fixed Costs → Net Profit
- Summary cards with Gross Revenue, Gross Profit, Total Expenses, Net Profit
- Daily Revenue vs Profit bar chart
- Cost breakdown donut/pie chart (COGS, Meta, Google, Fixed, Refunds)
- Period-over-period comparison deltas

### 3. Marketing Performance Page (`/marketing`)
- 6 KPI cards: Total Ad Spend, Ad Revenue, Blended ROAS, MER, Blended CAC, CTR
- Daily ad spend by channel (stacked area chart)
- Daily ROAS by channel (line chart)
- Channel comparison table with Spend, Revenue, ROAS, Clicks, Impressions, CTR, CPC

### 4. LTV & Cohort Analysis Page (`/ltv`)
- 6 KPI cards: Est. LTV, CAC, LTV:CAC ratio, Repeat Rate, AOV, Revenue/Customer
- New vs Returning customers stacked bar chart
- Revenue per customer trend line
- Monthly cohort table with New, Returning, Revenue, Orders, Rev/Customer, Repeat Rate

## Remaining Gaps (Future Work)
1. **Attribution pixel** — Triple Whale's core advantage (requires significant backend work)
2. **Predictive LTV** — Lifetimely uses AI to predict future LTV (needs ML model)
3. **Creative/ad-level analytics** — Triple Whale shows per-ad ROAS (needs deeper Meta/Google API)
4. **Inventory analytics** — Polar tracks inventory levels and sell-through
5. **Custom report builder** — Polar's drag-and-drop BI (significant feature)
6. **Goal tracking** — Polar allows setting KPI targets and tracking progress
7. **Mobile app** — Triple Whale has a mobile app
8. **Automated email reports** — BeProfit sends scheduled P&L summaries
