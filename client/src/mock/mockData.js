import { subDays, format } from 'date-fns';

// ============================================================
// MOCK DATA: Ecommerce brand started ~11 months ago
// ============================================================
// Revenue curve: $3K/mo → $25K/mo over 11 months
// Current: $1,000-1,500/day
// Total: ~$120K lifetime
// AOV: $50 | Margin: 30% | FB: 85% spend | Google: 15% spend
// Blended ROAS: 3.5
// ============================================================

// Seed for reproducible randomness
let seed = 42;
const seededRandom = () => {
  seed = (seed * 16807 + 0) % 2147483647;
  return (seed - 1) / 2147483646;
};

// Generate 365 days of dates (working backwards from today)
const generateDates = (days = 365) => {
  const dates = [];
  for (let i = days - 1; i >= 0; i--) {
    dates.push(format(subDays(new Date(), i), 'yyyy-MM-dd'));
  }
  return dates;
};

const dates = generateDates(365);

// Monthly revenue targets (index 0 = 12 months ago, index 11 = this month)
// Brand started ~11 months ago with $3K first month
// Growth: 3, 5, 8, 10, 10, 12, 11, 12, 14, 23, 12, ~18 (partial)
const monthlyRevenueTargets = [
  3000,   // Month 1 (Feb 2025 - just starting)
  3000,   // Month 2 (Mar 2025 - still ramping)
  5000,   // Month 3 (Apr 2025)
  8000,   // Month 4 (May 2025)
  10000,  // Month 5 (Jun 2025)
  10000,  // Month 6 (Jul 2025)
  12000,  // Month 7 (Aug 2025)
  11000,  // Month 8 (Sep 2025)
  12000,  // Month 9 (Oct 2025)
  16000,  // Month 10 (Nov 2025 - Black Friday boost)
  25000,  // Month 11 (Dec 2025 - holiday peak)
  13000,  // Month 12 (Jan 2026 - post-holiday dip)
  18000,  // Month 13 (Feb 2026 - current, partial ~$1000-1500/day)
];

// Get the monthly target for a given date
const getMonthlyTarget = (dateStr) => {
  const date = new Date(dateStr);
  const today = new Date();
  const monthsAgo = (today.getFullYear() - date.getFullYear()) * 12 + (today.getMonth() - date.getMonth());
  const idx = Math.max(0, Math.min(12, 12 - monthsAgo));
  return monthlyRevenueTargets[idx] || 3000;
};

// Daily base revenue from monthly target
const getDailyBaseRevenue = (dateStr) => {
  const monthlyTarget = getMonthlyTarget(dateStr);
  return monthlyTarget / 30;
};

// Seasonality modifiers
const getSeasonality = (dateStr) => {
  const date = new Date(dateStr);
  const month = date.getMonth();
  const day = date.getDate();
  const dow = date.getDay();

  let multiplier = 1.0;

  // Black Friday / Cyber Monday (Nov 25-30)
  if (month === 10 && day >= 25 && day <= 30) {
    multiplier *= 3.5;
  }
  // Pre-Christmas rush (Dec 1-20)
  else if (month === 11 && day <= 20) {
    multiplier *= 1.4;
  }
  // Christmas week (Dec 21-25) - drops as shipping cutoff passes
  else if (month === 11 && day >= 21 && day <= 25) {
    multiplier *= 0.8;
  }
  // Post-Christmas sales (Dec 26-31)
  else if (month === 11 && day >= 26) {
    multiplier *= 1.2;
  }

  // Weekend boost (Sat/Sun ~20% higher)
  if (dow === 0 || dow === 6) {
    multiplier *= 1.2;
  }
  // Tuesday/Wednesday slight dip
  else if (dow === 2 || dow === 3) {
    multiplier *= 0.9;
  }

  return multiplier;
};

// Add realistic noise
const noise = (value, variance = 0.15) => {
  const n = 1 + (seededRandom() - 0.5) * variance * 2;
  return Math.max(0, value * n);
};

const round2 = (v) => Math.round(v * 100) / 100;

// ============================================================
// SHOPIFY DATA
// ============================================================
export const generateShopifyData = () => {
  seed = 42;
  return dates.map((date) => {
    const baseRevenue = getDailyBaseRevenue(date);
    const seasonal = getSeasonality(date);
    const dailyRevenue = noise(baseRevenue * seasonal, 0.18);

    const AOV = noise(50, 0.12);
    const orders = Math.max(1, Math.round(dailyRevenue / AOV));
    const actualRevenue = round2(orders * AOV);

    // Customer split: ~35% new, 65% returning (shifts over time as brand matures)
    const monthsAgo = Math.max(0, 12 - Math.floor((new Date() - new Date(date)) / (30 * 24 * 60 * 60 * 1000)));
    const newCustomerRatio = Math.max(0.25, 0.6 - monthsAgo * 0.03); // starts high, decreases
    const newCustomers = Math.max(1, Math.round(orders * newCustomerRatio));
    const returningCustomers = Math.max(0, orders - newCustomers);

    // 30% margin means COGS ~40% of revenue, shipping ~8%, fees ~3%
    const cogs = round2(actualRevenue * noise(0.40, 0.08));
    const shipping = round2(actualRevenue * noise(0.08, 0.10));
    const transactionFees = round2(actualRevenue * noise(0.03, 0.05));
    const refundRate = noise(0.03, 0.5); // ~3% refund rate
    const refundAmount = round2(actualRevenue * refundRate);

    return {
      date,
      revenue: actualRevenue,
      orders,
      newCustomers,
      returningCustomers,
      aov: round2(actualRevenue / orders),
      refundAmount,
      cogs,
      shipping,
      transactionFees,
    };
  });
};

