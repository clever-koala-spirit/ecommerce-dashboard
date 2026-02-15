/**
 * Server-side mock data - simplified (no date-fns dependency)
 * Built in separate arrays to avoid self-reference during initialization.
 */

function generateDateArray(days = 365) {
  const dates = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
}

function getSeasonalMultiplier(dateStr) {
  const date = new Date(dateStr);
  const month = date.getMonth();
  const dayOfWeek = date.getDay();

  let monthMultiplier = 1;
  if (month === 11) monthMultiplier = 2.0;
  else if (month === 0) monthMultiplier = 0.8;
  else if (month === 1) monthMultiplier = 1.1;
  else if (month === 10) {
    const dayOfMonth = date.getDate();
    if (dayOfMonth >= 23 && dayOfMonth <= 30) monthMultiplier = 4.0;
    else monthMultiplier = 1.2;
  }

  const weeklyMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 1.25 : 0.95;
  return monthMultiplier * weeklyMultiplier;
}

function addNoise(value, variance = 0.12) {
  const noise = 1 + (Math.random() - 0.5) * variance;
  return Math.max(0, value * noise);
}

const dates = generateDateArray(365);
const baseShopifyRevenue = 45000;
const baseMetaSpend = 17500;
const baseGoogleSpend = 10000;
const baseTikTokSpend = 8500;

// Build each array separately to avoid self-reference
const shopifyData = dates.map((date, index) => {
  const growthFactor = 1 + (index / 365) * 0.15;
  const seasonalMultiplier = getSeasonalMultiplier(date);
  const dailyRevenue = addNoise(
    (baseShopifyRevenue / 30) * growthFactor * seasonalMultiplier, 0.15
  );
  const orders = Math.max(15, Math.floor(addNoise((dailyRevenue / 85) * (1 + Math.random() * 0.1), 0.2)));
  const aov = dailyRevenue / Math.max(1, orders);
  const refundRate = 0.03 + Math.random() * 0.02;
  const refunds = Math.floor(orders * refundRate);
  const refundAmount = refunds * aov * (0.75 + Math.random() * 0.25);
  const cogs = dailyRevenue * (0.35 + Math.random() * 0.05);
  const shipping = orders * (3.5 + Math.random() * 1.5);
  const transactionFees = dailyRevenue * (0.029 + 0.3 / 100);
  const newCustomers = Math.max(2, Math.floor(orders * (0.3 + Math.random() * 0.1)));
  const returningCustomers = orders - newCustomers;

  return {
    date, orders,
    revenue: Math.round(dailyRevenue * 100) / 100,
    refunds, refundAmount: Math.round(refundAmount * 100) / 100,
    aov: Math.round(aov * 100) / 100,
    cogs: Math.round(cogs * 100) / 100,
    shipping: Math.round(shipping * 100) / 100,
    transactionFees: Math.round(transactionFees * 100) / 100,
    newCustomers, returningCustomers,
  };
});

const metaData = dates.map((date, index) => {
  const growthFactor = 1 + (index / 365) * 0.15;
  const seasonalMultiplier = getSeasonalMultiplier(date);
  const dailySpend = addNoise((baseMetaSpend / 30) * growthFactor * seasonalMultiplier, 0.2);
  const impressions = Math.floor(addNoise(dailySpend * (450 + Math.random() * 100), 0.15));
  const clicks = Math.floor(impressions * (0.01 + Math.random() * 0.02));
  const cpm = (dailySpend / impressions) * 1000;
  const ctr = (clicks / impressions) * 100;
  const purchases = Math.max(1, Math.floor(clicks * (0.08 + Math.random() * 0.04)));
  const purchaseRevenue = purchases * (65 + Math.random() * 40);
  const roas = purchaseRevenue / dailySpend;

  return {
    date,
    spend: Math.round(dailySpend * 100) / 100,
    impressions, cpm: Math.round(cpm * 100) / 100,
    ctr: Math.round(ctr * 100) / 100, clicks, purchases,
    revenue: Math.round(purchaseRevenue * 100) / 100,
    roas: Math.round(roas * 100) / 100,
    cpa: Math.round((dailySpend / Math.max(1, purchases)) * 100) / 100,
  };
});

