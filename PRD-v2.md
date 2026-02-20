# Slay Season v2 - Product Requirements Document

**Version:** 2.0  
**Date:** February 20, 2026  
**Author:** Product Team  
**Status:** Draft  

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Problem Statement](#problem-statement)
3. [Solution Overview](#solution-overview)
4. [Vision & Brand](#vision--brand)
5. [Core Product Features](#core-product-features)
6. [Technical Architecture](#technical-architecture)
7. [User Stories](#user-stories)
8. [Database Schema Changes](#database-schema-changes)
9. [API Specifications](#api-specifications)
10. [Design System](#design-system)
11. [Onboarding & Authentication](#onboarding--authentication)
12. [Notifications & Alerts](#notifications--alerts)
13. [Reporting Engine](#reporting-engine)
14. [Forecasting Engine](#forecasting-engine)
15. [Data Integration](#data-integration)
16. [Pricing & Monetization](#pricing--monetization)
17. [Competitive Analysis](#competitive-analysis)
18. [Phased Roadmap](#phased-roadmap)
19. [Risk Assessment](#risk-assessment)
20. [Success Metrics](#success-metrics)
21. [Appendices](#appendices)

---

## Executive Summary

Slay Season v2 represents a complete overhaul of our ecommerce analytics platform, transforming it from a functional dashboard into a delightful, Apple-inspired experience that makes data fun and actionable. The current platform serves as a proof of concept with real customer data flowing from Paintly Kits, but suffers from significant UX, personalization, and commercial readiness issues.

**The Challenge:**
- Current dark-themed, rigid dashboard feels like a tool, not a brand
- Limited multi-account support prevents scaling to enterprise clients
- Broken signup flow and lack of personalization hamper commercial success
- Data presentation is gimmicky rather than clear and actionable
- Missing critical forecasting capabilities and notification systems

**The Solution:**
Slay Season v2 introduces a revolutionary widget-based dashboard system inspired by Apple's design philosophy. Users can drag, drop, and resize widgets to create personalized command centers. The platform supports multiple accounts across all major ecommerce platforms, provides advanced forecasting with scenario planning, and delivers insights with personality through push notifications and AI-powered alerts.

**Key Differentiators:**
- Apple-level design quality with light theme default
- Fully customizable widget-based dashboards
- Multi-account support for enterprise clients
- Advanced forecasting with "what-if" scenarios
- Fun, personality-driven brand that entrepreneurs love
- Sub-5-minute time to value from signup to insights

**Business Impact:**
- Target market: DTC Shopify merchants with $1-10M revenue
- Projected 60% user retention at 30 days (vs. industry 35%)
- NPS target of 50+ through delightful UX
- Revenue model: $49-$399/month with 14-day free trial

---

## Problem Statement

### Current State Analysis

Slay Season v1 successfully proves market demand with real customer data flowing from Paintly Kits (~$30K/month revenue) across Shopify, Google Ads, and Meta Ads. However, critical gaps prevent commercial success:

#### 1. User Experience Problems
- **Dark Theme Dominance**: Default dark theme creates a technical, uninviting atmosphere
- **Rigid Layout**: Fixed dashboard prevents personalization and workflow optimization
- **Information Overload**: 11 static pages scatter information instead of centralizing insights
- **Poor Visual Hierarchy**: Data presentation lacks clarity and actionable priorities

#### 2. Technical Limitations
- **Single Account Restriction**: Cannot handle multiple Meta/Google accounts per user
- **Incomplete OAuth Flow**: Broken signup prevents new user acquisition
- **Limited Data Depth**: Backend reports lack comprehensiveness across platforms
- **No Real-time Updates**: Static data creates stale insights

#### 3. Commercial Readiness Gaps
- **Broken Onboarding**: Time to value exceeds 15 minutes, causing drop-off
- **No Notifications**: Users must manually check for important changes
- **Limited Forecasting**: Basic projections without scenario planning or confidence intervals
- **No Mobile Experience**: Desktop-only limits accessibility and engagement

#### 4. Brand Positioning Issues
- **Tool vs. Brand**: Feels functional rather than aspirational
- **No Personality**: Corporate copy lacks the energy of target market
- **Missing Achievement Systems**: No engagement hooks or user progression
- **Generic Design**: Doesn't stand out in crowded analytics space

### Market Opportunity

The ecommerce analytics market is fragmented between expensive enterprise solutions ($1000+/month) and basic reporting tools. Competitors like Triple Whale, BeProfit, and Lifetimely serve the mid-market but lack design sophistication and customization capabilities.

**Market Gap:**
- No solution combines Apple-level design with affordable pricing
- Missing widget customization in all existing platforms
- Limited multi-account enterprise features at accessible price points
- Forecasting capabilities are basic across the competitive landscape

---

## Solution Overview

Slay Season v2 transforms ecommerce analytics from a reporting tool into a delightful command center that entrepreneurs love to use daily. The solution centers on five core pillars:

### 1. **Widget-Based Dashboard Revolution**
Apple-inspired drag-and-drop interface where users build personalized command centers. Widget library includes revenue tracking, ROAS optimization, inventory alerts, and custom metrics. Multiple dashboard tabs support different roles (CMO View, Finance View, Daily Ops).

### 2. **Multi-Account Enterprise Ready**
Seamless connection and management of multiple Shopify stores, Google Ads accounts, Meta campaigns, and other platforms. Account picker during OAuth enables enterprise-level account management with proper data segregation.

### 3. **Advanced Forecasting & Scenarios**
Revenue forecasting with adjustable confidence intervals, scenario planning ("what if I increase ad spend 20%?"), budget optimization recommendations, and goal tracking with progress visualization.

### 4. **Intelligent Notifications**
Push notifications for mobile/web/Apple Watch, AI-powered anomaly detection, configurable alerts for KPI thresholds, and daily/weekly digest emails with actionable insights.

### 5. **Delightful Brand Experience**
Light theme default with Apple-inspired design, personality-driven copy and insights, achievement system for user engagement, and micro-interactions that make data exploration joyful.

### Core Value Propositions

**For Entrepreneurs:**
- "See everything in one place" - Unified dashboard across all platforms
- "Know what's working" - Clear ROAS and attribution insights
- "Plan with confidence" - Advanced forecasting and scenario planning
- "Never miss a beat" - Smart alerts and notifications

**For Agencies:**
- "Manage all clients" - Multi-account dashboard views
- "Professional reports" - White-label PDF exports
- "Scale efficiently" - Template dashboards for quick client setup

**For Finance Teams:**
- "Real-time P&L" - Live profitability tracking
- "Cash flow planning" - Revenue and expense forecasting
- "Budget optimization" - AI-recommended channel allocation

---

## Vision & Brand

### Brand Essence
**"We feel the pain of ecommerce data. We make it fun."**

Slay Season transforms the overwhelming complexity of ecommerce analytics into a delightful, empowering experience. We don't just report data—we celebrate wins, alert to opportunities, and guide strategic decisions with personality and intelligence.

### Brand Personality
- **Confident but not cocky**: "Your ROAS is crushing it 🔥" not "Revenue: $12,345"
- **Smart but accessible**: Complex insights explained simply
- **Celebratory**: Acknowledges wins and milestones
- **Proactive**: Surfaces opportunities before users ask
- **Reliable**: Accurate data they can trust for decisions

### Design Philosophy
**Apple-Inspired Principles:**
- **Clarity**: Every element serves a purpose
- **Deference**: Design amplifies data, doesn't compete with it
- **Depth**: Layered interactions reward exploration
- **Beauty**: Aesthetics enhance functionality
- **Simplicity**: Complex data presented with elegant simplicity

### Target Audience

**Primary: DTC Shopify Merchants ($1-10M Revenue)**
- Age: 25-45
- Role: Founder, CMO, Operations Manager
- Pain: Scattered data across 5+ platforms
- Goal: Grow profitably, make data-driven decisions
- Behavior: Checks metrics multiple times daily, mobile-first

**Secondary: Ecommerce Agencies**
- Managing 10-50 client accounts
- Need professional reporting and multi-account views
- Value white-label capabilities and client dashboards

**Tertiary: Finance Teams at Mid-Size Ecommerce**
- Focus on P&L, cash flow, and budget planning
- Need accurate attribution for channel investments
- Value forecasting and scenario planning tools

---

## Core Product Features

### 1. Widget-Based Dashboard System

#### Overview
Revolutionary drag-and-drop dashboard where users create personalized command centers using resizable widgets. Inspired by Apple's widget system but optimized for business intelligence.

#### Widget Library

**Revenue & Performance Widgets**
- **Revenue Tracker**: Daily/weekly/monthly revenue with trend analysis
- **AOV Monitor**: Average order value with cohort breakdowns
- **Order Volume**: Live order counts with hourly/daily views
- **Conversion Funnel**: Traffic → Sessions → Purchases visualization
- **ROAS Dashboard**: Return on ad spend across all channels

**Marketing Widgets**
- **Ad Spend Monitor**: Real-time spend across Google, Meta, TikTok
- **Campaign Performance**: Top/bottom performing campaigns table
- **Creative Analysis**: Ad creative performance with thumbnails
- **Attribution Map**: Customer journey visualization
- **Channel Breakdown**: Revenue by traffic source

**Operations Widgets**
- **Inventory Alerts**: Low stock warnings with reorder suggestions
- **Top Products**: Best sellers with trend indicators
- **Customer Segments**: LTV cohorts and behavior patterns
- **Refund Tracker**: Return rates and reasons analysis
- **Shipping Performance**: Fulfillment speed and cost tracking

**Finance Widgets**
- **P&L Summary**: Real-time profit and loss overview
- **Cash Flow**: Projected cash position with confidence intervals
- **Budget vs. Actual**: Spend tracking against budgets
- **Cost Analysis**: COGS, shipping, and fee breakdowns
- **Tax Summary**: Sales tax collected and owed

**Forecasting Widgets**
- **Revenue Forecast**: 30/60/90-day projections with scenarios
- **Seasonality View**: Year-over-year patterns with predictions
- **Goal Tracking**: Progress toward revenue and profit targets
- **Budget Optimizer**: Recommended channel spend allocation

#### Widget Specifications

**Size Options:**
- **Small (1x1)**: KPI cards, single metrics, alerts
- **Medium (2x1)**: Charts, tables, trend analysis
- **Large (2x2)**: Complex visualizations, detailed tables
- **Full-width (4x1)**: Dashboards, timelines, comprehensive views

**Customization Options:**
- Date range selector (24h, 7d, 30d, 90d, custom)
- Metric selection (revenue, orders, ROAS, etc.)
- Color themes (brand colors, data-driven colors)
- Display format (currency, percentage, raw numbers)
- Comparison periods (vs. last period, vs. same period last year)

#### Dashboard Templates

**Pre-built Templates:**
- **CMO View**: Marketing performance, ROAS, attribution, campaign analysis
- **Finance View**: P&L, cash flow, budgets, cost analysis
- **Daily Ops**: Orders, inventory, shipping, customer service
- **Marketing Deep Dive**: Channel performance, creative analysis, audience insights
- **Executive Summary**: High-level KPIs, trends, alerts

**Custom Dashboard Creation:**
- Drag widgets from library to canvas
- Resize and position widgets with snap-to-grid
- Create multiple dashboard tabs with custom names
- Save layouts as templates for reuse
- Share dashboard layouts with team members

### 2. Multi-Account Management System

#### Account Connection Flow

**OAuth Enhancement:**
- When connecting Google Ads, display ALL accessible accounts
- Multi-select interface to choose which accounts to track
- Account grouping by business/client for agencies
- Permission management per account (view, edit, billing access)

**Supported Platforms:**
- **Shopify**: Multiple stores per user, Plus store support
- **Google Ads**: Multiple manager accounts, client accounts
- **Meta Ads**: Business Manager accounts, ad accounts
- **GA4**: Multiple properties, cross-domain tracking
- **Klaviyo**: Multiple accounts, sub-accounts
- **TikTok Ads**: Business accounts, campaign management

#### Account Management Interface

**Account Selector:**
- Top navigation dropdown showing all connected accounts
- Quick switching between account contexts
- Visual indicators for data freshness and connection status
- Bulk operations across accounts (reports, exports)

**Data Segregation:**
- Clear account labeling on all widgets and reports
- Filtered views by account or account groups
- Consolidated views combining data across accounts
- Permission-based access control for team members

### 3. Real-Time Data Pipeline

#### Data Refresh System

**Configurable Refresh Intervals:**
- Real-time (WebSocket): Order notifications, alerts
- High frequency (5 min): Revenue, ad spend, inventory
- Medium frequency (15 min): Campaign performance, traffic data
- Low frequency (1 hour): Historical analysis, cohort data

**Data Accuracy Standards:**
- Must match native platform dashboards within 2%
- Automated discrepancy detection and alerts
- Manual data reconciliation tools for edge cases
- Historical data integrity monitoring

#### Historical Data Backfill

**Onboarding Data Import:**
- Automatic backfill of 2+ years historical data
- Progress indicators during import process
- Partial data availability during ongoing imports
- Data quality validation and error reporting

### 4. Advanced Filtering and Segmentation

#### Dynamic Filtering System

**Global Filters:**
- Date ranges with preset and custom options
- Account selection for multi-account users
- Currency conversion and display options
- Data confidence level filtering

**Widget-Level Filters:**
- Product categories, brands, SKUs
- Customer segments, acquisition channels
- Geographic regions, device types
- Campaign types, ad formats, placements

#### Segmentation Engine

**Customer Segments:**
- New vs. returning customers
- LTV cohorts (high, medium, low value)
- Acquisition channel groupings
- Geographic and demographic segments
- Purchase behavior patterns

**Product Segments:**
- Category performance comparison
- Seasonal vs. evergreen products
- Margin analysis by product group
- Inventory turnover segments

---

## Technical Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│  Web App (React 19 + Vite)    │    Mobile Web PWA              │
│  - Tailwind v4 styling        │    - Responsive design         │
│  - Zustand state management   │    - Push notification support │
│  - Recharts/Tremor viz        │    - Offline capability        │
└─────────────────────────────────────────────────────────────────┘
                                   │
                              HTTPS/WebSocket
                                   │
┌─────────────────────────────────────────────────────────────────┐
│                          API GATEWAY                           │
├─────────────────────────────────────────────────────────────────┤
│  Express.js 5 + JWT Auth      │    Rate Limiting & Caching     │
│  - RESTful API (/api/v2/)     │    - Redis session store       │
│  - WebSocket real-time        │    - API versioning support    │
│  - Middleware pipeline        │    - Request/response logging   │
└─────────────────────────────────────────────────────────────────┘
                                   │
                              Internal APIs
                                   │
┌─────────────────────────────────────────────────────────────────┐
│                       BUSINESS LOGIC                           │
├─────────────────────────────────────────────────────────────────┤
│  Data Processing Engine       │    Forecasting Engine          │
│  - ETL pipelines              │    - Time series analysis      │
│  - Data validation            │    - Scenario modeling         │
│  - Metric calculations        │    - Confidence intervals      │
│                               │                                │
│  Notification Engine          │    Authentication Service      │
│  - Alert processing           │    - OAuth 2.0 flows          │
│  - Push notification delivery │    - Multi-account management  │
│  - Email digest generation    │    - Permission system         │
└─────────────────────────────────────────────────────────────────┘
                                   │
                              Database Queries
                                   │
┌─────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│  Primary Database (SQLite → PostgreSQL)                        │
│  - User accounts & settings   │    - Historical metrics        │
│  - Dashboard configurations   │    - Calculated aggregations   │
│  - Account connections        │    - Forecast models           │
│                                                               │
│  Cache Layer (In-Memory + Redis)                               │
│  - Widget data cache          │    - Session management        │
│  - API response cache         │    - Real-time data buffer     │
└─────────────────────────────────────────────────────────────────┘
                                   │
                              API Connections
                                   │
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL INTEGRATIONS                       │
├─────────────────────────────────────────────────────────────────┤
│  Shopify APIs                 │    Meta Marketing APIs          │
│  Google Ads APIs              │    TikTok Ads APIs             │
│  GA4 APIs                     │    Klaviyo APIs               │
└─────────────────────────────────────────────────────────────────┘
```

### Technology Stack Decisions

#### Frontend Architecture
**React 19 with Vite Migration**
- **Why**: Faster build times, better HMR, smaller bundle sizes than CRA
- **Benefits**: Improved developer experience, production performance
- **Migration Path**: Gradual component-by-component migration

**Zustand for State Management**
- **Why**: Simpler than Redux, TypeScript-first, minimal boilerplate
- **Use Cases**: Widget state, user preferences, dashboard configurations
- **Benefits**: Easy testing, no provider wrapping, persistent state

**Tailwind v4 Design System**
- **Why**: New CSS engine, better performance, design token integration
- **Benefits**: Consistent spacing, color system, responsive utilities
- **Custom Config**: Brand colors, typography scale, component classes

**Recharts + Tremor for Visualizations**
- **Why**: React-native, composable, accessible chart components
- **Benefits**: Consistent styling, interaction handling, responsive design
- **Extensions**: Custom widget chart types, real-time data binding

#### Backend Architecture
**Express 5 API Server**
- **Why**: Mature ecosystem, TypeScript support, flexible middleware
- **Structure**: Modular route handlers, shared middleware, error handling
- **Performance**: Response compression, request caching, connection pooling

**Database Strategy**
- **Current**: SQLite for development and small deployments
- **Migration Path**: PostgreSQL for production scale
- **Benefits**: ACID compliance, JSON columns, full-text search

**Caching Strategy**
- **L1**: In-memory cache for frequently accessed data
- **L2**: Redis for session management and distributed caching
- **TTL**: Smart cache invalidation based on data freshness needs

#### Real-Time System
**WebSocket Implementation**
- **Use Cases**: Live order notifications, ad spend updates, alerts
- **Architecture**: Socket.io with room-based subscriptions
- **Scaling**: Redis adapter for multi-server deployments

### Infrastructure & Deployment

#### Current Infrastructure
- **Frontend**: Vercel (global CDN, automatic deployments)
- **Backend**: Google Cloud VM (single instance, vertical scaling)
- **Database**: SQLite on local storage
- **Monitoring**: Basic logging, manual health checks

#### Proposed Infrastructure Improvements

**Backend Scaling**
- **Load Balancer**: GCP Application Load Balancer
- **Auto-scaling**: Compute Engine instance groups
- **Database**: Cloud SQL PostgreSQL with read replicas
- **Caching**: Cloud Memorystore (Redis)

**Monitoring & Observability**
- **Application Monitoring**: Google Cloud Monitoring
- **Error Tracking**: Sentry integration
- **Performance**: Core Web Vitals tracking
- **Business Metrics**: Custom dashboard for KPIs

**Security Enhancements**
- **API Security**: Rate limiting, request validation, SQL injection protection
- **Data Encryption**: At-rest and in-transit encryption
- **Access Control**: JWT with refresh tokens, OAuth scopes
- **Compliance**: GDPR data handling, SOC 2 preparation

### API Design Philosophy

#### RESTful API Structure
```
/api/v2/
├── /auth
│   ├── POST /login
│   ├── POST /refresh
│   └── POST /logout
├── /accounts
│   ├── GET / (list connected accounts)
│   ├── POST /connect (initiate OAuth)
│   └── DELETE /:id (disconnect account)
├── /dashboards
│   ├── GET / (user dashboards)
│   ├── POST / (create dashboard)
│   ├── PUT /:id (update dashboard)
│   └── DELETE /:id (delete dashboard)
├── /widgets
│   ├── GET /data/:type (widget data)
│   ├── POST /config (save widget config)
│   └── GET /library (available widgets)
├── /reports
│   ├── GET /templates (available reports)
│   ├── POST /generate (create report)
│   └── GET /:id/export (download report)
└── /forecasts
    ├── GET /:type (forecast data)
    ├── POST /scenario (scenario analysis)
    └── PUT /goals (update goals)
```

#### WebSocket Events
```
Client → Server:
- join-dashboard: Subscribe to dashboard updates
- widget-config: Real-time widget configuration changes
- account-sync: Trigger data refresh for account

Server → Client:
- data-update: New data available for widgets
- alert-triggered: Important threshold crossed
- sync-complete: Account data refresh finished
- error-occurred: System error requiring user attention
```

---

## User Stories

### Epic 1: Dashboard Customization

**US-001: Widget Drag and Drop**
As a Shopify store owner, I want to drag widgets around my dashboard so that I can organize information according to my daily workflow.
*Acceptance Criteria:*
- Widgets snap to a 4-column grid system
- Real-time preview while dragging
- Auto-save layout changes
- Undo/redo functionality for accidental changes

**US-002: Widget Resizing**
As a marketing manager, I want to resize widgets so that I can emphasize the most important metrics for my role.
*Acceptance Criteria:*
- Four size options: Small (1x1), Medium (2x1), Large (2x2), Full-width (4x1)
- Visual resize handles on widget selection
- Content adapts appropriately to new size
- Minimum and maximum size constraints per widget type

**US-003: Dashboard Templates**
As a new user, I want to start with a pre-built dashboard template so that I can see value immediately without configuration.
*Acceptance Criteria:*
- Template selector during onboarding
- Templates: CMO View, Finance View, Daily Ops, Executive Summary
- One-click template application
- Ability to modify template after application

**US-004: Multiple Dashboard Tabs**
As an agency owner, I want multiple dashboard tabs so that I can separate client accounts and different business functions.
*Acceptance Criteria:*
- Unlimited dashboard tabs per account
- Custom tab names and icons
- Drag-to-reorder tabs
- Quick switching between tabs with keyboard shortcuts

### Epic 2: Multi-Account Management

**US-005: Multi-Account OAuth**
As an agency managing multiple client accounts, I want to connect multiple Google Ads and Meta accounts so that I can track all clients in one place.
*Acceptance Criteria:*
- Account selector during OAuth flow
- Checkbox interface to select multiple accounts
- Account grouping by client/business
- Permission management per account

**US-006: Account Switching**
As a user with multiple Shopify stores, I want to quickly switch between store contexts so that I can analyze each business separately.
*Acceptance Criteria:*
- Account dropdown in top navigation
- Visual indicators for which account is active
- Data filtering updates in real-time when switching
- Recently accessed accounts at the top

**US-007: Cross-Account Reporting**
As a business owner with multiple brands, I want to see consolidated reports across all my accounts so that I can understand total business performance.
*Acceptance Criteria:*
- "All Accounts" option in account selector
- Consolidated revenue, orders, and metrics
- Account breakdown in hover details
- Export capability for cross-account data

### Epic 3: Real-Time Data and Notifications

**US-008: Live Order Notifications**
As a store owner, I want to see orders appear in real-time so that I can celebrate sales and monitor business activity.
*Acceptance Criteria:*
- Push notifications for new orders
- Live order feed widget
- Order value and product details
- Sound and visual alerts (configurable)

**US-009: Threshold Alerts**
As a marketing manager, I want alerts when my ROAS drops below 3.0 so that I can take immediate action to optimize campaigns.
*Acceptance Criteria:*
- Configurable alert thresholds for all major KPIs
- Multiple notification channels (push, email, in-app)
- Alert history and acknowledgment system
- Snooze functionality for temporary issues

**US-010: Daily Digest Email**
As a busy entrepreneur, I want a daily email summary of my key metrics so that I can stay informed without opening the dashboard.
*Acceptance Criteria:*
- Configurable time for email delivery
- Customizable metrics inclusion
- Trend indicators (up/down/flat)
- Direct links to investigate specific metrics

### Epic 4: Advanced Forecasting

**US-011: Revenue Forecasting**
As a CFO, I want to see revenue forecasts for the next 90 days so that I can plan cash flow and inventory purchases.
*Acceptance Criteria:*
- 30/60/90-day forecast horizons
- Confidence intervals (80%, 90%, 95%)
- Seasonality adjustment based on historical data
- Interactive chart with hover details

**US-012: Scenario Planning**
As a marketing director, I want to model "what if I increase ad spend 20%" so that I can make informed budget decisions.
*Acceptance Criteria:*
- Scenario builder with adjustable parameters
- Side-by-side comparison with baseline forecast
- Impact visualization on revenue and profit
- Save/load scenario configurations

**US-013: Budget Optimization**
As an advertising manager, I want recommendations on how to allocate my $10k monthly budget across channels so that I can maximize ROAS.
*Acceptance Criteria:*
- AI-powered budget allocation suggestions
- Channel performance weighting
- Historical ROAS consideration
- Adjustable risk/conservative settings

### Epic 5: Data Integration and Accuracy

**US-014: Historical Data Backfill**
As a new user connecting my Shopify account, I want to see 2+ years of historical data so that I can understand long-term trends immediately.
*Acceptance Criteria:*
- Automatic backfill during account connection
- Progress indicator during import
- Partial data availability during ongoing import
- Data validation against Shopify reports

**US-015: Data Reconciliation**
As a finance manager, I want to verify that Slay Season revenue numbers match my Shopify dashboard so that I can trust the data for decisions.
*Acceptance Criteria:*
- Data accuracy within 2% of native platforms
- Automated discrepancy detection
- Manual reconciliation tools for edge cases
- Clear documentation of calculation methods

**US-016: Real-Time Sync Status**
As a user, I want to know when my data was last updated so that I can trust the freshness of my insights.
*Acceptance Criteria:*
- "Last updated" timestamp on each widget
- Sync status indicators in account dropdown
- Manual refresh capability
- Error notifications for sync failures

### Epic 6: Reporting and Exports

**US-017: Custom Report Builder**
As a business analyst, I want to create custom reports with specific metrics and date ranges so that I can answer unique business questions.
*Acceptance Criteria:*
- Drag-and-drop report builder interface
- Metric library with dimensions and filters
- Preview functionality before generation
- Save report templates for reuse

**US-018: Scheduled Reports**
As a CEO, I want to automatically receive weekly business reports every Monday morning so that I can start the week informed.
*Acceptance Criteria:*
- Configurable report schedule (daily, weekly, monthly)
- Email delivery with PDF attachment
- Customizable report content and formatting
- Subscription management interface

**US-019: White-Label Reports**
As an agency, I want to generate reports with my client's branding so that I can deliver professional client communications.
*Acceptance Criteria:*
- Custom logo and color scheme upload
- Client name and contact information
- Professional PDF formatting
- Agency attribution removal option

### Epic 7: Mobile and Accessibility

**US-020: Mobile Dashboard**
As a business owner always on the go, I want to check my key metrics on my phone so that I can stay informed anywhere.
*Acceptance Criteria:*
- Responsive design for mobile screens
- Touch-friendly widget interactions
- Mobile-optimized charts and tables
- Offline capability for cached data

**US-021: Apple Watch Notifications**
As an entrepreneur, I want important alerts on my Apple Watch so that I can be notified of critical business events immediately.
*Acceptance Criteria:*
- Web push notifications compatible with watchOS
- Condensed alert format for small screen
- Quick actions (acknowledge, snooze)
- Configurable alert priorities

### Epic 8: Onboarding and User Experience

**US-022: Guided Onboarding**
As a first-time user, I want step-by-step guidance to connect my accounts and set up my dashboard so that I can see value within 5 minutes.
*Acceptance Criteria:*
- Interactive onboarding wizard
- Progress indicators and estimated time
- Skip options for advanced users
- Success celebration when data loads

**US-023: Demo Mode**
As a prospect evaluating the platform, I want to explore with sample data so that I can understand the product's capabilities before connecting my real accounts.
*Acceptance Criteria:*
- Realistic demo data across all platforms
- Full functionality access in demo mode
- Clear indicators that data is simulated
- Easy transition from demo to real accounts

**US-024: Achievement System**
As a user, I want to be celebrated for milestones like "30 days of tracking" so that using the platform feels rewarding.
*Acceptance Criteria:*
- Achievement badges for usage milestones
- Progress tracking toward next achievements
- Social sharing capability for major milestones
- Achievement history and collection view

---

## Database Schema Changes

### New Tables for v2

#### Dashboard Configuration Tables

```sql
-- Dashboard layouts and configurations
CREATE TABLE dashboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    layout JSONB NOT NULL, -- Widget positions, sizes, configs
    is_template BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, slug)
);

-- Widget library and configurations
CREATE TABLE widget_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dashboard_id UUID NOT NULL REFERENCES dashboards(id) ON DELETE CASCADE,
    widget_type VARCHAR(100) NOT NULL, -- 'revenue_tracker', 'ad_spend', etc.
    position_x INTEGER NOT NULL,
    position_y INTEGER NOT NULL,
    width INTEGER NOT NULL, -- 1-4 grid units
    height INTEGER NOT NULL, -- 1-4 grid units
    config JSONB NOT NULL, -- Widget-specific configuration
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Dashboard templates
CREATE TABLE dashboard_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100), -- 'marketing', 'finance', 'operations'
    layout JSONB NOT NULL,
    preview_image_url TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### Multi-Account Management Tables

```sql
-- Connected accounts for each platform
CREATE TABLE connected_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL, -- 'shopify', 'google_ads', 'meta_ads'
    account_id VARCHAR(255) NOT NULL, -- Platform's account identifier
    account_name VARCHAR(255) NOT NULL,
    account_type VARCHAR(100), -- 'manager', 'client', 'business'
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP,
    account_metadata JSONB, -- Platform-specific account info
    is_active BOOLEAN DEFAULT TRUE,
    last_sync_at TIMESTAMP,
    sync_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, platform, account_id)
);

-- Account groupings for agencies/multi-brand businesses
CREATE TABLE account_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7), -- Hex color for UI
    created_at TIMESTAMP DEFAULT NOW()
);

-- Many-to-many relationship between accounts and groups
CREATE TABLE account_group_memberships (
    account_id UUID NOT NULL REFERENCES connected_accounts(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES account_groups(id) ON DELETE CASCADE,
    PRIMARY KEY (account_id, group_id)
);
```

#### Forecasting and Goals Tables

```sql
-- Forecast models and configurations
CREATE TABLE forecast_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id UUID REFERENCES connected_accounts(id) ON DELETE CASCADE,
    model_type VARCHAR(100) NOT NULL, -- 'revenue', 'orders', 'ad_spend'
    forecast_horizon INTEGER NOT NULL, -- Days into future
    confidence_level DECIMAL(3,2), -- 0.80, 0.90, 0.95
    model_parameters JSONB NOT NULL,
    seasonality_adjustment BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Forecast data points
CREATE TABLE forecast_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID NOT NULL REFERENCES forecast_models(id) ON DELETE CASCADE,
    forecast_date DATE NOT NULL,
    predicted_value DECIMAL(15,2) NOT NULL,
    confidence_lower DECIMAL(15,2),
    confidence_upper DECIMAL(15,2),
    actual_value DECIMAL(15,2), -- Filled in as actual data arrives
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(model_id, forecast_date)
);

-- Business goals and tracking
CREATE TABLE business_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id UUID REFERENCES connected_accounts(id) ON DELETE CASCADE,
    goal_type VARCHAR(100) NOT NULL, -- 'revenue', 'orders', 'profit'
    target_value DECIMAL(15,2) NOT NULL,
    current_value DECIMAL(15,2) DEFAULT 0,
    target_date DATE NOT NULL,
    time_period VARCHAR(50), -- 'monthly', 'quarterly', 'yearly'
    is_achieved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Scenario modeling
CREATE TABLE scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    base_model_id UUID NOT NULL REFERENCES forecast_models(id),
    parameter_adjustments JSONB NOT NULL, -- What's changed from base
    results_cache JSONB, -- Cached calculation results
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Notifications and Alerts Tables

```sql
-- Alert configurations
CREATE TABLE alert_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id UUID REFERENCES connected_accounts(id) ON DELETE CASCADE,
    rule_name VARCHAR(255) NOT NULL,
    metric_type VARCHAR(100) NOT NULL, -- 'revenue', 'roas', 'orders'
    condition_type VARCHAR(50) NOT NULL, -- 'threshold', 'change', 'anomaly'
    threshold_value DECIMAL(15,2),
    comparison_period INTEGER, -- For change-based alerts (hours)
    notification_channels JSON NOT NULL, -- ['email', 'push', 'webhook']
    is_active BOOLEAN DEFAULT TRUE,
    last_triggered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Alert history
CREATE TABLE alert_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_rule_id UUID NOT NULL REFERENCES alert_rules(id) ON DELETE CASCADE,
    triggered_at TIMESTAMP NOT NULL DEFAULT NOW(),
    metric_value DECIMAL(15,2) NOT NULL,
    threshold_value DECIMAL(15,2) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    is_acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_at TIMESTAMP,
    acknowledged_by UUID REFERENCES users(id)
);

-- Notification preferences
CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notification_type VARCHAR(100) NOT NULL,
    channels JSON NOT NULL, -- Enabled channels for this notification type
    frequency VARCHAR(50) DEFAULT 'immediate', -- 'immediate', 'hourly', 'daily'
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    timezone VARCHAR(50) DEFAULT 'UTC',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, notification_type)
);

-- Push notification subscriptions
CREATE TABLE push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    keys_p256dh TEXT NOT NULL,
    keys_auth TEXT NOT NULL,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    last_used_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, endpoint)
);
```

#### Enhanced User and Session Tables

```sql
-- Enhanced user table
ALTER TABLE users ADD COLUMN IF NOT EXISTS 
    theme_preference VARCHAR(20) DEFAULT 'light', -- 'light', 'dark', 'auto'
    timezone VARCHAR(50) DEFAULT 'UTC',
    date_format VARCHAR(20) DEFAULT 'MM/DD/YYYY',
    currency_preference VARCHAR(10) DEFAULT 'USD',
    notification_digest_frequency VARCHAR(20) DEFAULT 'daily',
    onboarding_completed_at TIMESTAMP,
    last_active_at TIMESTAMP,
    feature_flags JSONB DEFAULT '{}';

-- User session tracking for analytics
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_start TIMESTAMP NOT NULL DEFAULT NOW(),
    session_end TIMESTAMP,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    landing_page TEXT,
    page_views INTEGER DEFAULT 0,
    actions_taken INTEGER DEFAULT 0,
    widgets_interacted_with JSON,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Feature usage analytics
CREATE TABLE feature_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    feature_name VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL, -- 'viewed', 'clicked', 'configured'
    metadata JSONB,
    session_id UUID REFERENCES user_sessions(id),
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Data Migration Scripts

#### Migration from v1 to v2

```sql
-- Migrate existing users to new schema
INSERT INTO dashboards (user_id, name, slug, layout)
SELECT 
    id,
    'My Dashboard',
    'default',
    '{
        "widgets": [
            {"type": "revenue_tracker", "x": 0, "y": 0, "w": 2, "h": 1},
            {"type": "order_volume", "x": 2, "y": 0, "w": 2, "h": 1},
            {"type": "ad_spend_monitor", "x": 0, "y": 1, "w": 4, "h": 1}
        ]
    }'::jsonb
FROM users 
WHERE NOT EXISTS (
    SELECT 1 FROM dashboards WHERE dashboards.user_id = users.id
);

-- Migrate existing Shopify connections
INSERT INTO connected_accounts (user_id, platform, account_id, account_name, access_token, is_active)
SELECT 
    user_id,
    'shopify',
    shopify_store_id,
    shop_name,
    access_token,
    TRUE
FROM legacy_shopify_connections;

-- Create default notification preferences for existing users
INSERT INTO notification_preferences (user_id, notification_type, channels)
SELECT 
    id,
    unnest(ARRAY['order_alerts', 'daily_digest', 'threshold_alerts']),
    '["email", "push"]'::json
FROM users;
```

### Indexes for Performance

```sql
-- Dashboard and widget queries
CREATE INDEX idx_dashboards_user_id ON dashboards(user_id);
CREATE INDEX idx_widget_configs_dashboard_id ON widget_configs(dashboard_id);
CREATE INDEX idx_dashboard_templates_category ON dashboard_templates(category);

-- Account management queries
CREATE INDEX idx_connected_accounts_user_platform ON connected_accounts(user_id, platform);
CREATE INDEX idx_connected_accounts_sync_status ON connected_accounts(sync_status, last_sync_at);

-- Time-series data queries (existing tables)
CREATE INDEX idx_revenue_data_account_date ON revenue_data(account_id, recorded_at);
CREATE INDEX idx_ad_spend_data_account_date ON ad_spend_data(account_id, recorded_at);
CREATE INDEX idx_order_data_account_date ON order_data(account_id, created_at);

-- Forecasting queries
CREATE INDEX idx_forecast_data_model_date ON forecast_data(model_id, forecast_date);
CREATE INDEX idx_business_goals_user_date ON business_goals(user_id, target_date);

-- Alert and notification queries
CREATE INDEX idx_alert_rules_user_active ON alert_rules(user_id, is_active);
CREATE INDEX idx_alert_instances_rule_triggered ON alert_instances(alert_rule_id, triggered_at);
CREATE INDEX idx_push_subscriptions_user_active ON push_subscriptions(user_id, is_active);

-- Analytics queries
CREATE INDEX idx_user_sessions_user_start ON user_sessions(user_id, session_start);
CREATE INDEX idx_feature_usage_user_feature_date ON feature_usage(user_id, feature_name, created_at);
```

---

## API Specifications

### Authentication Endpoints

#### POST /api/v2/auth/login
**Purpose**: User authentication with email/password or OAuth
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "remember_me": true
}
```

**Response**:
```json
{
  "access_token": "jwt_token_here",
  "refresh_token": "refresh_token_here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "theme_preference": "light",
    "timezone": "America/New_York"
  },
  "expires_in": 3600
}
```

#### POST /api/v2/auth/refresh
**Purpose**: Refresh expired access token
```json
{
  "refresh_token": "refresh_token_here"
}
```

#### POST /api/v2/auth/oauth/initiate
**Purpose**: Start OAuth flow for platform connections
```json
{
  "platform": "shopify",
  "redirect_uri": "https://app.slayseason.com/auth/callback"
}
```

**Response**:
```json
{
  "authorization_url": "https://shopify.com/oauth/authorize?...",
  "state": "random_state_token"
}
```

### Account Management Endpoints

#### GET /api/v2/accounts
**Purpose**: List all connected accounts for user
**Response**:
```json
{
  "accounts": [
    {
      "id": "uuid",
      "platform": "shopify",
      "account_id": "shop_id",
      "account_name": "My Store",
      "account_type": "store",
      "is_active": true,
      "last_sync_at": "2026-02-20T10:30:00Z",
      "sync_status": "success",
      "metadata": {
        "shop_domain": "mystore.myshopify.com",
        "plan": "shopify_plus"
      }
    }
  ],
  "groups": [
    {
      "id": "uuid",
      "name": "Client Accounts",
      "color": "#3B82F6",
      "account_ids": ["uuid1", "uuid2"]
    }
  ]
}
```

#### POST /api/v2/accounts/connect
**Purpose**: Complete OAuth connection and save account
```json
{
  "platform": "google_ads",
  "authorization_code": "oauth_code",
  "state": "state_token",
  "selected_accounts": [
    {
      "account_id": "123-456-7890",
      "account_name": "My Ads Account"
    }
  ]
}
```

#### DELETE /api/v2/accounts/{account_id}
**Purpose**: Disconnect and remove account
**Response**: `204 No Content`

### Dashboard Management Endpoints

#### GET /api/v2/dashboards
**Purpose**: List user's dashboards
**Response**:
```json
{
  "dashboards": [
    {
      "id": "uuid",
      "name": "My Dashboard",
      "slug": "my-dashboard",
      "layout": {
        "widgets": [
          {
            "id": "w1",
            "type": "revenue_tracker",
            "x": 0,
            "y": 0,
            "w": 2,
            "h": 1,
            "config": {
              "dateRange": "30d",
              "accounts": ["uuid"],
              "currency": "USD"
            }
          }
        ]
      },
      "updated_at": "2026-02-20T10:30:00Z"
    }
  ],
  "templates": [
    {
      "id": "template_cmo",
      "name": "CMO View",
      "description": "Marketing-focused dashboard",
      "category": "marketing",
      "preview_image_url": "https://..."
    }
  ]
}
```

#### POST /api/v2/dashboards
**Purpose**: Create new dashboard
```json
{
  "name": "Marketing Dashboard",
  "template_id": "template_cmo",
  "copy_from_dashboard_id": "uuid"
}
```

#### PUT /api/v2/dashboards/{dashboard_id}
**Purpose**: Update dashboard layout and configuration
```json
{
  "name": "Updated Dashboard Name",
  "layout": {
    "widgets": [
      {
        "id": "w1",
        "type": "revenue_tracker",
        "x": 0,
        "y": 0,
        "w": 2,
        "h": 1,
        "config": {
          "dateRange": "7d",
          "accounts": ["uuid1", "uuid2"]
        }
      }
    ]
  }
}
```

### Widget Data Endpoints

#### GET /api/v2/widgets/data/{widget_type}
**Purpose**: Get data for specific widget type
**Query Parameters**:
- `accounts`: Comma-separated account IDs
- `dateRange`: 7d, 30d, 90d, or custom range
- `timezone`: User timezone for date calculations
- `currency`: Currency for monetary values

**Example**: `/api/v2/widgets/data/revenue_tracker?accounts=uuid1,uuid2&dateRange=30d`

**Response**:
```json
{
  "data": {
    "current_period": {
      "revenue": 125000.00,
      "orders": 450,
      "aov": 277.78
    },
    "previous_period": {
      "revenue": 98000.00,
      "orders": 380,
      "aov": 257.89
    },
    "time_series": [
      {
        "date": "2026-01-21",
        "revenue": 4200.00,
        "orders": 15
      }
    ],
    "growth_rate": 0.275,
    "trend": "up"
  },
  "metadata": {
    "last_updated": "2026-02-20T10:30:00Z",
    "accounts_included": ["uuid1", "uuid2"],
    "data_freshness": "5m"
  }
}
```

#### GET /api/v2/widgets/data/ad_spend_monitor
**Purpose**: Get advertising spend data across platforms
**Response**:
```json
{
  "data": {
    "total_spend": 15000.00,
    "by_platform": [
      {
        "platform": "google_ads",
        "spend": 8500.00,
        "clicks": 12000,
        "impressions": 450000,
        "roas": 4.2
      },
      {
        "platform": "meta_ads",
        "spend": 6500.00,
        "clicks": 8500,
        "impressions": 320000,
        "roas": 3.8
      }
    ],
    "daily_trend": [
      {
        "date": "2026-01-21",
        "google_ads": 280.00,
        "meta_ads": 215.00
      }
    ]
  }
}
```

### Forecasting Endpoints

#### GET /api/v2/forecasts/{forecast_type}
**Purpose**: Get forecast data for specific metric
**Parameters**:
- `forecast_type`: revenue, orders, ad_spend
- `horizon`: 30, 60, 90 days
- `confidence`: 80, 90, 95 (confidence interval)
- `accounts`: Account filter

**Response**:
```json
{
  "forecast": [
    {
      "date": "2026-02-21",
      "predicted_value": 4500.00,
      "confidence_lower": 3800.00,
      "confidence_upper": 5200.00,
      "actual_value": null
    }
  ],
  "model_info": {
    "model_type": "revenue",
    "confidence_level": 0.90,
    "seasonality_adjusted": true,
    "last_trained": "2026-02-20T06:00:00Z"
  },
  "summary": {
    "total_forecast": 135000.00,
    "growth_rate": 0.08,
    "confidence_score": 0.92
  }
}
```

#### POST /api/v2/forecasts/scenario
**Purpose**: Create scenario analysis with parameter adjustments
```json
{
  "base_forecast_type": "revenue",
  "scenario_name": "Increased Ad Spend",
  "adjustments": {
    "ad_spend_multiplier": 1.2,
    "conversion_rate_adjustment": 0.02
  },
  "horizon_days": 90
}
```

**Response**:
```json
{
  "scenario_id": "uuid",
  "results": {
    "baseline_total": 135000.00,
    "scenario_total": 162000.00,
    "incremental_revenue": 27000.00,
    "roi": 2.25,
    "confidence_score": 0.87
  },
  "timeline": [
    {
      "date": "2026-02-21",
      "baseline": 4500.00,
      "scenario": 5400.00
    }
  ]
}
```

### Notification Endpoints

#### GET /api/v2/notifications/preferences
**Purpose**: Get user notification preferences
**Response**:
```json
{
  "preferences": [
    {
      "notification_type": "order_alerts",
      "channels": ["email", "push"],
      "frequency": "immediate",
      "quiet_hours_start": "22:00",
      "quiet_hours_end": "08:00"
    }
  ],
  "push_subscriptions": [
    {
      "id": "uuid",
      "user_agent": "Mozilla/5.0...",
      "created_at": "2026-02-15T10:00:00Z",
      "last_used_at": "2026-02-20T09:00:00Z"
    }
  ]
}
```

#### POST /api/v2/notifications/subscribe
**Purpose**: Subscribe to push notifications
```json
{
  "subscription": {
    "endpoint": "https://fcm.googleapis.com/fcm/send/...",
    "keys": {
      "p256dh": "key_here",
      "auth": "auth_here"
    }
  }
}
```

#### POST /api/v2/notifications/alerts
**Purpose**: Create alert rule
```json
{
  "rule_name": "ROAS Below Target",
  "metric_type": "roas",
  "condition_type": "threshold",
  "threshold_value": 3.0,
  "comparison_operator": "less_than",
  "notification_channels": ["email", "push"],
  "accounts": ["uuid1", "uuid2"]
}
```

### Reporting Endpoints

#### GET /api/v2/reports/templates
**Purpose**: List available report templates
**Response**:
```json
{
  "templates": [
    {
      "id": "daily_pnl",
      "name": "Daily P&L",
      "description": "Revenue, costs, and profit analysis",
      "category": "finance",
      "supported_formats": ["pdf", "csv"],
      "parameters": [
        {
          "name": "date_range",
          "type": "date_range",
          "required": true
        },
        {
          "name": "accounts",
          "type": "account_list",
          "required": false
        }
      ]
    }
  ]
}
```

#### POST /api/v2/reports/generate
**Purpose**: Generate custom report
```json
{
  "template_id": "daily_pnl",
  "format": "pdf",
  "parameters": {
    "date_range": {
      "start": "2026-01-01",
      "end": "2026-01-31"
    },
    "accounts": ["uuid1", "uuid2"],
    "include_charts": true,
    "branding": {
      "logo_url": "https://...",
      "company_name": "My Agency"
    }
  },
  "delivery": {
    "method": "email",
    "recipients": ["client@example.com"]
  }
}
```

**Response**:
```json
{
  "report_id": "uuid",
  "status": "generating",
  "estimated_completion": "2026-02-20T10:35:00Z",
  "download_url": null
}
```

#### GET /api/v2/reports/{report_id}/status
**Purpose**: Check report generation status
**Response**:
```json
{
  "report_id": "uuid",
  "status": "completed",
  "download_url": "https://reports.slayseason.com/uuid.pdf",
  "expires_at": "2026-02-27T10:30:00Z",
  "file_size": 2048576
}
```

### WebSocket Events

#### Connection and Authentication
```javascript
// Client connects with JWT token
const socket = io('wss://api.slayseason.com', {
  auth: {
    token: 'jwt_token_here'
  }
});

// Join dashboard room for real-time updates
socket.emit('join-dashboard', {
  dashboard_id: 'uuid',
  widgets: ['revenue_tracker', 'order_volume']
});
```

#### Real-time Data Updates
```javascript
// Server sends widget data updates
socket.on('widget-data-update', (data) => {
  /*
  {
    "widget_id": "w1",
    "widget_type": "revenue_tracker",
    "data": {
      "revenue": 125500.00,
      "orders": 452,
      "last_order_at": "2026-02-20T10:32:00Z"
    },
    "timestamp": "2026-02-20T10:32:00Z"
  }
  */
});

// Live order notifications
socket.on('new-order', (data) => {
  /*
  {
    "order_id": "1234567",
    "account_id": "uuid",
    "total": 89.99,
    "items": [
      {
        "name": "Product Name",
        "quantity": 2,
        "price": 44.99
      }
    ],
    "customer": {
      "first_name": "John",
      "location": "New York, NY"
    },
    "timestamp": "2026-02-20T10:32:00Z"
  }
  */
});

// Alert notifications
socket.on('alert-triggered', (data) => {
  /*
  {
    "alert_id": "uuid",
    "rule_name": "ROAS Below Target",
    "message": "Google Ads ROAS dropped to 2.8x (target: 3.0x)",
    "severity": "medium",
    "metric_value": 2.8,
    "threshold_value": 3.0,
    "account_id": "uuid",
    "timestamp": "2026-02-20T10:32:00Z"
  }
  */
});
```

---

## Design System

### Visual Design Principles

#### Apple-Inspired Design Philosophy

**Clarity**
- Content is king - every UI element serves the data
- Clear visual hierarchy guides user attention
- Generous white space prevents information overload
- Typography scale ensures readable content at all levels

**Deference**
- UI design never competes with the data insights
- Subtle backgrounds let metrics and charts shine
- Interface elements fade when not in use
- Color is functional, not decorative

**Depth**
- Layered interactions reward user exploration
- Hover states reveal additional context
- Smooth transitions provide spatial context
- Progressive disclosure prevents overwhelming users

### Color System

#### Light Theme (Default)
```css
:root {
  /* Primary Brand Colors */
  --slay-primary: #FF6B6B;      /* Coral red for CTAs */
  --slay-primary-light: #FF8E8E;
  --slay-primary-dark: #E55555;

  /* Neutral Grays */
  --slay-gray-50: #FEFEFE;      /* Background */
  --slay-gray-100: #F7F8FA;     /* Card backgrounds */
  --slay-gray-200: #E5E7EB;     /* Borders */
  --slay-gray-300: #D1D5DB;     /* Disabled text */
  --slay-gray-400: #9CA3AF;     /* Secondary text */
  --slay-gray-500: #6B7280;     /* Primary text */
  --slay-gray-600: #4B5563;     /* Headings */
  --slay-gray-700: #374151;     /* Dark headings */

  /* Data Visualization Colors */
  --slay-success: #10B981;      /* Positive metrics */
  --slay-success-light: #34D399;
  --slay-warning: #F59E0B;      /* Warning states */
  --slay-warning-light: #FBBF24;
  --slay-danger: #EF4444;       /* Negative metrics */
  --slay-danger-light: #F87171;
  --slay-info: #3B82F6;         /* Info states */
  --slay-info-light: #60A5FA;

  /* Semantic Colors */
  --slay-revenue: #059669;      /* Revenue metrics */
  --slay-orders: #7C3AED;       /* Order metrics */
  --slay-traffic: #DC2626;      /* Traffic metrics */
  --slay-conversion: #0891B2;   /* Conversion metrics */
}
```

#### Dark Theme (Optional)
```css
[data-theme="dark"] {
  /* Dark theme overrides */
  --slay-gray-50: #0F172A;      /* Background */
  --slay-gray-100: #1E293B;     /* Card backgrounds */
  --slay-gray-200: #334155;     /* Borders */
  --slay-gray-300: #475569;     /* Disabled text */
  --slay-gray-400: #64748B;     /* Secondary text */
  --slay-gray-500: #94A3B8;     /* Primary text */
  --slay-gray-600: #CBD5E1;     /* Headings */
  --slay-gray-700: #F1F5F9;     /* Dark headings */
}
```

### Typography System

#### Font Stack
```css
/* Primary Font - System fonts for performance */
--font-primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
                'Helvetica Neue', Arial, sans-serif;

/* Monospace for data/numbers */
--font-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', 
             'Courier New', monospace;
```

#### Type Scale
```css
/* Typography Scale */
--text-xs: 0.75rem;      /* 12px - Small labels */
--text-sm: 0.875rem;     /* 14px - Secondary text */
--text-base: 1rem;       /* 16px - Body text */
--text-lg: 1.125rem;     /* 18px - Large body */
--text-xl: 1.25rem;      /* 20px - Subheadings */
--text-2xl: 1.5rem;      /* 24px - Small headings */
--text-3xl: 1.875rem;    /* 30px - Medium headings */
--text-4xl: 2.25rem;     /* 36px - Large headings */
--text-5xl: 3rem;        /* 48px - Hero numbers */

/* Font Weights */
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

#### Typography Usage
```css
/* Big & Bold Headlines */
.metric-headline {
  font-size: var(--text-5xl);
  font-weight: var(--font-bold);
  font-family: var(--font-mono);
  color: var(--slay-gray-700);
  line-height: 1.1;
}

/* Clear Hierarchy */
.page-title {
  font-size: var(--text-3xl);
  font-weight: var(--font-semibold);
  color: var(--slay-gray-700);
  margin-bottom: 0.5rem;
}

.section-title {
  font-size: var(--text-xl);
  font-weight: var(--font-medium);
  color: var(--slay-gray-600);
  margin-bottom: 1rem;
}
```

### Spacing System

#### Spacing Scale
```css
/* Spacing Scale (based on 4px grid) */
--space-1: 0.25rem;      /* 4px */
--space-2: 0.5rem;       /* 8px */
--space-3: 0.75rem;      /* 12px */
--space-4: 1rem;         /* 16px */
--space-5: 1.25rem;      /* 20px */
--space-6: 1.5rem;       /* 24px */
--space-8: 2rem;         /* 32px */
--space-10: 2.5rem;      /* 40px */
--space-12: 3rem;        /* 48px */
--space-16: 4rem;        /* 64px */
--space-20: 5rem;        /* 80px */
--space-24: 6rem;        /* 96px */
```

### Component Library

#### Widget Container
```css
.widget {
  background: var(--slay-gray-100);
  border: 1px solid var(--slay-gray-200);
  border-radius: 12px;
  padding: var(--space-6);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.widget:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.widget.dragging {
  transform: rotate(5deg) scale(1.05);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}
```

#### Metric Cards
```css
.metric-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-2);
}

.metric-value {
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  font-family: var(--font-mono);
  color: var(--slay-gray-700);
}

.metric-label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--slay-gray-500);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.metric-change {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
}

.metric-change.positive {
  color: var(--slay-success);
}

.metric-change.negative {
  color: var(--slay-danger);
}
```

#### Button System
```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border-radius: 8px;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
  border: 1px solid transparent;
}

.btn-primary {
  background: var(--slay-primary);
  color: white;
}

.btn-primary:hover {
  background: var(--slay-primary-dark);
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--slay-gray-100);
  color: var(--slay-gray-600);
  border-color: var(--slay-gray-200);
}

.btn-ghost {
  background: transparent;
  color: var(--slay-gray-500);
}
```

#### Chart Styling
```css
.chart-container {
  width: 100%;
  height: 300px; /* Default chart height */
}

/* Recharts customization */
.recharts-cartesian-axis-line,
.recharts-cartesian-axis-tick-line {
  stroke: var(--slay-gray-300);
}

.recharts-cartesian-axis-tick-value {
  fill: var(--slay-gray-400);
  font-size: var(--text-xs);
}

.recharts-tooltip-wrapper {
  background: var(--slay-gray-700) !important;
  border: none !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}
```

### Responsive Design

#### Breakpoint System
```css
/* Breakpoints */
--bp-mobile: 375px;      /* Mobile phones */
--bp-tablet: 768px;      /* Tablets */
--bp-desktop: 1024px;    /* Desktop */
--bp-wide: 1440px;       /* Wide desktop */

/* Media queries */
@media (min-width: 768px) {
  .dashboard-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: var(--space-6);
  }
}

@media (max-width: 767px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }
  
  .widget {
    padding: var(--space-4);
  }
  
  .metric-value {
    font-size: var(--text-3xl);
  }
}
```

#### Mobile Optimizations
```css
/* Touch-friendly interactions */
@media (max-width: 767px) {
  .btn {
    min-height: 44px; /* iOS touch target */
    padding: var(--space-3) var(--space-5);
  }
  
  .widget {
    min-height: 120px; /* Easier touch targets */
  }
  
  /* Disable hover effects on touch devices */
  .widget:hover {
    transform: none;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
}
```

### Micro-Interactions

#### Loading States
```css
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.loading-skeleton {
  background: var(--slay-gray-200);
  border-radius: 4px;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.widget.loading .metric-value {
  background: var(--slay-gray-200);
  border-radius: 4px;
  color: transparent;
  animation: pulse 2s infinite;
}
```

#### Success Animations
```css
@keyframes celebrate {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.metric-card.updated {
  animation: celebrate 0.3s ease;
}

.metric-change.positive::before {
  content: '↗';
  margin-right: var(--space-1);
}

.metric-change.negative::before {
  content: '↘';
  margin-right: var(--space-1);
}
```

### Accessibility

#### WCAG AA Compliance
```css
/* Focus indicators */
*:focus {
  outline: 2px solid var(--slay-primary);
  outline-offset: 2px;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .widget {
    border-width: 2px;
    border-color: var(--slay-gray-400);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

#### Screen Reader Support
```html
<!-- Widget with proper ARIA labels -->
<div class="widget" role="region" aria-labelledby="revenue-title">
  <h3 id="revenue-title" class="metric-label">Total Revenue</h3>
  <div class="metric-value" aria-describedby="revenue-change">
    $125,000
  </div>
  <div id="revenue-change" class="metric-change positive">
    <span class="sr-only">Increased by</span>
    +27% vs last month
  </div>
</div>
```

---

## Onboarding & Authentication

### User Registration Flow

#### Signup Options

**1. Email/Password Registration**
- Clean signup form with minimal fields
- Email, password, confirm password
- Real-time validation with helpful error messages
- Password strength indicator
- Terms of service and privacy policy checkboxes

**2. Google OAuth Registration**
- One-click "Continue with Google" button
- Automatic profile import (name, email, timezone)
- Streamlined flow with minimal friction

**3. Shopify OAuth Registration**
- "Connect your Shopify store" as primary CTA
- Direct Shopify OAuth flow
- Automatic store data import during registration
- Instant value demonstration with real store data

#### Registration Form Design
```html
<form class="signup-form">
  <div class="form-header">
    <h1>Get started with Slay Season</h1>
    <p>Turn your ecommerce data into actionable insights</p>
  </div>
  
  <div class="oauth-options">
    <button class="btn btn-google">
      <GoogleIcon /> Continue with Google
    </button>
    <button class="btn btn-shopify">
      <ShopifyIcon /> Connect your Shopify store
    </button>
  </div>
  
  <div class="divider">or sign up with email</div>
  
  <div class="form-fields">
    <input type="email" placeholder="Work email" required />
    <input type="password" placeholder="Password" required />
    <div class="password-strength">
      <div class="strength-bar"></div>
      <span class="strength-text">Password strength: Good</span>
    </div>
  </div>
  
  <button class="btn btn-primary btn-full">
    Create account
  </button>
  
  <p class="legal-text">
    By signing up, you agree to our 
    <a href="/terms">Terms</a> and 
    <a href="/privacy">Privacy Policy</a>
  </p>
</form>
```

### Guided Onboarding Experience

#### Step 1: Welcome & Account Setup (30 seconds)
**Goal**: Complete profile and understand value proposition

- Welcome message with user's name
- Quick profile completion (company name, role, monthly revenue range)
- Value proposition reinforcement: "Let's get your data connected"

#### Step 2: Connect Your Shopify Store (2 minutes)
**Goal**: Establish primary data connection

- Prominent "Connect Shopify" button
- OAuth flow with permission explanation
- Store verification and data access confirmation
- Progress indicator: "Importing your store data..."

```javascript
// Onboarding step component
const ShopifyConnectionStep = () => {
  return (
    <div className="onboarding-step">
      <div className="step-header">
        <h2>Connect your Shopify store</h2>
        <p>We'll import your revenue, orders, and product data to get started</p>
      </div>
      
      <div className="connection-card">
        <ShopifyIcon className="platform-icon" />
        <div className="connection-info">
          <h3>Shopify Store</h3>
          <p>Revenue, orders, products, customers</p>
        </div>
        <button className="btn btn-primary" onClick={initShopifyAuth}>
          Connect Store
        </button>
      </div>
      
      <div className="data-preview">
        <h4>What we'll import:</h4>
        <ul>
          <li>Revenue and order history (2+ years)</li>
          <li>Product performance data</li>
          <li>Customer information</li>
          <li>Real-time order notifications</li>
        </ul>
      </div>
    </div>
  );
};
```

#### Step 3: Connect Your Ad Platforms (2 minutes)
**Goal**: Enable comprehensive attribution and ROAS tracking

- Platform selector with Google Ads, Meta Ads, TikTok options
- "Skip for now" option to reduce friction
- Multi-account selection for each platform
- Attribution explanation: "See which ads drive sales"

```javascript
const AdPlatformStep = () => {
  const [selectedPlatforms, setSelectedPlatforms] = useState(['google_ads']);
  
  return (
    <div className="onboarding-step">
      <div className="step-header">
        <h2>Connect your advertising platforms</h2>
        <p>Track ROAS and see which campaigns drive the most sales</p>
      </div>
      
      <div className="platform-grid">
        {platforms.map(platform => (
          <PlatformCard 
            key={platform.id}
            platform={platform}
            selected={selectedPlatforms.includes(platform.id)}
            onToggle={togglePlatform}
          />
        ))}
      </div>
      
      <div className="step-actions">
        <button className="btn btn-primary" onClick={connectPlatforms}>
          Connect Selected Platforms
        </button>
        <button className="btn btn-ghost" onClick={skipStep}>
          Skip for now
        </button>
      </div>
    </div>
  );
};
```

#### Step 4: Choose Your Dashboard (1 minute)
**Goal**: Provide immediate value with personalized layout

- Template selector based on user role
- Templates: CMO View, Finance View, Daily Ops, Executive Summary
- Preview of each template
- "You can customize this anytime" reassurance

#### Step 5: Data Import & First Insights (30 seconds)
**Goal**: Celebrate completion and show initial value

- Progress animation for data import
- First insights appear as data loads
- Achievement notification: "Welcome to Slay Season! 🎉"
- Call-to-action to explore dashboard

```javascript
const DataImportStep = () => {
  const [importProgress, setImportProgress] = useState(0);
  const [firstInsights, setFirstInsights] = useState([]);
  
  return (
    <div className="onboarding-step">
      <div className="import-animation">
        <div className="progress-circle">
          <CircularProgress value={importProgress} />
        </div>
        <h2>Importing your data...</h2>
        <p>This usually takes 30-60 seconds</p>
      </div>
      
      {firstInsights.length > 0 && (
        <div className="first-insights">
          <h3>Here's what we found:</h3>
          <div className="insights-preview">
            {firstInsights.map(insight => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        </div>
      )}
      
      {importProgress === 100 && (
        <div className="completion-celebration">
          <SuccessIcon className="success-icon" />
          <h2>Welcome to Slay Season! 🎉</h2>
          <p>Your dashboard is ready. Let's explore your data.</p>
          <button className="btn btn-primary" onClick={completOnboarding}>
            View My Dashboard
          </button>
        </div>
      )}
    </div>
  );
};
```

### Multi-Account OAuth Implementation

#### Enhanced OAuth Flow

**Google Ads Multi-Account Selection**
```javascript
const GoogleAdsAuth = () => {
  const initiateAuth = async () => {
    const response = await fetch('/api/v2/auth/oauth/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        platform: 'google_ads',
        redirect_uri: window.location.origin + '/auth/callback'
      })
    });
    
    const { authorization_url } = await response.json();
    window.location.href = authorization_url;
  };
  
  return (
    <button className="platform-connect-btn" onClick={initiateAuth}>
      <GoogleAdsIcon />
      Connect Google Ads
    </button>
  );
};
```

**Account Selection Interface**
```javascript
const AccountSelector = ({ platform, availableAccounts, onSelection }) => {
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  
  const handleAccountToggle = (accountId) => {
    setSelectedAccounts(prev => 
      prev.includes(accountId) 
        ? prev.filter(id => id !== accountId)
        : [...prev, accountId]
    );
  };
  
  return (
    <div className="account-selector">
      <div className="selector-header">
        <h3>Select {platform} accounts to connect</h3>
        <p>You can connect multiple accounts and switch between them</p>
      </div>
      
      <div className="accounts-list">
        {availableAccounts.map(account => (
          <label key={account.id} className="account-option">
            <input
              type="checkbox"
              checked={selectedAccounts.includes(account.id)}
              onChange={() => handleAccountToggle(account.id)}
            />
            <div className="account-info">
              <span className="account-name">{account.name}</span>
              <span className="account-type">{account.type}</span>
              <span className="account-spend">
                ${account.monthly_spend?.toLocaleString()}/month
              </span>
            </div>
          </label>
        ))}
      </div>
      
      <div className="selector-actions">
        <button 
          className="btn btn-primary"
          disabled={selectedAccounts.length === 0}
          onClick={() => onSelection(selectedAccounts)}
        >
          Connect {selectedAccounts.length} Account(s)
        </button>
      </div>
    </div>
  );
};
```

### Demo Mode Implementation

#### Sample Data Generation
```javascript
const generateDemoData = () => {
  return {
    revenue: {
      current_month: 89750,
      last_month: 73200,
      growth_rate: 0.226,
      daily_trend: generateDailyTrend(30)
    },
    orders: {
      current_month: 324,
      last_month: 289,
      aov: 277,
      conversion_rate: 0.034
    },
    advertising: {
      total_spend: 18500,
      roas: 4.2,
      platforms: [
        { name: 'Google Ads', spend: 11200, roas: 4.6 },
        { name: 'Meta Ads', spend: 7300, roas: 3.7 }
      ]
    },
    top_products: [
      { name: 'Paint By Numbers Kit - Landscape', revenue: 12400, orders: 89 },
      { name: 'Advanced Painting Set', revenue: 8900, orders: 34 }
    ]
  };
};
```

#### Demo Mode UI Indicators
```javascript
const DemoModeIndicator = () => {
  return (
    <div className="demo-mode-banner">
      <div className="banner-content">
        <InfoIcon className="banner-icon" />
        <span>You're viewing demo data. </span>
        <button className="btn-link" onClick={showConnectModal}>
          Connect your real accounts
        </button>
      </div>
      <button className="banner-close" onClick={dismissBanner}>
        <CloseIcon />
      </button>
    </div>
  );
};
```

### Time to Value Optimization

#### Performance Targets
- **Account connection**: < 30 seconds
- **Data import initiation**: < 60 seconds  
- **First insights display**: < 5 minutes
- **Full dashboard ready**: < 10 minutes

#### Progressive Data Loading
```javascript
const useProgressiveDataLoad = (accountId) => {
  const [loadingStates, setLoadingStates] = useState({
    basic_metrics: 'loading',    // Revenue, orders (loads first)
    historical_data: 'loading',  // Trends, comparisons
    advertising_data: 'loading', // ROAS, ad spend
    advanced_analytics: 'loading' // Cohorts, forecasting
  });
  
  useEffect(() => {
    // Load basic metrics immediately
    loadBasicMetrics(accountId).then(() => {
      setLoadingStates(prev => ({ ...prev, basic_metrics: 'loaded' }));
      
      // Then load historical data
      return loadHistoricalData(accountId);
    }).then(() => {
      setLoadingStates(prev => ({ ...prev, historical_data: 'loaded' }));
      
      // Finally load advanced features
      loadAdvancedAnalytics(accountId);
    });
  }, [accountId]);
  
  return loadingStates;
};
```

### Error Handling and Recovery

#### Common Error Scenarios
1. **OAuth Permission Denied**: Clear explanation and retry option
2. **Account Access Issues**: Troubleshooting steps and support contact
3. **Data Import Failures**: Partial import handling and retry mechanisms
4. **Platform API Errors**: Graceful degradation and user communication

```javascript
const ErrorBoundary = ({ children, fallback }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);
  
  const handleError = (error, errorInfo) => {
    setHasError(true);
    setError(error);
    
    // Log to error tracking service
    logError('Onboarding Error', {
      error: error.message,
      stack: error.stack,
      errorInfo
    });
  };
  
  if (hasError) {
    return (
      <div className="error-fallback">
        <h2>Something went wrong</h2>
        <p>We're having trouble connecting your account. Here's what you can try:</p>
        <ul>
          <li>Check your internet connection</li>
          <li>Try refreshing the page</li>
          <li>Contact support if the problem persists</li>
        </ul>
        <div className="error-actions">
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Refresh Page
          </button>
          <button className="btn btn-ghost" onClick={contactSupport}>
            Contact Support
          </button>
        </div>
      </div>
    );
  }
  
  return children;
};
```

---

## Notifications & Alerts

### Push Notification System

#### Web Push Implementation

**Service Worker Setup**
```javascript
// sw.js - Service Worker for push notifications
self.addEventListener('push', function(event) {
  const options = {
    body: event.data?.text() || 'New notification from Slay Season',
    icon: '/icons/notification-icon.png',
    badge: '/icons/badge-icon.png',
    tag: 'slay-notification',
    requireInteraction: false,
    actions: [
      {
        action: 'view',
        title: 'View Dashboard',
        icon: '/icons/view-icon.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/dismiss-icon.png'
      }
    ],
    data: event.data?.json() || {}
  };

  event.waitUntil(
    self.registration.showNotification('Slay Season', options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  }
});
```

**Client-Side Subscription**
```javascript
const subscribeToPushNotifications = async () => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push notifications not supported');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });

    // Send subscription to server
    await fetch('/api/v2/notifications/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({ subscription })
    });

    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error);
  }
};
```

#### Apple Watch Support

**Web Push for watchOS**
```javascript
const notificationOptions = {
  body: 'Your ROAS dropped to 2.8x',
  badge: '/icons/apple-watch-badge.png',
  icon: '/icons/apple-watch-icon.png',
  tag: 'roas-alert',
  requireInteraction: true, // Ensures delivery to watch
  silent: false,
  timestamp: Date.now(),
  actions: [
    { action: 'acknowledge', title: '✓' },
    { action: 'snooze', title: '💤' }
  ],
  data: {
    alert_type: 'roas_threshold',
    metric_value: 2.8,
    threshold: 3.0,
    account_name: 'My Store'
  }
};
```

### Alert Rules Engine

#### Alert Rule Configuration
```javascript
const AlertRuleBuilder = () => {
  const [rule, setRule] = useState({
    name: '',
    metric: 'revenue',
    condition: 'threshold',
    value: '',
    comparison: 'less_than',
    period: '24h',
    accounts: [],
    channels: ['push', 'email']
  });

  const metricOptions = [
    { value: 'revenue', label: 'Revenue', format: 'currency' },
    { value: 'roas', label: 'ROAS', format: 'number' },
    { value: 'aov', label: 'Average Order Value', format: 'currency' },
    { value: 'conversion_rate', label: 'Conversion Rate', format: 'percentage' },
    { value: 'ad_spend', label: 'Ad Spend', format: 'currency' }
  ];

  const conditionOptions = [
    { value: 'threshold', label: 'Exceeds/Falls Below Threshold' },
    { value: 'change', label: 'Changes by Percentage' },
    { value: 'anomaly', label: 'Unusual Pattern Detected' }
  ];

  return (
    <div className="alert-rule-builder">
      <div className="form-section">
        <label>Alert Name</label>
        <input
          type="text"
          placeholder="e.g., ROAS Below Target"
          value={rule.name}
          onChange={(e) => setRule(prev => ({ ...prev, name: e.target.value }))}
        />
      </div>

      <div className="form-section">
        <label>When</label>
        <div className="rule-builder">
          <select
            value={rule.metric}
            onChange={(e) => setRule(prev => ({ ...prev, metric: e.target.value }))}
          >
            {metricOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={rule.comparison}
            onChange={(e) => setRule(prev => ({ ...prev, comparison: e.target.value }))}
          >
            <option value="less_than">falls below</option>
            <option value="greater_than">exceeds</option>
            <option value="equals">equals</option>
          </select>

          <input
            type="number"
            placeholder="Threshold value"
            value={rule.value}
            onChange={(e) => setRule(prev => ({ ...prev, value: e.target.value }))}
          />
        </div>
      </div>

      <div className="form-section">
        <label>Notification Channels</label>
        <div className="channel-options">
          {['push', 'email', 'webhook'].map(channel => (
            <label key={channel} className="checkbox-option">
              <input
                type="checkbox"
                checked={rule.channels.includes(channel)}
                onChange={(e) => toggleChannel(channel, e.target.checked)}
              />
              {channel.charAt(0).toUpperCase() + channel.slice(1)}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
```

#### Smart Alert Processing
```javascript
class AlertProcessor {
  constructor() {
    this.rules = new Map();
    this.recentAlerts = new Map();
    this.cooldownPeriod = 30 * 60 * 1000; // 30 minutes
  }

  async processMetricUpdate(metric, value, accountId) {
    const relevantRules = this.getRulesForMetric(metric, accountId);
    
    for (const rule of relevantRules) {
      if (this.shouldTriggerAlert(rule, value)) {
        await this.triggerAlert(rule, value, accountId);
      }
    }
  }

  shouldTriggerAlert(rule, currentValue) {
    // Check cooldown period
    const lastAlert = this.recentAlerts.get(rule.id);
    if (lastAlert && Date.now() - lastAlert < this.cooldownPeriod) {
      return false;
    }

    // Evaluate rule condition
    switch (rule.condition_type) {
      case 'threshold':
        return this.evaluateThreshold(rule, currentValue);
      case 'change':
        return this.evaluateChange(rule, currentValue);
      case 'anomaly':
        return this.detectAnomaly(rule, currentValue);
      default:
        return false;
    }
  }

  evaluateThreshold(rule, value) {
    const threshold = rule.threshold_value;
    
    switch (rule.comparison_operator) {
      case 'less_than':
        return value < threshold;
      case 'greater_than':
        return value > threshold;
      case 'equals':
        return Math.abs(value - threshold) < 0.01; // Floating point tolerance
      default:
        return false;
    }
  }

  async triggerAlert(rule, value, accountId) {
    const alert = {
      id: generateUUID(),
      rule_id: rule.id,
      account_id: accountId,
      metric_value: value,
      threshold_value: rule.threshold_value,
      severity: this.calculateSeverity(rule, value),
      message: this.generateMessage(rule, value),
      timestamp: new Date()
    };

    // Save to database
    await this.saveAlert(alert);

    // Send notifications
    await this.sendNotifications(alert, rule.notification_channels);

    // Update cooldown
    this.recentAlerts.set(rule.id, Date.now());
  }

  generateMessage(rule, value) {
    const metricName = this.getMetricDisplayName(rule.metric_type);
    const formattedValue = this.formatValue(value, rule.metric_type);
    const formattedThreshold = this.formatValue(rule.threshold_value, rule.metric_type);

    return `${metricName} ${rule.comparison_operator.replace('_', ' ')} ${formattedThreshold} (current: ${formattedValue})`;
  }

  async sendNotifications(alert, channels) {
    const promises = channels.map(channel => {
      switch (channel) {
        case 'push':
          return this.sendPushNotification(alert);
        case 'email':
          return this.sendEmailAlert(alert);
        case 'webhook':
          return this.sendWebhookAlert(alert);
        default:
          return Promise.resolve();
      }
    });

    await Promise.allSettled(promises);
  }
}
```

### Notification Templates

#### Order Notifications
```javascript
const OrderNotification = {
  title: '🎉 New Order!',
  body: (order) => `${order.customer.first_name} just ordered ${order.line_items[0].title} for $${order.total_price}`,
  icon: '/icons/order-icon.png',
  tag: 'new-order',
  actions: [
    { action: 'view_order', title: 'View Order' },
    { action: 'view_customer', title: 'View Customer' }
  ],
  sound: '/sounds/success.mp3'
};
```

#### Threshold Alert Templates
```javascript
const ThresholdAlerts = {
  roas_below: {
    title: '⚠️ ROAS Alert',
    body: (data) => `${data.account_name} ROAS dropped to ${data.current_value}x (target: ${data.threshold}x)`,
    severity: 'medium',
    icon: '/icons/warning-icon.png',
    actions: [
      { action: 'optimize_campaigns', title: 'Optimize Campaigns' },
      { action: 'view_dashboard', title: 'View Dashboard' }
    ]
  },
  
  revenue_spike: {
    title: '🚀 Revenue Surge!',
    body: (data) => `Daily revenue hit $${data.current_value.toLocaleString()}! Up ${data.change_percent}% from yesterday`,
    severity: 'positive',
    icon: '/icons/success-icon.png',
    actions: [
      { action: 'view_dashboard', title: 'See Details' },
      { action: 'share', title: 'Share' }
    ]
  },
  
  ad_spend_exceeded: {
    title: '💰 Budget Alert',
    body: (data) => `Ad spend reached $${data.current_value.toLocaleString()} (${data.percent_of_budget}% of monthly budget)`,
    severity: 'high',
    icon: '/icons/budget-icon.png',
    actions: [
      { action: 'adjust_budgets', title: 'Adjust Budgets' },
      { action: 'pause_campaigns', title: 'Pause Campaigns' }
    ]
  }
};
```

### Daily Digest System

#### Digest Email Template
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Daily Slay Season Digest</title>
  <style>
    /* Email-safe CSS with inline styles */
    .digest-container {
      max-width: 600px;
      margin: 0 auto;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    }
    .metric-card {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      margin: 16px 0;
      border-left: 4px solid #FF6B6B;
    }
    .metric-value {
      font-size: 32px;
      font-weight: bold;
      color: #1a1a1a;
      margin: 0;
    }
    .metric-change.positive { color: #10B981; }
    .metric-change.negative { color: #EF4444; }
  </style>
</head>
<body>
  <div class="digest-container">
    <div class="header">
      <h1>Good morning, {{ user_name }}! ☀️</h1>
      <p>Here's how your store performed yesterday:</p>
    </div>

    <div class="metrics-grid">
      <div class="metric-card">
        <h3>Revenue</h3>
        <p class="metric-value">${{ revenue.value }}</p>
        <p class="metric-change {{ revenue.trend }}">
          {{ revenue.change }}% vs. day before
        </p>
      </div>

      <div class="metric-card">
        <h3>Orders</h3>
        <p class="metric-value">{{ orders.value }}</p>
        <p class="metric-change {{ orders.trend }}">
          {{ orders.change }}% vs. day before
        </p>
      </div>

      <div class="metric-card">
        <h3>ROAS</h3>
        <p class="metric-value">{{ roas.value }}x</p>
        <p class="metric-change {{ roas.trend }}">
          {{ roas.change }}% vs. day before
        </p>
      </div>
    </div>

    <div class="insights-section">
      <h2>Key Insights</h2>
      {{#each insights}}
      <div class="insight-item">
        <p><strong>{{ title }}</strong></p>
        <p>{{ description }}</p>
      </div>
      {{/each}}
    </div>

    <div class="cta-section">
      <a href="{{ dashboard_url }}" class="cta-button">
        View Full Dashboard
      </a>
    </div>
  </div>
</body>
</html>
```

#### Digest Generation Logic
```javascript
const generateDailyDigest = async (userId) => {
  const user = await getUserById(userId);
  const accounts = await getConnectedAccounts(userId);
  
  // Get yesterday's metrics
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  const metrics = await getMetricsForDate(accounts, yesterday);
  const comparisons = await getMetricsForDate(accounts, 
    new Date(yesterday.getTime() - 24 * 60 * 60 * 1000)
  );

  // Generate insights
  const insights = await generateInsights(metrics, comparisons, user);

  const digestData = {
    user_name: user.name,
    date: yesterday.toLocaleDateString(),
    revenue: {
      value: metrics.revenue.toLocaleString(),
      change: calculatePercentChange(metrics.revenue, comparisons.revenue),
      trend: metrics.revenue > comparisons.revenue ? 'positive' : 'negative'
    },
    orders: {
      value: metrics.orders,
      change: calculatePercentChange(metrics.orders, comparisons.orders),
      trend: metrics.orders > comparisons.orders ? 'positive' : 'negative'
    },
    roas: {
      value: metrics.roas.toFixed(1),
      change: calculatePercentChange(metrics.roas, comparisons.roas),
      trend: metrics.roas > comparisons.roas ? 'positive' : 'negative'
    },
    insights: insights,
    dashboard_url: `${process.env.APP_URL}/dashboard`
  };

  return digestData;
};

const generateInsights = async (current, previous, user) => {
  const insights = [];

  // Revenue insights
  if (current.revenue > previous.revenue * 1.2) {
    insights.push({
      title: '🚀 Revenue surge detected!',
      description: `Yesterday was ${((current.revenue / previous.revenue - 1) * 100).toFixed(0)}% better than the day before. Great job!`
    });
  }

  // ROAS insights
  if (current.roas < 3.0 && previous.roas >= 3.0) {
    insights.push({
      title: '⚠️ ROAS needs attention',
      description: 'Your return on ad spend dropped below 3.0x. Consider optimizing your campaigns.'
    });
  }

  // Product insights
  const topProduct = current.top_products?.[0];
  if (topProduct) {
    insights.push({
      title: '⭐ Top performer',
      description: `${topProduct.name} generated $${topProduct.revenue.toLocaleString()} yesterday.`
    });
  }

  return insights;
};
```

### Notification Preferences

#### User Preference Interface
```javascript
const NotificationPreferences = () => {
  const [preferences, setPreferences] = useState({});
  const [loading, setLoading] = useState(true);

  const notificationTypes = [
    {
      id: 'order_alerts',
      name: 'New Orders',
      description: 'Get notified when you receive new orders',
      default_channels: ['push'],
      frequency_options: ['immediate']
    },
    {
      id: 'daily_digest',
      name: 'Daily Digest',
      description: 'Daily summary of your key metrics',
      default_channels: ['email'],
      frequency_options: ['daily']
    },
    {
      id: 'threshold_alerts',
      name: 'Threshold Alerts',
      description: 'Alerts when metrics cross your defined thresholds',
      default_channels: ['push', 'email'],
      frequency_options: ['immediate', 'hourly']
    },
    {
      id: 'anomaly_detection',
      name: 'Unusual Activity',
      description: 'AI-detected unusual patterns in your data',
      default_channels: ['push'],
      frequency_options: ['immediate']
    }
  ];

  return (
    <div className="notification-preferences">
      <div className="preferences-header">
        <h2>Notification Preferences</h2>
        <p>Choose how and when you want to be notified</p>
      </div>

      <div className="preferences-list">
        {notificationTypes.map(type => (
          <div key={type.id} className="preference-item">
            <div className="preference-info">
              <h3>{type.name}</h3>
              <p>{type.description}</p>
            </div>

            <div className="preference-controls">
              <div className="channel-toggles">
                <label className="toggle-option">
                  <input
                    type="checkbox"
                    checked={preferences[type.id]?.channels?.includes('push')}
                    onChange={(e) => updateChannelPreference(type.id, 'push', e.target.checked)}
                  />
                  <span>Push</span>
                </label>

                <label className="toggle-option">
                  <input
                    type="checkbox"
                    checked={preferences[type.id]?.channels?.includes('email')}
                    onChange={(e) => updateChannelPreference(type.id, 'email', e.target.checked)}
                  />
                  <span>Email</span>
                </label>
              </div>

              {type.frequency_options.length > 1 && (
                <select
                  value={preferences[type.id]?.frequency || 'immediate'}
                  onChange={(e) => updateFrequencyPreference(type.id, e.target.value)}
                >
                  {type.frequency_options.map(option => (
                    <option key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="quiet-hours-section">
        <h3>Quiet Hours</h3>
        <p>Don't send push notifications during these hours</p>
        <div className="time-inputs">
          <input
            type="time"
            value={preferences.quiet_hours_start || '22:00'}
            onChange={(e) => setPreferences(prev => ({
              ...prev,
              quiet_hours_start: e.target.value
            }))}
          />
          <span>to</span>
          <input
            type="time"
            value={preferences.quiet_hours_end || '08:00'}
            onChange={(e) => setPreferences(prev => ({
              ...prev,
              quiet_hours_end: e.target.value
            }))}
          />
        </div>
      </div>
    </div>
  );
};
```

---

## Reporting Engine

### Pre-Built Report Templates

#### Daily P&L Report
```javascript
const DailyPnLReport = {
  id: 'daily_pnl',
  name: 'Daily P&L',
  description: 'Complete profit and loss analysis for any date range',
  category: 'finance',
  
  sections: [
    {
      title: 'Revenue Summary',
      metrics: [
        'gross_revenue',
        'net_revenue',
        'refunds',
        'average_order_value',
        'total_orders'
      ]
    },
    {
      title: 'Cost Breakdown',
      metrics: [
        'cost_of_goods_sold',
        'shipping_costs',
        'payment_fees',
        'advertising_spend',
        'other_expenses'
      ]
    },
    {
      title: 'Profitability',
      metrics: [
        'gross_profit',
        'net_profit',
        'profit_margin',
        'contribution_margin'
      ]
    }
  ],
  
  charts: [
    {
      type: 'line',
      title: 'Daily Revenue & Profit Trend',
      metrics: ['net_revenue', 'net_profit']
    },
    {
      type: 'pie',
      title: 'Cost Distribution',
      metrics: ['cogs', 'ad_spend', 'fees', 'other']
    }
  ],
  
  generateData: async ({ accounts, dateRange, filters }) => {
    const revenue = await getRevenueData(accounts, dateRange);
    const costs = await getCostData(accounts, dateRange);
    const orders = await getOrderData(accounts, dateRange);
    
    return {
      summary: {
        gross_revenue: revenue.gross,
        net_revenue: revenue.net,
        refunds: revenue.refunds,
        total_orders: orders.count,
        average_order_value: revenue.net / orders.count,
        
        cost_of_goods_sold: costs.cogs,
        shipping_costs: costs.shipping,
        payment_fees: costs.fees,
        advertising_spend: costs.advertising,
        other_expenses: costs.other,
        
        gross_profit: revenue.gross - costs.cogs,
        net_profit: revenue.net - costs.total,
        profit_margin: (revenue.net - costs.total) / revenue.net,
        contribution_margin: (revenue.net - costs.cogs) / revenue.net
      },
      
      daily_breakdown: await getDailyBreakdown(accounts, dateRange),
      cost_distribution: {
        cogs: costs.cogs,
        ad_spend: costs.advertising,
        fees: costs.fees + costs.shipping,
        other: costs.other
      }
    };
  }
};
```

#### Marketing Performance Report
```javascript
const MarketingPerformanceReport = {
  id: 'marketing_performance',
  name: 'Marketing Performance',
  description: 'Comprehensive analysis of all marketing channels and campaigns',
  category: 'marketing',
  
  sections: [
    {
      title: 'Channel Overview',
      metrics: [
        'total_ad_spend',
        'total_revenue_attributed',
        'overall_roas',
        'cost_per_acquisition',
        'conversion_rate'
      ]
    },
    {
      title: 'Platform Performance',
      breakdown_by: 'platform',
      metrics: [
        'spend',
        'clicks',
        'impressions',
        'conversions',
        'revenue',
        'roas',
        'cpa'
      ]
    },
    {
      title: 'Campaign Analysis',
      breakdown_by: 'campaign',
      metrics: [
        'spend',
        'revenue',
        'roas',
        'conversions'
      ],
      limit: 20
    }
  ],
  
  charts: [
    {
      type: 'bar',
      title: 'ROAS by Platform',
      x_axis: 'platform',
      y_axis: 'roas'
    },
    {
      type: 'line',
      title: 'Daily Ad Spend vs Revenue',
      metrics: ['ad_spend', 'attributed_revenue']
    },
    {
      type: 'funnel',
      title: 'Marketing Funnel',
      stages: ['impressions', 'clicks', 'sessions', 'conversions']
    }
  ],
  
  generateData: async ({ accounts, dateRange, filters }) => {
    const platforms = ['google_ads', 'meta_ads', 'tiktok_ads'];
    const platformData = {};
    
    for (const platform of platforms) {
      platformData[platform] = await getMarketingData(accounts, dateRange, platform);
    }
    
    const totalSpend = Object.values(platformData).reduce((sum, data) => sum + data.spend, 0);
    const totalRevenue = Object.values(platformData).reduce((sum, data) => sum + data.revenue, 0);
    
    return {
      summary: {
        total_ad_spend: totalSpend,
        total_revenue_attributed: totalRevenue,
        overall_roas: totalRevenue / totalSpend,
        cost_per_acquisition: totalSpend / Object.values(platformData).reduce((sum, data) => sum + data.conversions, 0),
        conversion_rate: calculateOverallConversionRate(platformData)
      },
      
      platform_breakdown: Object.entries(platformData).map(([platform, data]) => ({
        platform: platform.replace('_', ' ').toUpperCase(),
        spend: data.spend,
        clicks: data.clicks,
        impressions: data.impressions,
        conversions: data.conversions,
        revenue: data.revenue,
        roas: data.revenue / data.spend,
        cpa: data.spend / data.conversions
      })),
      
      top_campaigns: await getTopCampaigns(accounts, dateRange, 20),
      daily_trends: await getMarketingTrends(accounts, dateRange)
    };
  }
};
```

### Custom Report Builder

#### Report Builder Interface
```javascript
const CustomReportBuilder = () => {
  const [report, setReport] = useState({
    name: '',
    description: '',
    dateRange: { start: '', end: '' },
    accounts: [],
    metrics: [],
    dimensions: [],
    filters: [],
    charts: []
  });

  const availableMetrics = [
    { id: 'revenue', name: 'Revenue', category: 'sales', format: 'currency' },
    { id: 'orders', name: 'Orders', category: 'sales', format: 'number' },
    { id: 'aov', name: 'Average Order Value', category: 'sales', format: 'currency' },
    { id: 'ad_spend', name: 'Ad Spend', category: 'marketing', format: 'currency' },
    { id: 'roas', name: 'ROAS', category: 'marketing', format: 'number' },
    { id: 'cpa', name: 'Cost Per Acquisition', category: 'marketing', format: 'currency' },
    { id: 'conversion_rate', name: 'Conversion Rate', category: 'marketing', format: 'percentage' },
    { id: 'sessions', name: 'Sessions', category: 'traffic', format: 'number' },
    { id: 'bounce_rate', name: 'Bounce Rate', category: 'traffic', format: 'percentage' }
  ];

  const availableDimensions = [
    { id: 'date', name: 'Date' },
    { id: 'platform', name: 'Marketing Platform' },
    { id: 'campaign', name: 'Campaign' },
    { id: 'product', name: 'Product' },
    { id: 'customer_segment', name: 'Customer Segment' },
    { id: 'geographic_region', name: 'Geographic Region' }
  ];

  return (
    <div className="report-builder">
      <div className="builder-header">
        <h2>Create Custom Report</h2>
        <p>Build reports with the metrics and dimensions that matter to you</p>
      </div>

      <div className="builder-form">
        <div className="form-section">
          <label>Report Details</label>
          <input
            type="text"
            placeholder="Report Name"
            value={report.name}
            onChange={(e) => setReport(prev => ({ ...prev, name: e.target.value }))}
          />
          <textarea
            placeholder="Report Description"
            value={report.description}
            onChange={(e) => setReport(prev => ({ ...prev, description: e.target.value }))}
          />
        </div>

        <div className="form-section">
          <label>Date Range</label>
          <div className="date-range-inputs">
            <input
              type="date"
              value={report.dateRange.start}
              onChange={(e) => setReport(prev => ({
                ...prev,
                dateRange: { ...prev.dateRange, start: e.target.value }
              }))}
            />
            <span>to</span>
            <input
              type="date"
              value={report.dateRange.end}
              onChange={(e) => setReport(prev => ({
                ...prev,
                dateRange: { ...prev.dateRange, end: e.target.value }
              }))}
            />
          </div>
        </div>

        <div className="form-section">
          <label>Metrics</label>
          <div className="metrics-grid">
            {availableMetrics.map(metric => (
              <label key={metric.id} className="metric-option">
                <input
                  type="checkbox"
                  checked={report.metrics.includes(metric.id)}
                  onChange={(e) => toggleMetric(metric.id, e.target.checked)}
                />
                <div className="metric-info">
                  <span className="metric-name">{metric.name}</span>
                  <span className="metric-category">{metric.category}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="form-section">
          <label>Group By (Dimensions)</label>
          <div className="dimensions-list">
            {availableDimensions.map(dimension => (
              <label key={dimension.id} className="dimension-option">
                <input
                  type="checkbox"
                  checked={report.dimensions.includes(dimension.id)}
                  onChange={(e) => toggleDimension(dimension.id, e.target.checked)}
                />
                {dimension.name}
              </label>
            ))}
          </div>
        </div>

        <div className="form-section">
          <label>Charts</label>
          <div className="chart-builder">
            {report.charts.map((chart, index) => (
              <ChartConfigurer
                key={index}
                chart={chart}
                metrics={report.metrics}
                dimensions={report.dimensions}
                onChange={(updatedChart) => updateChart(index, updatedChart)}
                onRemove={() => removeChart(index)}
              />
            ))}
            <button className="btn btn-ghost" onClick={addChart}>
              + Add Chart
            </button>
          </div>
        </div>

        <div className="builder-actions">
          <button className="btn btn-ghost" onClick={previewReport}>
            Preview Report
          </button>
          <button className="btn btn-primary" onClick={generateReport}>
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
};
```

### Report Export System

#### PDF Report Generation
```javascript
const generatePDFReport = async (reportData, options = {}) => {
  const {
    template = 'standard',
    branding = {},
    includeCharts = true,
    includeTables = true,
    pageSize = 'A4'
  } = options;

  // Use Puppeteer to generate PDF from HTML template
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const htmlContent = await renderReportHTML(reportData, {
    template,
    branding,
    includeCharts,
    includeTables
  });

  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  
  const pdfBuffer = await page.pdf({
    format: pageSize,
    printBackground: true,
    margin: {
      top: '1in',
      right: '0.75in',
      bottom: '1in',
      left: '0.75in'
    }
  });

  await browser.close();
  return pdfBuffer;
};

const renderReportHTML = async (reportData, options) => {
  const { template, branding, includeCharts, includeTables } = options;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${reportData.name}</title>
      <style>
        ${getReportCSS(template)}
      </style>
    </head>
    <body>
      <div class="report-container">
        <header class="report-header">
          ${branding.logo_url ? `<img src="${branding.logo_url}" alt="Logo" class="company-logo">` : ''}
          <div class="report-title">
            <h1>${reportData.name}</h1>
            <p class="report-subtitle">${reportData.description}</p>
            <p class="report-date">${formatDateRange(reportData.dateRange)}</p>
          </div>
        </header>

        <main class="report-content">
          ${renderExecutiveSummary(reportData.summary)}
          
          ${includeCharts ? renderCharts(reportData.charts) : ''}
          
          ${includeTables ? renderTables(reportData.tables) : ''}
          
          ${renderDetailedMetrics(reportData.metrics)}
        </main>

        <footer class="report-footer">
          <p>Generated by Slay Season • ${new Date().toLocaleDateString()}</p>
        </footer>
      </div>
    </body>
    </html>
  `;
};
```

#### Scheduled Report System
```javascript
class ScheduledReportManager {
  constructor() {
    this.schedules = new Map();
  }

  async createSchedule(userId, reportConfig, schedule) {
    const scheduleId = generateUUID();
    const scheduleData = {
      id: scheduleId,
      user_id: userId,
      report_config: reportConfig,
      schedule: schedule, // { frequency: 'weekly', day: 'monday', time: '09:00' }
      is_active: true,
      next_run: this.calculateNextRun(schedule),
      created_at: new Date()
    };

    await this.saveSchedule(scheduleData);
    this.scheduleNextRun(scheduleData);
    
    return scheduleId;
  }

  calculateNextRun(schedule) {
    const now = new Date();
    
    switch (schedule.frequency) {
      case 'daily':
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(parseInt(schedule.time.split(':')[0]), 
                         parseInt(schedule.time.split(':')[1]), 0, 0);
        return tomorrow;
        
      case 'weekly':
        const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const targetDay = daysOfWeek.indexOf(schedule.day.toLowerCase());
        const daysUntilTarget = (targetDay - now.getDay() + 7) % 7;
        
        const nextWeek = new Date(now);
        nextWeek.setDate(now.getDate() + (daysUntilTarget === 0 ? 7 : daysUntilTarget));
        nextWeek.setHours(parseInt(schedule.time.split(':')[0]), 
                         parseInt(schedule.time.split(':')[1]), 0, 0);
        return nextWeek;
        
      case 'monthly':
        const nextMonth = new Date(now);
        nextMonth.setMonth(now.getMonth() + 1, schedule.day_of_month || 1);
        nextMonth.setHours(parseInt(schedule.time.split(':')[0]), 
                          parseInt(schedule.time.split(':')[1]), 0, 0);
        return nextMonth;
        
      default:
        throw new Error(`Unsupported frequency: ${schedule.frequency}`);
    }
  }

  async executeScheduledReport(scheduleId) {
    const schedule = await this.getSchedule(scheduleId);
    
    try {
      // Generate report data
      const reportData = await this.generateReportData(schedule.report_config);
      
      // Generate PDF
      const pdfBuffer = await generatePDFReport(reportData, schedule.report_config.export_options);
      
      // Save to storage
      const reportUrl = await this.saveReportFile(pdfBuffer, schedule.id);
      
      // Send email with attachment
      await this.emailReport({
        user_id: schedule.user_id,
        report_name: schedule.report_config.name,
        report_url: reportUrl,
        pdf_buffer: pdfBuffer
      });
      
      // Update next run time
      schedule.next_run = this.calculateNextRun(schedule.schedule);
      schedule.last_run = new Date();
      await this.updateSchedule(schedule);
      
      // Schedule next run
      this.scheduleNextRun(schedule);
      
    } catch (error) {
      console.error('Failed to execute scheduled report:', error);
      // TODO: Send error notification to user
    }
  }
}
```

### White-Label Reports

#### Agency Report Template
```javascript
const AgencyReportTemplate = {
  name: 'Client Performance Report',
  description: 'Professional client-facing report with agency branding',
  
  branding_options: {
    logo_upload: true,
    color_scheme: true,
    company_name: true,
    contact_info: true,
    remove_slay_season_attribution: true // Premium feature
  },
  
  sections: [
    {
      id: 'executive_summary',
      name: 'Executive Summary',
      required: true,
      content: [
        'period_overview',
        'key_achievements',
        'recommendations'
      ]
    },
    {
      id: 'performance_metrics',
      name: 'Performance Metrics',
      required: true,
      content: [
        'revenue_growth',
        'order_volume',
        'customer_acquisition',
        'retention_rates'
      ]
    },
    {
      id: 'marketing_analysis',
      name: 'Marketing Analysis',
      required: false,
      content: [
        'channel_performance',
        'roas_analysis',
        'campaign_highlights',
        'creative_performance'
      ]
    },
    {
      id: 'recommendations',
      name: 'Strategic Recommendations',
      required: false,
      content: [
        'optimization_opportunities',
        'budget_allocation',
        'next_month_priorities'
      ]
    }
  ],
  
  generateExecutiveSummary: (data) => {
    const revenueGrowth = ((data.current_revenue - data.previous_revenue) / data.previous_revenue * 100).toFixed(1);
    const orderGrowth = ((data.current_orders - data.previous_orders) / data.previous_orders * 100).toFixed(1);
    
    return {
      period_overview: `During ${data.period_name}, your store generated $${data.current_revenue.toLocaleString()} in revenue across ${data.current_orders} orders, representing ${revenueGrowth > 0 ? 'growth' : 'a decline'} of ${Math.abs(revenueGrowth)}% compared to the previous period.`,
      
      key_achievements: data.achievements.map(achievement => ({
        metric: achievement.metric,
        value: achievement.value,
        description: achievement.description
      })),
      
      recommendations: data.recommendations.slice(0, 3) // Top 3 recommendations
    };
  }
};
```

### Data Export Options

#### CSV Export Implementation
```javascript
const generateCSVExport = async (reportData, options = {}) => {
  const { 
    include_summary = true,
    include_daily_breakdown = true,
    include_product_details = false,
    date_format = 'MM/DD/YYYY'
  } = options;

  const csvData = [];
  
  // Summary section
  if (include_summary && reportData.summary) {
    csvData.push(['Summary Metrics', '', '']);
    csvData.push(['Metric', 'Value', 'Change vs Previous']);
    
    Object.entries(reportData.summary).forEach(([metric, data]) => {
      csvData.push([
        formatMetricName(metric),
        formatMetricValue(data.value, data.format),
        data.change ? `${data.change > 0 ? '+' : ''}${data.change.toFixed(1)}%` : 'N/A'
      ]);
    });
    
    csvData.push(['', '', '']); // Empty row separator
  }
  
  // Daily breakdown
  if (include_daily_breakdown && reportData.daily_data) {
    csvData.push(['Daily Breakdown', '', '']);
    const headers = ['Date', 'Revenue', 'Orders', 'AOV', 'Ad Spend', 'ROAS'];
    csvData.push(headers);
    
    reportData.daily_data.forEach(day => {
      csvData.push([
        formatDate(day.date, date_format),
        day.revenue.toFixed(2),
        day.orders.toString(),
        day.aov.toFixed(2),
        day.ad_spend.toFixed(2),
        day.roas.toFixed(2)
      ]);
    });
  }
  
  // Convert to CSV string
  return csvData.map(row => 
    row.map(cell => 
      typeof cell === 'string' && cell.includes(',') 
        ? `"${cell}"` 
        : cell
    ).join(',')
  ).join('\n');
};
```

---

## Forecasting Engine

### Revenue Forecasting Models

#### Time Series Forecasting Implementation
```javascript
class RevenueForecastModel {
  constructor(accountId, options = {}) {
    this.accountId = accountId;
    this.horizon = options.horizon || 90; // days
    this.confidenceLevel = options.confidenceLevel || 0.90;
    this.seasonalityEnabled = options.seasonalityEnabled ?? true;
    this.model = null;
  }

  async trainModel(historicalData) {
    // Prepare training data
    const trainingData = this.prepareTrainingData(historicalData);
    
    // Apply seasonality detection
    const seasonalComponents = this.seasonalityEnabled 
      ? this.detectSeasonality(trainingData)
      : null;
    
    // Train multiple models and ensemble
    const models = await Promise.all([
      this.trainLinearTrend(trainingData),
      this.trainMovingAverage(trainingData),
      this.trainExponentialSmoothing(trainingData),
      this.trainARIMA(trainingData)
    ]);
    
    // Select best model based on validation performance
    this.model = this.selectBestModel(models, trainingData);
    this.model.seasonalComponents = seasonalComponents;
    
    return this.model;
  }

  async generateForecast(startDate, endDate) {
    if (!this.model) {
      throw new Error('Model not trained. Call trainModel() first.');
    }

    const forecastDays = this.calculateDaysBetween(startDate, endDate);
    const baseForecast = this.model.predict(forecastDays);
    
    // Apply seasonality adjustments
    const seasonalAdjusted = this.applySeasonalityAdjustments(baseForecast, startDate);
    
    // Calculate confidence intervals
    const confidenceIntervals = this.calculateConfidenceIntervals(
      seasonalAdjusted, 
      this.confidenceLevel
    );
    
    // Format output
    return this.formatForecastOutput(seasonalAdjusted, confidenceIntervals, startDate);
  }

  prepareTrainingData(rawData) {
    // Convert to daily time series
    const dailyData
---

## Pricing & Monetization

### Core Principles
- **Full transparency** — no hidden costs, no surprise charges, ever
- **No contracts** — cancel anytime, no lock-ins, no cancellation fees
- **7-day free trial** — full access to all features, no credit card required
- **Not happy? Talk to us** — schedule a call with our team for help + get 7 extra days free
- **Human onboarding support** — every user can talk to a real person to get set up

### Pricing Tiers

| Feature | Starter ($49/mo) | Growth ($149/mo) | Scale ($399/mo) |
|---------|------------------|-------------------|-------------------|
| Stores | 1 | 3 | Unlimited |
| Platforms | 3 | All | All |
| Custom Dashboards | 3 | 10 | Unlimited |
| Widget Library | Basic | Full | Full + Custom |
| Forecasting | Basic | Advanced + Scenarios | Advanced + AI |
| Reports | Pre-built | Custom + Scheduled | White-label |
| Notifications | Email only | Email + Push | Email + Push + Watch |
| Data Refresh | 30 min | 15 min | 5 min (real-time) |
| Support | Email | Priority + Chat | Dedicated + Phone |
| API Access | — | — | ✅ |
| Annual Discount | $39/mo (20% off) | $119/mo (20% off) | $319/mo (20% off) |

### Trust & Transparency Messaging
- "No contracts. No hidden fees. Cancel anytime."
- "Try free for 7 days. No credit card needed."
- "Not loving it? Talk to our team — we'll help you get set up and give you 7 more days."
- "Your data, your way. Export everything, anytime."

### Revenue Model
- Primary: Monthly/annual subscriptions
- Secondary: Shopify App Store distribution (Shopify takes 0% on first $1M)
- Future: Marketplace for custom widgets/templates, API usage tiers

---

## Competitive Analysis

### Market Position

| Competitor | Price | Strengths | Weaknesses | Our Edge |
|-----------|-------|-----------|------------|----------|
| Triple Whale | $35-65/mo | Pixel tracking, attribution | Complex, expensive at scale | Simpler, fun, customizable |
| BeProfit | $49/mo | Shopify-native, good P&L | Limited ad platform data | Multi-platform, better design |
| Lifetimely | $19-99/mo | LTV focus, affordable | Narrow feature set | Broader analytics + forecasting |
| Polar Analytics | $300+/mo | Enterprise features | Expensive, complex | Accessible pricing, same power |
| Northbeam | $1000+/mo | Advanced attribution | Enterprise only | SMB-friendly, 10x cheaper |

### Our Competitive Edge
1. **Design** — Apple-level quality that competitors don't have
2. **Customization** — Widget dashboard that no competitor offers
3. **Fun** — Brand personality that makes data enjoyable
4. **Transparency** — No contracts, no hidden costs
5. **Human touch** — Real onboarding support at every tier
6. **Price** — Enterprise features at SMB pricing

---

## Phased Roadmap

### Phase 1: Foundation (Week 1)
- Finalize PRD and design system
- Component library (Shadcn/UI + custom widgets)
- New auth system with multi-provider OAuth
- Guided onboarding wizard
- Light theme implementation

### Phase 2: Dashboard Engine (Week 2)
- Widget system (drag, drop, resize, save)
- Widget library (20+ widgets)
- Dashboard templates
- Layout persistence per user
- Big & bold data visualization components

### Phase 3: Backend Overhaul (Week 3)
- Multi-account OAuth (Meta, Google, GA4)
- Comprehensive data fetching for all platforms
- Reporting engine with custom reports
- Data accuracy improvements (target: 98%+ vs native)
- API v2 endpoints

### Phase 4: Intelligence (Week 4)
- Forecasting v2 with scenario planning
- AI-powered insights and anomaly detection
- Notification system (push, email, watch)
- Alert rules engine
- Smart digest system

### Phase 5: Polish & Launch (Week 5)
- End-to-end QA
- Performance optimization (<2s load)
- Landing page refresh
- Documentation
- Production deployment
- Monitor and iterate

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Build complexity exceeds timeline | High | High | Phased delivery, MVP first |
| Multi-account OAuth edge cases | Medium | High | Extensive testing, graceful fallbacks |
| Data accuracy below 98% | Medium | High | Cross-validation with native dashboards |
| Widget system performance with many widgets | Medium | Medium | Virtual rendering, lazy loading |
| User adoption of customization | Low | Medium | Great defaults + templates |

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Time to Value | < 5 minutes | Signup to first real data view |
| Dashboard Load Time | < 2 seconds | Lighthouse + real user monitoring |
| Data Accuracy | > 98% | Compare vs native platform dashboards |
| 30-day Retention | > 60% | Cohort analysis |
| NPS | > 50 | In-app survey at day 14 |
| Trial → Paid Conversion | > 15% | Stripe analytics |
| Monthly Churn | < 5% | Subscription analytics |

---

*End of Document*
*Slay Season PRD v2.0 — February 2026*