// ============================================================
// META (FACEBOOK) ADS DATA — 85% of ad spend
// ============================================================
export const generateMetaData = () => {
  seed = 137;
  return dates.map((date) => {
    const baseRevenue = getDailyBaseRevenue(date);
    const seasonal = getSeasonality(date);
    const dailyRevenue = noise(baseRevenue * seasonal, 0.18);

    // Ad-attributed revenue ~65% of total, Meta gets ~75% of that
    const metaAttributedRevenue = round2(dailyRevenue * 0.65 * 0.75);

    // ROAS target 3.5 (varies between 2.8-4.2)
    const roas = noise(3.5, 0.20);
    const spend = round2(metaAttributedRevenue / roas);

    // Ad metrics
    const cpm = noise(12.5, 0.25); // $12.50 CPM average
    const impressions = Math.round((spend / cpm) * 1000);
    const ctr = noise(1.8, 0.20); // 1.8% CTR
    const clicks = Math.max(1, Math.round(impressions * (ctr / 100)));
    const cpc = round2(spend / clicks);
    const conversionRate = noise(2.8, 0.20); // 2.8% conversion rate
    const conversions = Math.max(0, Math.round(clicks * (conversionRate / 100)));

    return {
      date,
      spend: round2(spend),
      impressions,
      clicks,
      conversions,
      revenue: metaAttributedRevenue,
      ctr: round2(ctr),
      cpm: round2(cpm),
      cpc,
      roas: round2(conversions > 0 ? metaAttributedRevenue / spend : 0),
    };
  });
};

// ============================================================
// GOOGLE ADS DATA — 15% of ad spend
// ============================================================
export const generateGoogleData = () => {
  seed = 256;
  return dates.map((date) => {
    const baseRevenue = getDailyBaseRevenue(date);
    const seasonal = getSeasonality(date);
    const dailyRevenue = noise(baseRevenue * seasonal, 0.18);

    // Google gets ~25% of ad-attributed revenue
    const googleAttributedRevenue = round2(dailyRevenue * 0.65 * 0.25);

    // Google ROAS slightly lower than Meta (3.0-3.8)
    const roas = noise(3.2, 0.22);
    const spend = round2(googleAttributedRevenue / roas);

    // Google ad metrics (typically higher CPC, lower CPM than Meta)
    const cpc = noise(1.20, 0.25); // $1.20 avg CPC
    const clicks = Math.max(1, Math.round(spend / cpc));
    const ctr = noise(3.5, 0.20); // 3.5% CTR (search is higher)
    const impressions = Math.round(clicks / (ctr / 100));
    const conversionRate = noise(3.2, 0.20); // 3.2% conversion rate
    const conversions = Math.max(0, Math.round(clicks * (conversionRate / 100)));
    const conversionValue = round2(googleAttributedRevenue);

    return {
      date,
      spend: round2(spend),
      impressions,
      clicks,
      conversions,
      conversionValue,
      ctr: round2(ctr),
      cpc: round2(cpc),
      roas: round2(spend > 0 ? conversionValue / spend : 0),
    };
  });
};

// ============================================================
// KLAVIYO DATA — Email/SMS marketing
// ============================================================
export const generateKlaviyoData = () => {
  seed = 389;
  return dates.map((date) => {
    const baseRevenue = getDailyBaseRevenue(date);
    const seasonal = getSeasonality(date);
    const dailyRevenue = noise(baseRevenue * seasonal, 0.18);

    // Email drives ~15% of revenue (flows + campaigns)
    const emailRevenue = round2(dailyRevenue * noise(0.15, 0.25));
    const flowRevenue = round2(emailRevenue * noise(0.60, 0.15)); // 60% from flows
    const campaignRevenue = round2(emailRevenue - flowRevenue);

    // List size grows over time
    const daysFromStart = Math.max(1, dates.indexOf(date) + 1);
    const listSize = Math.round(500 + daysFromStart * 15); // starts 500, grows ~15/day

    // Sends: campaigns ~3x/week, flows daily
    const dow = new Date(date).getDay();
    const isCampaignDay = dow === 1 || dow === 3 || dow === 5; // Mon, Wed, Fri
    const campaignSent = isCampaignDay ? Math.round(listSize * noise(0.85, 0.1)) : 0;
    const flowSent = Math.round(noise(listSize * 0.05, 0.3)); // ~5% of list gets flow emails daily
    const emailsSent = campaignSent + flowSent;

    // Engagement rates
    const openRate = noise(0.35, 0.15); // 35% open rate
    const clickRate = noise(0.045, 0.20); // 4.5% click rate
    const opens = Math.round(emailsSent * openRate);
    const clicks = Math.round(emailsSent * clickRate);
    const unsubscribes = Math.max(0, Math.round(emailsSent * noise(0.002, 0.5)));
    const bounces = Math.max(0, Math.round(emailsSent * noise(0.008, 0.4)));

    return {
      date,
      emailsSent: Math.max(0, emailsSent),
      opens,
      clicks,
      revenue: emailRevenue,
      unsubscribes,
      bounces,
      flowRevenue,
      campaignRevenue,
    };
  });
};

