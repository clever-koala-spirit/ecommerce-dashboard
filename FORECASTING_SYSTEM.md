# Complete Forecasting & Predictive Analytics Engine

## Overview

A complete client-side forecasting system for the ecommerce dashboard with no external dependencies or Python backend. All forecasting, optimization, and insights are computed in pure JavaScript.

## Architecture

### Core Libraries

#### 1. `/src/utils/forecast.js` (15 KB)

Pure JavaScript time series forecasting engine with multiple algorithms:

**Methods:**
- **`movingAverage(data, window)`** - Simple moving average smoothing
- **`exponentialSmoothing(data, alpha)`** - Single exponential smoothing with auto-optimized alpha
- **`doubleExponentialSmoothing(data, alpha, beta)`** - Holt's method capturing level + trend
- **`holtWinters(data, seasonLength, alpha, beta, gamma)`** - Triple exponential smoothing for level + trend + seasonality
- **`linearRegression(data)`** - Least squares fitting with R² calculation
- **`detectSeasonality(data)`** - Auto-detects weekly (7) or monthly (30) patterns via autocorrelation
- **`detectAnomalies(data, threshold)`** - Z-score based anomaly detection

**Main API:**
```javascript
forecast(historicalData, horizon, options = {})
// Returns: {
//   values: [{date, predicted, lower, upper}, ...],
//   method: 'auto'|'holt_winters'|'double_exponential'|'exponential'|'linear',
//   confidence: 0.95,
//   metrics: { mape, rmse, mae },
//   seasonality: 7|30|null,
//   trend: 'up'|'down'|'flat',
//   trendValue: number,
//   dataPoints: number,
//   fitted: [{date, value}, ...]
// }
```

**Algorithm Selection (Auto Mode):**
1. If data >= 60 points AND seasonality detected → Holt-Winters
2. Else if data >= 14 points → Double Exponential Smoothing
3. Else if data >= 7 points → Exponential Smoothing
4. Else → Linear Regression

**Accuracy Metrics:**
- MAPE: Mean Absolute Percentage Error (used for holdout set)
- RMSE: Root Mean Squared Error
- MAE: Mean Absolute Error
- Tested on last 20% of historical data

**Confidence Intervals:**
- Dynamically widening bands based on residual standard deviation
- Z-scores: 80% (1.28), 90% (1.645), 95% (1.96), 99% (2.576)
- Accounts for horizon uncertainty

#### 2. `/src/utils/budgetOptimizer.js` (12 KB)

Budget allocation simulator and optimizer:

**Functions:**
- **`simulateScenario(channelBudgets, historicalData)`** - Project revenue/ROAS/CPA/profit for given budget allocation
- **`findOptimalAllocation(totalBudget, historicalData, constraints)`** - Gradient-based optimizer (100 iterations max)
- **`diminishingReturnsModel(spendData, revenueData)`** - Fit power/log curves to model diminishing returns per channel
- **`calculateBreakeven(fixedCosts, variableCostRate, aov)`** - Break-even analysis
- **`calculateBudgetShiftImpact(currentAllocation, fromChannel, toChannel, shiftAmount, historicalData)`** - What-if analysis

**Optimization Algorithm:**
- Iterates through channel pairs, testing budget shifts
- Uses gradient direction to find local optimum
- Respects constraints (min/max per channel)
- 100 iteration limit with early exit

### UI Components

#### 1. `RevenueForecastChart.jsx`

**Features:**
- Solid blue line for actual revenue
- Dashed purple line for forecasted revenue
- Shaded purple confidence band (95% CI)
- Horizon toggles: 7d, 14d, 30d, 60d, 90d
- Monthly projection summary cards
- Accuracy badge (MAPE%)
- Trend direction indicator (Up/Down/Flat)
- Custom tooltip with confidence range
- Recharts ComposedChart with Area + Line

**Data Flow:**
1. Reads shopify data from store filtered by date range
2. Runs forecast(data, horizon, {method: 'auto', confidence: 0.95})
3. Combines historical and forecast data
4. Calculates monthly projections from forecast values

#### 2. `ChannelForecastChart.jsx`

**Features:**
- Per-channel lines (Meta, Google, Klaviyo, Organic)
- Solid for actual, dashed for predicted
- Toggle channels on/off
- Next-30d projection table per channel
- Trend indicators per channel
- Recharts LineChart with multiple Line components

**Data Structure:**
- Combines shopify, meta, google, klaviyo, ga4 data by date
- Runs independent forecast for each channel
- Merges historical and forecast data

#### 3. `BudgetSimulator.jsx`