const googleData = dates.map((date, index) => {
  const growthFactor = 1 + (index / 365) * 0.15;
  const seasonalMultiplier = getSeasonalMultiplier(date);
  const dailySpend = addNoise((baseGoogleSpend / 30) * growthFactor * seasonalMultiplier, 0.2);
  const clicks = Math.floor(addNoise(dailySpend * (70 + Math.random() * 30), 0.15));
  const impressions = Math.floor(clicks / (0.03 + Math.random() * 0.02));
  const cpc = clicks > 0 ? dailySpend / clicks : 0;
  const ctr = (clicks / impressions) * 100;
  const conversions = Math.max(1, Math.floor(clicks * (0.1 + Math.random() * 0.04)));
  const conversionValue = conversions * (75 + Math.random() * 45);
  const roas = conversionValue / dailySpend;

  return {
    date,
    spend: Math.round(dailySpend * 100) / 100,
    clicks, impressions,
    cpc: Math.round(cpc * 100) / 100, ctr: Math.round(ctr * 100) / 100,
    conversions, conversionValue: Math.round(conversionValue * 100) / 100,
    roas: Math.round(roas * 100) / 100,
    cpa: Math.round((dailySpend / Math.max(1, conversions)) * 100) / 100,
  };
});

const tiktokData = dates.map((date, index) => {
  const growthFactor = 1 + (index / 365) * 0.25; // TikTok grows faster
  const seasonalMultiplier = getSeasonalMultiplier(date);
  const dailySpend = addNoise((baseTikTokSpend / 30) * growthFactor * seasonalMultiplier, 0.25);
  const impressions = Math.floor(addNoise(dailySpend * (800 + Math.random() * 200), 0.2)); // Higher impression rates
  const clicks = Math.floor(impressions * (0.008 + Math.random() * 0.012)); // TikTok typically has lower CTR
  const cpm = (dailySpend / impressions) * 1000;
  const ctr = (clicks / impressions) * 100;
  const conversions = Math.max(1, Math.floor(clicks * (0.06 + Math.random() * 0.04))); // Slightly lower conversion rate
  const conversionValue = conversions * (70 + Math.random() * 35);
  const roas = conversionValue / dailySpend;

  return {
    date,
    spend: Math.round(dailySpend * 100) / 100,
    impressions, cpm: Math.round(cpm * 100) / 100,
    ctr: Math.round(ctr * 100) / 100, clicks, conversions,
    conversionValue: Math.round(conversionValue * 100) / 100,
    roas: Math.round(roas * 100) / 100,
    cpa: Math.round((dailySpend / Math.max(1, conversions)) * 100) / 100,
  };
});

// Klaviyo and GA4 reference shopify/meta/google/tiktok arrays directly
const klaviyoData = dates.map((date, index) => {
  const growthFactor = 1 + (index / 365) * 0.15;
  const shopifyDay = shopifyData[index];
  const flowRevenue = (shopifyDay?.revenue || 1500) * 0.18;
  const listGrowth = Math.floor(addNoise(50 + Math.random() * 150, 0.25) * growthFactor);
  const unsubscribes = Math.max(1, Math.floor(listGrowth * (0.01 + Math.random() * 0.015)));

  return {
    date,
    flowRevenue: Math.round(flowRevenue * 100) / 100,
    campaignRevenue: Math.round((flowRevenue * 0.3) * 100) / 100,
    listSize: 15000 + Math.floor(index * 3) + Math.floor(Math.random() * 500),
    subscriberGrowth: listGrowth,
    unsubscribes,
  };
});

const ga4Data = dates.map((date, index) => {
  const shopifyDay = shopifyData[index];
  const metaDay = metaData[index];
  const googleDay = googleData[index];
  const tiktokDay = tiktokData[index];

  const paidSessions = (metaDay?.clicks || 0) + (googleDay?.clicks || 0) + (tiktokDay?.clicks || 0);
  const organicSessions = Math.floor(paidSessions * (0.6 + Math.random() * 0.2));
  const directSessions = Math.floor(paidSessions * (0.15 + Math.random() * 0.1));
  const socialSessions = Math.floor(paidSessions * (0.08 + Math.random() * 0.06));
  const referralSessions = Math.floor(paidSessions * (0.05 + Math.random() * 0.05));
  const totalSessions = paidSessions + organicSessions + directSessions + socialSessions + referralSessions;
  const totalRevenue = shopifyDay?.revenue || 0;
  const conversionRate = (paidSessions / Math.max(1, totalSessions)) * 100;

  return {
    date, sessions: totalSessions,
    organicSessions, directSessions, socialSessions, referralSessions, paidSessions,
    revenue: totalRevenue,
    conversionRate: Math.round(conversionRate * 100) / 100,
    revenuePerSession: totalRevenue / Math.max(1, totalSessions),
  };
});