// ============================================================
// GA4 DATA — Website traffic & analytics
// ============================================================
export const generateGA4Data = () => {
  seed = 512;
  return dates.map((date) => {
    const baseRevenue = getDailyBaseRevenue(date);
    const seasonal = getSeasonality(date);
    const dailyRevenue = noise(baseRevenue * seasonal, 0.18);

    // Traffic scales roughly with revenue
    const revenueMultiplier = dailyRevenue / 500; // base 500/day = ~30 sessions
    const baseSessions = Math.max(20, Math.round(noise(revenueMultiplier * 30, 0.20)));

    // Session sources
    const organicPct = noise(0.30, 0.15);  // 30% organic
    const paidPct = noise(0.35, 0.15);     // 35% paid
    const directPct = noise(0.15, 0.15);   // 15% direct
    const socialPct = noise(0.10, 0.20);   // 10% social
    const emailPct = noise(0.10, 0.20);    // 10% email
    const totalPct = organicPct + paidPct + directPct + socialPct + emailPct;

    const sessions = baseSessions;
    const organicSessions = Math.round(sessions * (organicPct / totalPct));
    const paidSessions = Math.round(sessions * (paidPct / totalPct));
    const directSessions = Math.round(sessions * (directPct / totalPct));
    const socialSessions = Math.round(sessions * (socialPct / totalPct));

    // Users (~85% of sessions are unique)
    const users = Math.round(sessions * noise(0.85, 0.08));
    const newUsers = Math.round(users * noise(0.55, 0.12));

    // Engagement
    const bounceRate = round2(noise(0.42, 0.15));
    const avgSessionDuration = Math.round(noise(165, 0.20)); // ~2:45 avg
    const pageviews = Math.round(sessions * noise(2.8, 0.15));

    return {
      date,
      sessions,
      users,
      newUsers,
      bounceRate,
      avgSessionDuration,
      pageviews,
      organicSessions,
      paidSessions,
      directSessions,
      socialSessions,
    };
  });
};

// ============================================================
// EXPORT ASSEMBLED DATA
// ============================================================
const shopifyData = generateShopifyData();
const metaData = generateMetaData();
const googleData = generateGoogleData();
const klaviyoData = generateKlaviyoData();
const ga4Data = generateGA4Data();

export const mockData = {
  shopify: shopifyData,
  meta: metaData,
  google: googleData,
  klaviyo: klaviyoData,
  ga4: ga4Data,
};

// Quick stats (for debugging)
if (typeof window !== 'undefined' && window.location?.hostname === 'localhost') {
  const totalRevenue = shopifyData.reduce((s, d) => s + d.revenue, 0);
  const totalMetaSpend = metaData.reduce((s, d) => s + d.spend, 0);
  const totalGoogleSpend = googleData.reduce((s, d) => s + d.spend, 0);
  const totalAdSpend = totalMetaSpend + totalGoogleSpend;
  const totalAdRevenue = metaData.reduce((s, d) => s + d.revenue, 0) + googleData.reduce((s, d) => s + d.conversionValue, 0);
  const last7Revenue = shopifyData.slice(-7).reduce((s, d) => s + d.revenue, 0);

  console.log('[MockData] Summary:');
  console.log(`  Total Revenue: $${Math.round(totalRevenue).toLocaleString()}`);
  console.log(`  Total Ad Spend: $${Math.round(totalAdSpend).toLocaleString()} (Meta: $${Math.round(totalMetaSpend).toLocaleString()}, Google: $${Math.round(totalGoogleSpend).toLocaleString()})`);
  console.log(`  Meta % of spend: ${((totalMetaSpend / totalAdSpend) * 100).toFixed(1)}%`);
  console.log(`  Blended ROAS: ${(totalAdRevenue / totalAdSpend).toFixed(2)}`);
  console.log(`  Avg AOV: $${(totalRevenue / shopifyData.reduce((s, d) => s + d.orders, 0)).toFixed(2)}`);
  console.log(`  Last 7 days avg: $${Math.round(last7Revenue / 7).toLocaleString()}/day`);
  console.log(`  Days of data: ${shopifyData.length}`);
}

export default mockData;