**Features:**
- Sliders for Meta, Google, TikTok monthly budgets ($0-50k each)
- Live-updating projections:
  - Total Budget
  - Projected Revenue
  - Projected ROAS
  - Projected CPA
  - Projected Profit & Margin
- "Optimize" button (auto-finds best allocation)
- Diminishing returns curve visualization per channel (small inline charts)
- Budget shift impact suggestion ($X from Meta to Google, projected impact)
- Current vs optimized scenario display

**Smart Features:**
- Uses historical ROAS/CPA from meta/google data
- TikTok metrics estimated (2.8x ROAS typical)
- Profit calculation: Revenue - COGS(40%) - Fees(8%) - Ad Spend
- Gradient-based optimizer finds allocations that maximize profit

#### 4. `ProfitForecast.jsx`

**Features:**
- Three-column scenario table:
  - Conservative (using lower confidence bound)
  - Expected (using predicted value)
  - Optimistic (using upper confidence bound)
- Rows: Revenue, COGS, Ad Spend, Platform Costs, Shipping, Fees, Fixed Costs, Other, Net Profit, Net Margin %
- 60-day cumulative cash flow area chart
- Break-even reference line
- Color-coded profit rows (green/red)

**Calculations:**
- Revenue from forecast
- COGS: % based on historical ratio
- Shipping, Fees: % based on historical
- Fixed Costs: from useStore fixedCosts
- Profit: Revenue - All Costs
- Margin: Profit / Revenue × 100%

#### 5. `GoalTracker.jsx`

**Features:**
- Editable monthly revenue and profit targets (localStorage backed)
- Progress bars for both metrics
- Current month progress tracking
- Days remaining in month
- Projected month-end values
- Probability of hitting goal (calculated from forecast confidence intervals)
- Status badge: "Ahead" / "On Pace" / "Behind"
- Contextual insights based on status

**Logic:**
- Uses forecast for remaining days in month
- Combines current month actuals + forecast remainder
- Calculates probability from confidence bounds
- Status determined by (progress % / days remaining) vs (100% / days remaining)

#### 6. `InsightsEngine.jsx`

**Features:**
- Automated rule-based insights (no LLM needed)
- 8 insight types detected:
  1. **Revenue Anomalies**: Z-score > 2.5 (2-3 std devs)
  2. **Decline Trends**: 4+ days declining revenue
  3. **Improvement Trends**: 3+ consecutive days growth
  4. **Channel Comparisons**: Google vs Meta ROAS/CPA
  5. **Conversion Metrics**: Drop > 15% from 30d average
  6. **Refund Alerts**: Rate > 5% industry benchmark
  7. **Email Performance**: Revenue share > 18%
  8. **AOV Growth**: 8%+ increase week-over-week
- Color-coded by severity: Critical/Warning/Info/Success
- Synced to Zustand insightSlice on render
- Displays up to 8 insights with "showing X of Y" footer

**Insight Structure:**
```javascript
{
  id: 'unique-id',
  severity: 'info'|'warning'|'critical'|'success',
  title: 'Human-readable title',
  body: 'Detailed explanation',
  action: 'Suggested action',
  timestamp: Date,
  metric: 'metric-name'
}
```

#### 7. `ForecastPage.jsx` (Updated)

**Layout:**
```
┌─ Header ─────────────────────────────────┐
│ Forecasting & Predictive Analytics      │
└─────────────────────────────────────────┘
┌─ GoalTracker ───────────────────────────┐ Full width
│ Revenue & Profit Goals with Progress    │
└─────────────────────────────────────────┘
┌─ Revenue (2/3) ─┬─ Profit Forecast (1/3) ┐
│ Main forecast   │ 3-scenario table +     │
│ chart + monthly │ 60d cash flow chart    │
│ projections     │                        │
└─────────────────┴────────────────────────┘
┌─ Channel Forecast ───────────────────────┐ Full width
│ Per-channel lines + 30d projections      │
└─────────────────────────────────────────┘
┌─ Budget Simulator ───────────────────────┐ Full width
│ Interactive sliders + live projections   │
└─────────────────────────────────────────┘
┌─ Insights ───────────────────────────────┐ Full width
│ Auto-generated insights from data        │
└─────────────────────────────────────────┘
```

## Key Algorithms & Technical Details

### 1. Holt-Winters Seasonal Decomposition

```javascript
// Level: weighted average of deseasonalized observation
// Trend: weighted average of previous trend
// Seasonality: weighted proportion of observation to level

// Forecast: (Level + h*Trend) * Seasonal[t+h mod season_length]
```

