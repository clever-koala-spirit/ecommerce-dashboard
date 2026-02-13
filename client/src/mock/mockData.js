import { subDays, format } from 'date-fns';

// Helper functions for generating realistic mock data
const generateDateArray = (days = 365) => {
  const dates = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(new Date(), i);
    dates.push(format(date, 'yyyy-MM-dd'));
  }
  return dates;
};

const getSeasonalMultiplier = (date) => {
  const month = new Date(date).getMonth();
  const dayOfWeek = new Date(date).getDay();

  // Monthly seasonality
  let monthMultiplier = 1;
  if (month === 11) monthMultiplier = 2.0; // December (2x)
  else if (month === 0) monthMultiplier = 0.8; // January (20% dip)
  else if (month === 1) monthMultiplier = 1.1; // February (10% recovery)
  else if (month === 10) {
    // November - check for Black Friday
    const dayOfMonth = new Date(date).getDate();
    if (dayOfMonth >= 23 && dayOfMonth <= 30) monthMultiplier = 4.0; // Black Friday spike
    else monthMultiplier = 1.2;
  } else {
    monthMultiplier = 1.0;
  }

  // Weekly seasonality (weekends are 25% higher)
  const weeklyMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 1.25 : 0.95;

  return monthMultiplier * weeklyMultiplier;
};

const addNoise = (value, variance = 0.12) => {
  const noise = 1 + (Math.random() - 0.5) * variance;
  return Math.max(0, value * noise);
};

// Generate dates for 365 days (12 months)
const dates = generateDateArray(365);

// SHOPIFY DATA
const baseShopifyRevenue = 45000; // Base monthly revenue ~$45k

export const generateShopifyData = () => {
  return dates.map((date, index) => {
    const daysInPeriod = 30;
    const growthFactor = 1 + (index / 365) * 0.15; // 15% YoY growth
    const seasonalMultiplier = getSeasonalMultiplier(date);
    const dailyRevenue = addNoise(
      (baseShopifyRevenue / 30) * growthFactor * seasonalMultiplier,
      0.15
    );

    const orders = Math.max(
      15,
      Math.floor(addNoise((dailyRevenue / 85) * (1 + Math.random() * 0.1), 0.2))
    );
    const aov = dailyRevenue / Math.max(1, orders);
    const refundRate = 0.03 + Math.random() * 0.02;
    const refunds = Math.floor(orders * refundRate);
    const refundAmount = refunds * aov * (0.75 + Math.random() * 0.25);

    const cogs = dailyRevenue * (0.35 + Math.random() * 0.05);
    const shipping = orders * (3.5 + Math.random() * 1.5);
    const transactionFees = dailyRevenue * (0.029 + 0.3 / 100);

    const newCustomers = Math.max(
      2,
      Math.floor(orders * (0.3 + Math.random() * 0.1))
    );
    const returningCustomers = orders - newCustomers;

    return {
      date,
      orders,
      revenue: Math.round(dailyRevenue * 100) / 100,
      refunds,
      refundAmount: Math.round(refundAmount * 100) / 100,
      aov: Math.round(aov * 100) / 100,
      cogs: Math.round(cogs * 100) / 100,
      shipping: Math.round(shipping * 100) / 100,
      transactionFees: Math.round(transactionFees * 100) / 100,
      newCustomers,
      returningCustomers,
    };
  });
};

// Generate top 20 products
export const generateTopProducts = () => {
  const productNames = [
    'Wireless Headphones Pro',
    'USB-C Charging Cable',
    'Phone Screen Protector',
    'Portable Power Bank',
    'Laptop Stand Adjustable',
    'Mechanical Keyboard',
    'Wireless Mouse',
    'Desk Lamp LED',
    'Phone Case Premium',
    'Webcam HD 1080p',
    'Monitor Arm Mount',
    'Desk Organizer Set',
    'Cable Management Kit',
    'Phone Ring Stand',
    'Screen Cleaner Bundle',
    'USB Hub Adapter',
    'Keyboard Wrist Rest',
    'Monitor Riser',
    'Desk Calendar Pad',
    'Sticky Notes Collection',
  ];

  const baseRevenue = 45000 * 12; // Annual revenue
  const productRevenues = [];
  let totalAllocated = 0;

  // First product gets 15%, then decreasing percentages
  for (let i = 0; i < productNames.length; i++) {
    const percentage = Math.pow(0.8, i) * 0.12;
    productRevenues.push(percentage);
    totalAllocated += percentage;
  }

  return productNames.map((name, idx) => {
    const share = productRevenues[idx] / totalAllocated;
    const revenue = baseRevenue * share;
    const avgPrice = 35 + Math.random() * 85;
    const orders = Math.round(revenue / avgPrice);
    const cogs = revenue * (0.3 + Math.random() * 0.1);

    return {
      id: `PROD-${String(idx + 1).padStart(3, '0')}`,
      title: name,
      revenue: Math.round(revenue * 100) / 100,
      orders,
      aov: Math.round((revenue / orders) * 100) / 100,
      cogs: Math.round(cogs * 100) / 100,
      marginPercent: Math.round(((revenue - cogs) / revenue) * 100),
    };
  });
};

