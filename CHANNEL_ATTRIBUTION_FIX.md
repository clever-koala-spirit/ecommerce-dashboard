# Channel Performance Attribution Fix
**Priority:** HIGH - Current ROAS calculations are completely wrong

## Current Problem
The Channel Performance table uses **platform-reported revenue** instead of **Shopify order attribution**:

```javascript
// WRONG - Uses platform revenue (Meta's tracking)
metaRevenue = filteredMeta.reduce((sum, d) => sum + (d.revenue || 0), 0)

// WRONG - Uses Google's conversion values
googleRevenue = filteredGoogle.reduce((sum, d) => sum + (d.conversionValue || 0), 0)

// WRONG - Estimates based on GA4 sessions
organicRevenue = ga4Data * (organicSessions / totalSessions)
```

## Correct Approach
**Revenue should come from Shopify orders attributed to each channel:**

```javascript
// CORRECT - Shopify orders attributed to Meta
metaRevenue = shopifyOrders.filter(order => order.source === 'meta').reduce(...)

// CORRECT - Shopify orders attributed to Google  
googleRevenue = shopifyOrders.filter(order => order.source === 'google').reduce(...)
```

## Implementation Options

### Option 1: UTM Parameter Tracking (Recommended)
**Pros:** Simple, reliable, works with all platforms  
**Cons:** Requires UTM discipline in ad campaigns

**Steps:**
1. **Add UTM tracking to all ads:**
   - Meta: `utm_source=meta&utm_medium=paid-social&utm_campaign={campaign_name}`
   - Google: `utm_source=google&utm_medium=paid-search&utm_campaign={campaign_name}`

2. **Capture UTM in Shopify orders:**
   - Add script to store UTM parameters in session
   - Pass UTM data to Shopify checkout as order attributes
   - Store in database: `{orderId, utmSource, utmMedium, utmCampaign}`

3. **Update Channel Performance calculations:**
   ```javascript
   const metaOrders = shopifyData.filter(order => order.utmSource === 'meta')
   const metaRevenue = metaOrders.reduce((sum, order) => sum + order.revenue, 0)
   const metaROAS = metaSpend > 0 ? metaRevenue / metaSpend : 0
   ```

### Option 2: Platform Pixel Tracking
**Pros:** More accurate, handles multi-touch attribution  
**Cons:** Complex setup, privacy concerns, platform-dependent

**Steps:**
1. **Meta Pixel Integration:**
   - Add Meta Pixel to website
   - Track 'Purchase' events with order details
   - Match pixel conversions to Shopify orders via customer email

2. **Google Analytics Enhanced Ecommerce:**
   - Track purchases with transaction IDs
   - Match GA4 events to Shopify orders

### Option 3: Simple Time-Based Attribution
**Pros:** Easy to implement, no external dependencies  
**Cons:** Less accurate, assumptions-based

**Steps:**
1. **Attribute orders to active campaigns:**
   - If Meta spent money on date X, attribute % of orders to Meta
   - Weight by spend amount and historical performance

## Recommended Implementation Plan

### Phase 1: UTM Foundation (Week 1)
1. **Update all ad campaigns with UTMs**
2. **Add UTM capture script to website**
3. **Store UTM data in order attributes**

### Phase 2: Attribution Logic (Week 1-2)
1. **Modify Shopify service** to pull order attribution data
2. **Update Channel Performance component** with correct calculations
3. **Add fallback logic** for orders without attribution

### Phase 3: Testing & Validation (Week 2)
1. **Compare dashboard vs platform data**
2. **Verify ROAS calculations**
3. **Fix any discrepancies**

## Technical Changes Required

### 1. Frontend JavaScript (UTM Capture)
```javascript
// Add to website header - capture and store UTMs
function captureUTMParameters() {
  const urlParams = new URLSearchParams(window.location.search);
  const utmData = {
    source: urlParams.get('utm_source'),
    medium: urlParams.get('utm_medium'),
    campaign: urlParams.get('utm_campaign'),
    term: urlParams.get('utm_term'),
    content: urlParams.get('utm_content')
  };
  
  if (utmData.source) {
    sessionStorage.setItem('utm_data', JSON.stringify(utmData));
  }
}
```

### 2. Shopify Checkout (Order Attribution)
```javascript
// Pass UTM data to Shopify order attributes
const utmData = JSON.parse(sessionStorage.getItem('utm_data') || '{}');
if (utmData.source) {
  Shopify.Checkout.setAttributes({
    'utm_source': utmData.source,
    'utm_medium': utmData.medium,
    'utm_campaign': utmData.campaign
  });
}
```

### 3. Backend Service (server/services/shopify.js)
```javascript
// Update buildOrdersQuery to include order attributes
const query = `
  query {
    orders(...) {
      edges {
        node {
          id
          name
          customAttributes {
            key
            value
          }
          // ... existing fields
        }
      }
    }
  }
`;

// Update normalizeOrder to extract attribution
normalizeOrder(order) {
  const utmSource = order.customAttributes?.find(attr => attr.key === 'utm_source')?.value;
  const utmCampaign = order.customAttributes?.find(attr => attr.key === 'utm_campaign')?.value;
  
  return {
    // ... existing fields
    attribution: {
      source: utmSource || 'direct',
      campaign: utmCampaign || null
    }
  };
}
```

### 4. Frontend Component (ChannelPerformanceTable.jsx)
```javascript
// Replace broken logic with proper attribution
const channelData = useMemo(() => {
  const shopifyData = filterDataByDateRange(shopifyData || [], dateRange);
  
  // Group orders by attribution source
  const attributedRevenue = shopifyData.reduce((acc, day) => {
    day.orders?.forEach(order => {
      const source = order.attribution?.source || 'direct';
      acc[source] = (acc[source] || 0) + order.revenue;
    });
    return acc;
  }, {});
  
  // Calculate ROAS with attributed revenue
  const metaROAS = metaSpend > 0 ? (attributedRevenue.meta || 0) / metaSpend : 0;
  const googleROAS = googleSpend > 0 ? (attributedRevenue.google || 0) / googleSpend : 0;
  
  return [
    {
      name: 'Meta Ads',
      spend: metaSpend,
      revenue: attributedRevenue.meta || 0, // Real attributed revenue
      roas: metaROAS
    },
    // ... other channels
  ];
}, [shopifyData, metaData, googleData]);
```

## Testing Strategy

### 1. Validation Tests
- **UTM Capture:** Test UTM parameters are stored correctly
- **Attribution Accuracy:** Compare attributed orders vs platform data
- **ROAS Verification:** Manual calculation vs dashboard display

### 2. Data Quality Checks
- **Attribution Rate:** % of orders with valid source attribution
- **Revenue Matching:** Total attributed revenue = total Shopify revenue
- **Time Window:** Orders attributed within reasonable time of ad click

## Success Metrics
- **Attribution Coverage:** >80% of orders have source attribution
- **ROAS Accuracy:** Dashboard ROAS within 10% of platform ROAS
- **Revenue Reconciliation:** Total attributed revenue = Shopify total revenue

---

**Note:** This fix should be implemented AFTER Leo reconnects Meta Ads and re-authorizes Shopify app with inventory permissions.