Used when:
- Data >= 60 points
- Seasonality detected (correlation > 0.5 at lag 7 or 30)

### 2. Double Exponential Smoothing (Holt's Method)

```javascript
// Level: α*X_t + (1-α)*(L_{t-1} + T_{t-1})
// Trend: β*(L_t - L_{t-1}) + (1-β)*T_{t-1}

// Forecast: L_t + h*T_t (extends linearly)
```

Used when:
- Data >= 14 points
- No strong seasonality detected

### 3. Confidence Interval Calculation

```javascript
// Residual Std Dev: sqrt(sum((X_t - Fitted_t)²) / (n-1))
// Margin of Error: z_score * σ_residual * sqrt(horizon)
// Upper: Predicted + MOE
// Lower: max(0, Predicted - MOE)
```

Intervals widen with horizon due to sqrt(h) factor.

### 4. Budget Optimization Algorithm

```javascript
// Current: simulate(allocation_0)
// For each iteration:
//   For each channel pair (i, j):
//     Test: budget_i -= step, budget_j += step
//     If simulate(test).profit > best:
//       Update best_allocation
//       Continue
//   If no improvement: break early
```

Step size: $500, max iterations: 100

### 5. Anomaly Detection

```javascript
// Z-score = abs((value - mean) / std_dev)
// Anomalies: z-score > threshold (default 2)
```

Identifies outlier days for further investigation.

## Data Integration

### Data Sources
- **shopifyData**: Historical revenue, orders, AOV, COGS, shipping, fees
- **metaData**: Spend, revenue, ROAS, CPA by day
- **googleData**: Spend, conversions, ROAS, CPA by day
- **klaviyoData**: Email revenue by day
- **ga4Data**: Sessions by source, conversion rates

### Data Preparation
1. Filter by dateRange (handled by filterDataByDateRange)
2. Extract values array [revenue, revenue, ...]
3. Extract dates array [date, date, ...]
4. Pass to forecast() function

### Store Integration
- Reads from `useStore` for dateRange, fixedCosts
- Pushes insights to store via `addInsights()`
- Updates via `setHorizon()`, `setMethod()`

## Performance Optimizations

### Memoization
All components use `useMemo` to prevent unnecessary recalculations:
- Forecast computation expensive → memoized on `dateRange`, `horizon`
- Chart data generation → memoized
- Projections calculations → memoized

### Algorithm Efficiency
- Linear regression: O(n)
- Exponential smoothing: O(n)
- Holt-Winters: O(n) with season length storage
- Anomaly detection: O(n)
- Auto-optimization: O(100 * channels²) iterations

### Rendering
- All charts use Recharts ResponsiveContainer
- Custom tooltips for better UX
- No server calls (100% client-side)

## Edge Cases Handled

1. **Insufficient Data**
   - < 7 points: Show "insufficient data" message
   - < 14 points: Use exponential smoothing instead of double
   - Graceful degradation

2. **Zero/Negative Values**
   - COGS, revenue: Filtered to >= 0
   - Forecast predicted: Math.max(0, value)
   - CPA division by zero: Check conversions > 0

3. **Missing Data**
   - NaN handling in all calculations
   - Null value checks in UI
   - Default values for aggregations

4. **Edge Cases**
   - Empty date ranges: Return empty state with message
   - No seasonality detected: Fall back to exponential
   - Linear regression with slope 0: Handles flat trends

## Styling & Theme

- **Glass-card design**: bg-slate-800/50 with backdrop blur
- **Dark theme**: CSS variables (--color-text-primary, etc.)
- **Color consistency**: CHANNEL_COLORS, FORECAST_COLORS from utils/colors.js
- **Responsive**: Grid layouts with md/lg breakpoints
- **Accessibility**: Semantic HTML, proper ARIA labels

## Files Created

```
/src/utils/
  ├── forecast.js (15 KB) - Core forecasting engine
  └── budgetOptimizer.js (12 KB) - Budget optimization

/src/components/forecast/
  ├── RevenueForecastChart.jsx - Main revenue forecast
  ├── ChannelForecastChart.jsx - Per-channel forecasts
  ├── BudgetSimulator.jsx - What-if budget allocation
  ├── ProfitForecast.jsx - P&L with 3 scenarios
  ├── GoalTracker.jsx - Monthly goal tracking
  └── InsightsEngine.jsx - Auto-generated insights

/src/pages/
  └── ForecastPage.jsx (Updated) - Orchestrates all components
```

## Testing the System

### Manual Testing Checklist