// Assemble final object
export const mockData = {
  shopify: shopifyData,
  meta: metaData,
  google: googleData,
  tiktok: tiktokData,
  klaviyo: klaviyoData,
  ga4: ga4Data,

  metaCampaigns: [
    { id: 'META-CAM-001', name: 'Brand Awareness Q1', status: 'active', spend: 125000, revenue: 387500, roas: 3.1, impressions: 625000, cpa: 42.5 },
    { id: 'META-CAM-002', name: 'Conversion Focus - Desktop', status: 'active', spend: 98000, revenue: 294000, roas: 3.0, impressions: 490000, cpa: 45.2 },
    { id: 'META-CAM-003', name: 'Mobile Traffic Driver', status: 'active', spend: 87000, revenue: 261000, roas: 3.0, impressions: 435000, cpa: 48.1 },
    { id: 'META-CAM-004', name: 'Engagement Booster', status: 'paused', spend: 65000, revenue: 182000, roas: 2.8, impressions: 325000, cpa: 52.3 },
    { id: 'META-CAM-005', name: 'Retargeting Campaign', status: 'active', spend: 78000, revenue: 265000, roas: 3.4, impressions: 390000, cpa: 39.8 },
  ],

  googleCampaigns: [
    { id: 'GOOGLE-CAM-001', name: 'Search - Brand Keywords', type: 'Search', status: 'enabled', spend: 42000, conversionValue: 168000, roas: 4.0, clicks: 2940, cpa: 28.5 },
    { id: 'GOOGLE-CAM-002', name: 'Search - Generic Keywords', type: 'Search', status: 'enabled', spend: 30000, conversionValue: 105000, roas: 3.5, clicks: 2100, cpa: 32.1 },
    { id: 'GOOGLE-CAM-003', name: 'Shopping - All Products', type: 'Shopping', status: 'enabled', spend: 24000, conversionValue: 96000, roas: 4.0, clicks: 1680, cpa: 28.6 },
    { id: 'GOOGLE-CAM-004', name: 'Performance Max', type: 'PMax', status: 'enabled', spend: 14400, conversionValue: 57600, roas: 4.0, clicks: 1008, cpa: 28.6 },
  ],

  tiktokCampaigns: [
    { id: 'TIKTOK-CAM-001', name: 'Video Creative - Gen Z Audience', type: 'CONVERSIONS', status: 'ENABLE', spend: 38000, conversionValue: 126000, roas: 3.3, clicks: 1520, cpa: 45.2, impressions: 195000 },
    { id: 'TIKTOK-CAM-002', name: 'User Generated Content', type: 'CONVERSIONS', status: 'ENABLE', spend: 29000, conversionValue: 93500, roas: 3.2, clicks: 1305, cpa: 46.8, impressions: 168000 },
    { id: 'TIKTOK-CAM-003', name: 'Trend Hijacking Campaign', type: 'CONVERSIONS', status: 'ENABLE', spend: 22000, conversionValue: 68200, roas: 3.1, clicks: 990, cpa: 48.9, impressions: 142000 },
    { id: 'TIKTOK-CAM-004', name: 'Product Showcase - Mobile', type: 'TRAFFIC', status: 'ENABLE', spend: 18500, conversionValue: 55500, roas: 3.0, clicks: 925, cpa: 50.0, impressions: 120000 },
  ],

  klaviyoFlows: [
    { id: 'FLOW-001', name: 'Welcome Series', type: 'welcome', revenue: 8500, sent: 5200, opened: 1040, clicked: 156, converted: 31, revenuePerRecipient: 1.63 },
    { id: 'FLOW-002', name: 'Abandoned Cart', type: 'abandoned_cart', revenue: 12300, sent: 2800, opened: 700, clicked: 245, converted: 49, revenuePerRecipient: 4.39 },
    { id: 'FLOW-003', name: 'Post Purchase', type: 'post_purchase', revenue: 9100, sent: 1450, opened: 362, clicked: 54, converted: 21, revenuePerRecipient: 6.28 },
    { id: 'FLOW-004', name: 'Win-back', type: 'winback', revenue: 6200, sent: 8900, opened: 1247, clicked: 137, converted: 18, revenuePerRecipient: 0.70 },
  ],

  klaviyoCampaigns: [
    { id: 'KLAV-CAM-001', name: 'Campaign Feb 5', sentDate: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0], sent: 12500, opened: 3125, clicked: 625, revenue: 6875, openRate: 25, clickRate: 20 },
    { id: 'KLAV-CAM-002', name: 'Campaign Feb 3', sentDate: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0], sent: 11200, opened: 2688, clicked: 537, revenue: 5370, openRate: 24, clickRate: 20 },
  ],
};