// Generate 5 collections
export const generateCollections = () => {
  const collections = [
    { name: 'Audio & Headphones', revenueShare: 0.25 },
    { name: 'Desk Accessories', revenueShare: 0.35 },
    { name: 'Mobile Accessories', revenueShare: 0.2 },
    { name: 'Cables & Adapters', revenueShare: 0.12 },
    { name: 'Workspace Organization', revenueShare: 0.08 },
  ];

  const totalAnnualRevenue = 45000 * 12;

  return collections.map((collection) => ({
    id: `COLL-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
    name: collection.name,
    revenue: Math.round(totalAnnualRevenue * collection.revenueShare * 100) / 100,
    products: Math.floor(5 + Math.random() * 15),
    orders: Math.floor((totalAnnualRevenue * collection.revenueShare) / 75),
  }));
};

// META ADS DATA
const baseMetaSpend = 17500; // ~$17.5k monthly

export const generateMetaData = () => {
  return dates.map((date, index) => {
    const growthFactor = 1 + (index / 365) * 0.15;
    const seasonalMultiplier = getSeasonalMultiplier(date);
    const dailySpend = addNoise(
      (baseMetaSpend / 30) * growthFactor * seasonalMultiplier,
      0.2
    );

    const impressions = Math.floor(
      addNoise(dailySpend * (450 + Math.random() * 100), 0.15)
    );
    const clicks = Math.floor(impressions * (0.01 + Math.random() * 0.02));
    const cpm = (dailySpend / impressions) * 1000;
    const ctr = (clicks / impressions) * 100;

    // Purchase conversion (8-12% of clicks)
    const purchases = Math.max(
      1,
      Math.floor(clicks * (0.08 + Math.random() * 0.04))
    );
    const purchaseRevenue = purchases * (65 + Math.random() * 40);
    const roas = purchaseRevenue / dailySpend;

    return {
      date,
      spend: Math.round(dailySpend * 100) / 100,
      impressions,
      cpm: Math.round(cpm * 100) / 100,
      ctr: Math.round(ctr * 100) / 100,
      clicks,
      purchases,
      revenue: Math.round(purchaseRevenue * 100) / 100,
      roas: Math.round(roas * 100) / 100,
      cpa: Math.round((dailySpend / Math.max(1, purchases)) * 100) / 100,
    };
  });
};

// Generate 8 Meta campaigns
export const generateMetaCampaigns = () => {
  const campaignNames = [
    'Brand Awareness Q1',
    'Conversion Focus - Desktop',
    'Mobile Traffic Driver',
    'Engagement Booster',
    'Retargeting Campaign',
    'Lead Generation',
    'Product Launch Push',
    'Seasonal Holiday Sale',
  ];

  const metaData = generateMetaData();
  const totalSpend = metaData.reduce((sum, d) => sum + d.spend, 0);
  const totalRevenue = metaData.reduce((sum, d) => sum + d.revenue, 0);

  return campaignNames.map((name, idx) => {
    const sharePercentage = 0.08 + Math.random() * 0.07;
    const campaignSpend = totalSpend * sharePercentage;
    const campaignRevenue = totalRevenue * sharePercentage;

    return {
      id: `META-CAM-${String(idx + 1).padStart(3, '0')}`,
      name,
      status: Math.random() > 0.15 ? 'active' : 'paused',
      spend: Math.round(campaignSpend * 100) / 100,
      revenue: Math.round(campaignRevenue * 100) / 100,
      roas: Math.round((campaignRevenue / campaignSpend) * 100) / 100,
      impressions: Math.floor(campaignSpend * 500),
      cpa: Math.round((campaignSpend / Math.floor(campaignRevenue / 85)) * 100) / 100,
    };
  });
};

// GOOGLE ADS DATA
const baseGoogleSpend = 10000; // ~$10k monthly

export const generateGoogleData = () => {
  return dates.map((date, index) => {
    const growthFactor = 1 + (index / 365) * 0.15;
    const seasonalMultiplier = getSeasonalMultiplier(date);
    const dailySpend = addNoise(
      (baseGoogleSpend / 30) * growthFactor * seasonalMultiplier,
      0.2
    );

    const clicks = Math.floor(
      addNoise(dailySpend * (70 + Math.random() * 30), 0.15)
    );
    const impressions = Math.floor(clicks / (0.03 + Math.random() * 0.02));
    const cpc = clicks > 0 ? dailySpend / clicks : 0;
    const ctr = (clicks / impressions) * 100;

    // Conversions from Google Ads (10-14% conversion rate)
    const conversions = Math.max(
      1,
      Math.floor(clicks * (0.1 + Math.random() * 0.04))
    );
    const conversionValue = conversions * (75 + Math.random() * 45);
    const roas = conversionValue / dailySpend;

    return {
      date,
      spend: Math.round(dailySpend * 100) / 100,
      clicks,
      impressions,
      cpc: Math.round(cpc * 100) / 100,
      ctr: Math.round(ctr * 100) / 100,
      conversions,
      conversionValue: Math.round(conversionValue * 100) / 100,
      roas: Math.round(roas * 100) / 100,
      cpa: Math.round((dailySpend / Math.max(1, conversions)) * 100) / 100,
    };
  });
};

// Generate 6 Google campaigns by type
export const generateGoogleCampaigns = () => {
  const googleData = generateGoogleData();
  const totalSpend = googleData.reduce((sum, d) => sum + d.spend, 0);
  const totalValue = googleData.reduce((sum, d) => sum + d.conversionValue, 0);

  const campaigns = [
    { name: 'Search - Brand Keywords', type: 'Search', share: 0.35 },
    { name: 'Search - Generic Keywords', type: 'Search', share: 0.25 },
    { name: 'Shopping - All Products', type: 'Shopping', share: 0.2 },
    { name: 'Performance Max - Multi-Channel', type: 'PMax', share: 0.12 },
    { name: 'Display Remarketing', type: 'Display', share: 0.05 },
    { name: 'YouTube Video Ads', type: 'YouTube', share: 0.03 },
  ];

  return campaigns.map((campaign, idx) => {
    const campaignSpend = totalSpend * campaign.share;
    const campaignValue = totalValue * campaign.share;

    return {
      id: `GOOGLE-CAM-${String(idx + 1).padStart(3, '0')}`,
      name: campaign.name,
      type: campaign.type,
      status: Math.random() > 0.1 ? 'enabled' : 'disabled',
      spend: Math.round(campaignSpend * 100) / 100,
      conversionValue: Math.round(campaignValue * 100) / 100,
      roas: Math.round((campaignValue / campaignSpend) * 100) / 100,
      clicks: Math.floor(campaignSpend * 70),
      cpa: Math.round((campaignSpend / Math.floor(campaignValue / 80)) * 100) / 100,
    };
  });
};

// KLAVIYO DATA
export const generateKlaviyoFlows = () => {
  const flows = [
    { name: 'Welcome Series', type: 'welcome' },
    { name: 'Abandoned Cart - 1 Hour', type: 'abandoned_cart' },
    { name: 'Abandoned Cart - 24 Hour', type: 'abandoned_cart' },
    { name: 'Post Purchase - Thank You', type: 'post_purchase' },
    { name: 'Post Purchase - Review Request', type: 'post_purchase' },
    { name: 'Win-back Campaign', type: 'winback' },
    { name: 'Browse Abandonment - 4 Hour', type: 'browse_abandon' },
    { name: 'Product Restock Notification', type: 'post_purchase' },
  ];

  const shopifyData = generateShopifyData();
  const totalRevenue = shopifyData.reduce((sum, d) => sum + d.revenue, 0);

  return flows.map((flow, idx) => {
    const flowShare = 0.08 + Math.random() * 0.07;
    const flowRevenue = totalRevenue * flowShare * 0.18; // Email is 18% of total revenue

    return {
      id: `FLOW-${String(idx + 1).padStart(3, '0')}`,
      name: flow.name,
      type: flow.type,
      revenue: Math.round(flowRevenue * 100) / 100,
      sent: Math.floor(flowRevenue / (35 + Math.random() * 25)),
      opened: Math.floor((flowRevenue / (35 + Math.random() * 25)) * (0.25 + Math.random() * 0.15)),
      clicked: Math.floor((flowRevenue / (35 + Math.random() * 25)) * (0.05 + Math.random() * 0.05)),
      converted: Math.floor((flowRevenue / (35 + Math.random() * 25)) * (0.02 + Math.random() * 0.03)),
      revenuePerRecipient:
        flowRevenue /
        Math.max(1, Math.floor(flowRevenue / (35 + Math.random() * 25))),
    };
  });
};

// Generate 20 Klaviyo campaigns
export const generateKlaviyoCampaigns = () => {
  const campaigns = [];
  const today = new Date();

  for (let i = 0; i < 20; i++) {
    const sentDate = subDays(today, Math.floor(Math.random() * 60));
    const sent = 5000 + Math.floor(Math.random() * 10000);
    const opened = Math.floor(sent * (0.2 + Math.random() * 0.15));
    const clicked = Math.floor(opened * (0.15 + Math.random() * 0.1));
    const converted = Math.floor(clicked * (0.08 + Math.random() * 0.05));

    campaigns.push({
      id: `KLAV-CAM-${String(i + 1).padStart(3, '0')}`,
      name: `Campaign ${format(sentDate, 'MMM d')}`,
      sentDate: format(sentDate, 'yyyy-MM-dd'),
      sent,
      opened,
      clicked,
      revenue: Math.round(converted * (45 + Math.random() * 55) * 100) / 100,
      openRate: Math.round((opened / sent) * 100),
      clickRate: Math.round((clicked / opened) * 100),
    });
  }

  return campaigns;
};

// Generate Klaviyo daily metrics
export const generateKlaviyoDailyMetrics = () => {
  const klayiyoCampaigns = generateKlaviyoCampaigns();

  return dates.map((date, index) => {
    const growthFactor = 1 + (index / 365) * 0.15;
    const seasonalMultiplier = getSeasonalMultiplier(date);

    // Flow revenue (18% of Shopify revenue)
    const shopifyData = generateShopifyData();
    const shopifyDate = shopifyData.find((d) => d.date === date) || shopifyData[0];
    const flowRevenue = shopifyDate.revenue * 0.18;

    const campaignDayMetrics = klayiyoCampaigns
      .filter((c) => c.sentDate === date)
      .reduce(
        (sum, c) => sum + c.revenue,
        0
      );

    const listGrowth = Math.floor(
      addNoise(50 + Math.random() * 150, 0.25) * growthFactor
    );
    const unsubscribes = Math.max(1, Math.floor(listGrowth * (0.01 + Math.random() * 0.015)));

    return {
      date,
      flowRevenue: Math.round(flowRevenue * 100) / 100,
      campaignRevenue: Math.round(campaignDayMetrics * 100) / 100,
      listSize: 15000 + Math.floor(index * 3) + Math.floor(Math.random() * 500),
      subscriberGrowth: listGrowth,
      unsubscribes,
    };
  });
};

// GA4 DATA
export const generateGA4Data = () => {
  const shopifyData = generateShopifyData();
  const metaData = generateMetaData();
  const googleData = generateGoogleData();

  return dates.map((date, index) => {
    const shopifyDate = shopifyData.find((d) => d.date === date) || shopifyData[0];
    const metaDate = metaData.find((d) => d.date === date) || metaData[0];
    const googleDate = googleData.find((d) => d.date === date) || googleData[0];

    // Total sessions based on ad spend and organic
    const paidSessions = metaDate.clicks + googleDate.clicks;
    const organicSessions = Math.floor(
      paidSessions * (0.6 + Math.random() * 0.2)
    );
    const directSessions = Math.floor(paidSessions * (0.15 + Math.random() * 0.1));
    const socialSessions = Math.floor(paidSessions * (0.08 + Math.random() * 0.06));
    const referralSessions = Math.floor(paidSessions * (0.05 + Math.random() * 0.05));

    const totalSessions = paidSessions + organicSessions + directSessions + socialSessions + referralSessions;
    const totalRevenue = shopifyDate.revenue;
    const conversionRate = (paidSessions / Math.max(1, totalSessions)) * 100;

    return {
      date,
      sessions: totalSessions,
      organicSessions,
      directSessions,
      socialSessions,
      referralSessions,
      paidSessions,
      revenue: totalRevenue,
      conversionRate: Math.round(conversionRate * 100) / 100,
      revenuePerSession:
        totalRevenue / Math.max(1, totalSessions),
    };
  });
};

// CONNECTION STATUS
export const generateConnectionStatus = () => {
  return {
    shopify: {
      connected: true,
      status: 'green',
      lastSynced: new Date(Date.now() - 5 * 60000), // 5 minutes ago
      config: { store: 'example-store.myshopify.com' },
    },
    meta: {
      connected: true,
      status: 'green',
      lastSynced: new Date(Date.now() - 10 * 60000), // 10 minutes ago
      config: { accountId: 'act_123456789' },
    },
    google: {
      connected: true,
      status: 'green',
      lastSynced: new Date(Date.now() - 8 * 60000), // 8 minutes ago
      config: { customerId: '123-456-7890' },
    },
    klaviyo: {
      connected: true,
      status: 'green',
      lastSynced: new Date(Date.now() - 3 * 60000), // 3 minutes ago
      config: { accountId: 'abc123def456' },
    },
    ga4: {
      connected: true,
      status: 'yellow',
      lastSynced: new Date(Date.now() - 30 * 60000), // 30 minutes ago
      config: { propertyId: '123456789' },
    },
  };
};

// Mock Insights
export const generateInsights = () => {
  return [
    {
      id: 'insight-1',
      severity: 'warning',
      title: 'Declining Conversion Rate',
      body: 'Your conversion rate has decreased 12% over the past 7 days compared to the previous period. Consider reviewing your product pages and checkout process.',
      action: 'Review Performance',
      timestamp: new Date(Date.now() - 2 * 60 * 60000),
      dismissed: false,
      snoozed: false,
    },
    {
      id: 'insight-2',
      severity: 'success',
      title: 'Meta ROAS Improvement',
      body: 'Your Meta Ads ROAS improved to 3.2x, up from 2.8x last week. Your recent campaign optimizations are paying off.',
      action: 'View Campaign',
      timestamp: new Date(Date.now() - 4 * 60 * 60000),
      dismissed: false,
      snoozed: false,
    },
    {
      id: 'insight-3',
      severity: 'info',
      title: 'New Product Trending',
      body: 'Wireless Headphones Pro is your fastest-growing product this month with 28% week-over-week growth.',
      action: 'View Product',
      timestamp: new Date(Date.now() - 6 * 60 * 60000),
      dismissed: false,
      snoozed: false,
    },
    {
      id: 'insight-4',
      severity: 'error',
      title: 'Shopify Connection Warning',
      body: 'Data sync took 45 minutes longer than usual. This may indicate connection issues.',
      action: 'Check Connection',
      timestamp: new Date(Date.now() - 8 * 60 * 60000),
      dismissed: false,
      snoozed: false,
    },
    {
      id: 'insight-5',
      severity: 'warning',
      title: 'High Refund Rate Alert',
      body: 'Refund rate for orders from USA has increased to 4.2%, above your 2-week average of 3.1%.',
      action: 'Review Refunds',
      timestamp: new Date(Date.now() - 12 * 60 * 60000),
      dismissed: false,
      snoozed: false,
    },
  ];
};

// Export all mock data generators
export const mockDataGenerators = {
  shopify: generateShopifyData,
  shopifyProducts: generateTopProducts,
  shopifyCollections: generateCollections,
  meta: generateMetaData,
  metaCampaigns: generateMetaCampaigns,
  google: generateGoogleData,
  googleCampaigns: generateGoogleCampaigns,
  klaviyo: generateKlaviyoDailyMetrics,
  klaviyoFlows: generateKlaviyoFlows,
  klaviyoCampaigns: generateKlaviyoCampaigns,
  ga4: generateGA4Data,
  connections: generateConnectionStatus,
  insights: generateInsights,
};

// Generate all mock data (eager load)
export const mockData = {
  shopify: generateShopifyData(),
  shopifyProducts: generateTopProducts(),
  shopifyCollections: generateCollections(),
  meta: generateMetaData(),
  metaCampaigns: generateMetaCampaigns(),
  google: generateGoogleData(),
  googleCampaigns: generateGoogleCampaigns(),
  klaviyo: generateKlaviyoDailyMetrics(),
  klaviyoFlows: generateKlaviyoFlows(),
  klaviyoCampaigns: generateKlaviyoCampaigns(),
  ga4: generateGA4Data(),
  connections: generateConnectionStatus(),
  insights: generateInsights(),
};