1. **Revenue Forecast**
   - [ ] Change horizon (7d, 14d, 30d, 60d, 90d)
   - [ ] Verify accuracy metrics display
   - [ ] Check trend direction
   - [ ] Hover over chart to verify tooltip

2. **Channel Forecast**
   - [ ] Toggle each channel on/off
   - [ ] Verify 30d projections table
   - [ ] Check trend directions per channel

3. **Budget Simulator**
   - [ ] Adjust sliders for each channel
   - [ ] Verify live projection updates
   - [ ] Click "Optimize" button
   - [ ] Check diminishing returns curves

4. **Profit Forecast**
   - [ ] Verify 3 scenarios (conservative/expected/optimistic)
   - [ ] Check cumulative cash flow chart
   - [ ] Verify profit rows are color-coded

5. **Goal Tracker**
   - [ ] Edit revenue goal
   - [ ] Edit profit goal
   - [ ] Verify progress bars
   - [ ] Check probability calculation
   - [ ] Verify status badge (Ahead/On Pace/Behind)

6. **Insights**
   - [ ] Verify insights are displayed
   - [ ] Check severity color coding
   - [ ] Scroll to view all insights

## Future Enhancements

1. **Advanced Algorithms**
   - ARIMA (AutoRegressive Integrated Moving Average)
   - Prophet-style decomposition
   - Machine learning model training

2. **Export & Reporting**
   - PDF report generation
   - CSV export of forecasts
   - Scheduled email reports

3. **Scenario Planning**
   - Save multiple scenarios
   - Compare scenarios side-by-side
   - Monte Carlo simulations

4. **Real-time Adjustments**
   - Manual forecast overrides
   - User feedback loop
   - Model retraining

5. **Advanced Insights**
   - LLM-powered insight explanations
   - Recommended actions ranking
   - Root cause analysis

## API Reference

### forecast(historicalData, horizon, options)

```javascript
// Input
{
  historicalData: [
    { date: '2025-02-01', value: 1500.50 },
    { date: '2025-02-02', value: 1620.75 },
    ...
  ],
  horizon: 30,  // Days to forecast
  options: {
    method: 'auto',       // or 'holt_winters', 'double_exponential', etc
    confidence: 0.95,     // 0.80, 0.90, 0.95, 0.99
    seasonality: 'auto'   // or 7, 30, or null
  }
}

// Output
{
  values: [
    {
      date: '2025-03-03',
      predicted: 1650.25,
      lower: 1580.00,
      upper: 1720.50
    },
    ...
  ],
  method: 'holt_winters',
  confidence: 0.95,
  metrics: {
    mape: 12.34,  // Mean absolute percentage error
    rmse: 157.89,  // Root mean squared error
    mae: 95.12     // Mean absolute error
  },
  seasonality: 7,        // Weekly pattern detected
  trend: 'up',           // 'up', 'down', or 'flat'
  trendValue: 15.50,     // Daily trend magnitude
  dataPoints: 365,       // Historical data points
  fitted: [...]          // Fitted values for all historical data
}
```

### simulateScenario(channelBudgets, historicalData)

```javascript
// Input
{
  meta: 17500,
  google: 10000,
  tiktok: 5000
}

// Output
{
  totalSpend: 32500,
  totalRevenue: 91000,
  roas: 2.80,
  totalCPA: 58.93,
  profit: 28500,
  margin: 31.3,
  byChannel: {
    meta: {
      budget: 17500,
      revenue: 52500,
      roas: 3.00,
      purchases: 297
    },
    ...
  }
}
```

## Deployment Notes

- No additional dependencies required (uses existing Recharts, date-fns)
- All computation happens client-side
- No API calls to external services
- Works offline after initial data load
- localStorage used for goal preferences
- Zustand store integration seamless

## Known Limitations

1. **Short Time Series**: Minimum ~30 days recommended for reliable forecasts
2. **Structural Changes**: Doesn't detect permanent level shifts (rebranding, new product launch)
3. **External Events**: Can't account for unplanned disruptions (stock outs, viral campaigns)
4. **Multivariate**: Doesn't model relationships between metrics (e.g., traffic → revenue)
5. **Very Long Horizons**: Forecasts 90+ days become highly uncertain

## Maintenance

- Update mock data in `/mock/mockData.js` with real API data
- Tune alpha/beta/gamma parameters if needed (defaults are reasonable)
- Monitor MAPE scores - if > 25%, may need more data or different method
- Test with seasonal data (holiday periods) quarterly

---

**Built with:** Pure JavaScript, Recharts, Zustand, date-fns
**Deployment:** Ready for production - no backend required
**Last Updated:** February 7, 2025
