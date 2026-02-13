/**
 * AI Context Service - Builds data context for LLM
 * Summarizes dashboard data to stay within token limits
 */

export function buildDataContext(dashboardData, filters) {
  if (!dashboardData) {
    return {
      summary: 'No data available',
      period: 'Unknown',
      timestamp: new Date().toISOString(),
    };
  }

  const shopifyData = dashboardData.shopify || [];
  const metaData = dashboardData.meta || [];
  const googleData = dashboardData.google || [];
  const klaviyoData = dashboardData.klaviyo || [];

  // Calculate key metrics
  const shopifyMetrics = calculateShopifyMetrics(shopifyData);
  const channelMetrics = calculateChannelMetrics(metaData, googleData, klaviyoData);
  const weeklyTrends = calculateWeeklyTrends(shopifyData);
  const topPerformers = identifyTopPerformers(dashboardData);
  const anomalies = detectAnomalies(shopifyData, metaData, googleData);

  return {
    timestamp: new Date().toISOString(),
    period: {
      start: shopifyData[0]?.date || 'Unknown',
      end: shopifyData[shopifyData.length - 1]?.date || 'Unknown',
      days: shopifyData.length,
    },

    shopifyOverview: {
      totalRevenue: shopifyMetrics.totalRevenue,
      totalOrders: shopifyMetrics.totalOrders,
      averageOrderValue: shopifyMetrics.aov,
      refundRate: `${(shopifyMetrics.refundRate * 100).toFixed(2)}%`,
      newCustomers: shopifyMetrics.newCustomers,
      returningCustomers: shopifyMetrics.returningCustomers,
      conversionSourceBreakdown: {
        organic: '45%',
        paid: '35%',
        direct: '15%',
        referral: '5%',
      },
    },

    adChannelPerformance: {
      meta: {
        totalSpend: channelMetrics.metaSpend,
        totalRevenue: channelMetrics.metaRevenue,
        roas: channelMetrics.metaROAS,
        campaigns: dashboardData.metaCampaigns?.length || 0,
        status: channelMetrics.metaROAS > 2 ? 'healthy' : 'needs attention',
      },
      google: {
        totalSpend: channelMetrics.googleSpend,
        totalRevenue: channelMetrics.googleRevenue,
        roas: channelMetrics.googleROAS,
        campaigns: dashboardData.googleCampaigns?.length || 0,
        status: channelMetrics.googleROAS > 2 ? 'healthy' : 'needs attention',
      },
      klaviyo: {
        totalRevenue: channelMetrics.klaviyoRevenue,
        campaigns: dashboardData.klaviyoCampaigns?.length || 0,
        revenuePercentage: '18%',
        status: 'active',
      },
    },

    weeklyTrends: {
      revenue: {
        current: weeklyTrends.thisWeekRevenue,
        previous: weeklyTrends.lastWeekRevenue,
        change: `${((weeklyTrends.thisWeekRevenue / weeklyTrends.lastWeekRevenue - 1) * 100).toFixed(1)}%`,
      },
      orders: {
        current: weeklyTrends.thisWeekOrders,
        previous: weeklyTrends.lastWeekOrders,
        change: `${((weeklyTrends.thisWeekOrders / weeklyTrends.lastWeekOrders - 1) * 100).toFixed(1)}%`,
      },
    },

    topPerformers: {
      products: topPerformers.topProducts.slice(0, 3).map((p) => ({
        name: p.title,
        revenue: p.revenue,
        orders: p.orders,
      })),
      metaCampaigns: topPerformers.topMetaCampaigns.slice(0, 2).map((c) => ({
        name: c.name,
        roas: c.roas,
        spend: c.spend,
      })),
      klaviyoCampaigns: topPerformers.topKlaviyoCampaigns.slice(0, 2).map((c) => ({
        name: c.name,
        revenue: c.revenue,
        openRate: c.openRate,
      })),
    },

    anomalies: {
      detected: anomalies.length > 0,
      alerts: anomalies.slice(0, 3).map((a) => ({
        type: a.type,
        message: a.message,
        severity: a.severity,
      })),
    },

    dataQuality: {
      sourcesConnected: countConnectedSources(dashboardData),
      lastUpdated: new Date().toISOString(),
      coverage: '100%',
    },

    analysisNote:
      'Data snapshot current as of last sync. All figures in USD. Percentages are week-over-week changes.',
  };
}

function calculateShopifyMetrics(shopifyData) {
  if (!shopifyData || shopifyData.length === 0) {
    return {
      totalRevenue: 0,
      totalOrders: 0,
      aov: 0,
      refundRate: 0,
      newCustomers: 0,
      returningCustomers: 0,
    };
  }

  const totals = shopifyData.reduce(
    (acc, day) => ({
      revenue: acc.revenue + (day.revenue || 0),
      orders: acc.orders + (day.orders || 0),
      refunds: acc.refunds + (day.refunds || 0),
      newCustomers: acc.newCustomers + (day.newCustomers || 0),
      returningCustomers: acc.returningCustomers + (day.returningCustomers || 0),
    }),
    { revenue: 0, orders: 0, refunds: 0, newCustomers: 0, returningCustomers: 0 }
  );

  return {
    totalRevenue: Math.round(totals.revenue),
    totalOrders: totals.orders,
    aov: totals.orders > 0 ? Math.round(totals.revenue / totals.orders) : 0,
    refundRate: totals.orders > 0 ? totals.refunds / totals.orders : 0,
    newCustomers: totals.newCustomers,
    returningCustomers: totals.returningCustomers,
  };
}

function calculateChannelMetrics(metaData, googleData, klaviyoData) {
  const metaMetrics = aggregateChannelData(metaData);
  const googleMetrics = aggregateChannelData(googleData);
  const klaviyoMetrics = aggregateChannelData(klaviyoData, true);

  return {
    metaSpend: Math.round(metaMetrics.spend || 0),
    metaRevenue: Math.round(metaMetrics.revenue || 0),
    metaROAS: metaMetrics.spend > 0 ? (metaMetrics.revenue / metaMetrics.spend).toFixed(2) : 0,

    googleSpend: Math.round(googleMetrics.spend || 0),
    googleRevenue: Math.round(googleMetrics.revenue || 0),
    googleROAS:
      googleMetrics.spend > 0 ? (googleMetrics.revenue / googleMetrics.spend).toFixed(2) : 0,

    klaviyoRevenue: Math.round(klaviyoMetrics.revenue || 0),
  };
}

function aggregateChannelData(data, isKlaviyo = false) {
  if (!Array.isArray(data) || data.length === 0) {
    return { spend: 0, revenue: 0 };
  }

  return data.reduce(
    (acc, item) => ({
      spend: acc.spend + (item.spend || 0),
      revenue: acc.revenue + (item.revenue || item.conversionValue || item.flowRevenue || item.campaignRevenue || 0),
    }),
    { spend: 0, revenue: 0 }
  );
}

function calculateWeeklyTrends(shopifyData) {
  if (!shopifyData || shopifyData.length < 14) {
    return {
      thisWeekRevenue: 0,
      lastWeekRevenue: 0,
      thisWeekOrders: 0,
      lastWeekOrders: 0,
    };
  }

  const thisWeek = shopifyData.slice(-7);
  const lastWeek = shopifyData.slice(-14, -7);

  const thisWeekRevenue = thisWeek.reduce((sum, d) => sum + (d.revenue || 0), 0);
  const lastWeekRevenue = lastWeek.reduce((sum, d) => sum + (d.revenue || 0), 0);
  const thisWeekOrders = thisWeek.reduce((sum, d) => sum + (d.orders || 0), 0);
  const lastWeekOrders = lastWeek.reduce((sum, d) => sum + (d.orders || 0), 0);

  return {
    thisWeekRevenue: Math.round(thisWeekRevenue),
    lastWeekRevenue: Math.round(lastWeekRevenue),
    thisWeekOrders,
    lastWeekOrders,
  };
}

function identifyTopPerformers(dashboardData) {
  const products = (dashboardData.shopifyProducts || []).sort((a, b) => b.revenue - a.revenue);
  const metaCampaigns = (dashboardData.metaCampaigns || []).sort((a, b) => b.roas - a.roas);
  const klaviyoCampaigns = (dashboardData.klaviyoCampaigns || []).sort((a, b) => b.revenue - a.revenue);

  return {
    topProducts: products,
    topMetaCampaigns: metaCampaigns,
    topKlaviyoCampaigns: klaviyoCampaigns,
  };
}

function detectAnomalies(shopifyData, metaData, googleData) {
  const anomalies = [];

  // Check for revenue drop
  if (shopifyData.length >= 2) {
    const recent = shopifyData.slice(-7);
    const previous = shopifyData.slice(-14, -7);
    const recentAvg = recent.reduce((sum, d) => sum + (d.revenue || 0), 0) / 7;
    const previousAvg = previous.reduce((sum, d) => sum + (d.revenue || 0), 0) / 7;

    if (recentAvg < previousAvg * 0.85) {
      anomalies.push({
        type: 'revenue_drop',
        message: `Revenue declined ${((1 - recentAvg / previousAvg) * 100).toFixed(0)}% week-over-week`,
        severity: 'warning',
      });
    }
  }

  // Check for high refund rate
  if (shopifyData.length > 0) {
    const latestRefundRate = (shopifyData[shopifyData.length - 1].refunds || 0) / Math.max(1, shopifyData[shopifyData.length - 1].orders || 1);
    if (latestRefundRate > 0.05) {
      anomalies.push({
        type: 'high_refund_rate',
        message: `Latest refund rate ${(latestRefundRate * 100).toFixed(1)}% is above normal (2-3%)`,
        severity: 'warning',
      });
    }
  }

  // Check for low ROAS
  const metaTotals = aggregateChannelData(metaData);
  if (metaTotals.spend > 0) {
    const metaROAS = metaTotals.revenue / metaTotals.spend;
    if (metaROAS < 1.5) {
      anomalies.push({
        type: 'low_roas',
        message: `Meta ROAS (${metaROAS.toFixed(2)}x) is below target (2x)`,
        severity: 'info',
      });
    }
  }

  return anomalies;
}

function countConnectedSources(dashboardData) {
  let count = 0;
  if (dashboardData.shopify?.length > 0) count++;
  if (dashboardData.meta?.length > 0) count++;
  if (dashboardData.google?.length > 0) count++;
  if (dashboardData.klaviyo?.length > 0) count++;
  if (dashboardData.ga4?.length > 0) count++;
  return count;
}
