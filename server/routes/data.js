import express from 'express';
import { shopifyService } from '../services/shopify.js';
import { metaService } from '../services/meta.js';
import { googleAdsService } from '../services/google.js';
import { tiktokService } from '../services/tiktok.js';
import { klaviyoService } from '../services/klaviyo.js';
import { ga4Service } from '../services/ga4.js';
import { getCachedOrFetch, invalidateCache } from '../middleware/cache.js';
import { saveSnapshot, getHistory } from '../db/database.js';
import { getCachedMetrics, getSyncStatus, syncShopData } from '../services/sync.js';

const router = express.Router();

const STORE_TIMEZONE = 'America/New_York';

function getDateRange(days = 30) {
  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: STORE_TIMEZONE });
  const [y, m, d] = todayStr.split('-').map(Number);
  const today = new Date(y, m - 1, d);
  const start = new Date(today.getTime() - days * 24 * 60 * 60 * 1000);
  const startStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
  return { start: startStr, end: todayStr };
}

/**
 * Try to load data from daily_metrics cache first, fall back to live API
 */
async function getDataWithCache(platform, shopDomain, dateRange, liveFetchFn) {
  // Check DB cache first
  const cached = getCachedMetrics(platform, shopDomain, dateRange.start, dateRange.end);
  if (cached && cached.length > 0) {
    return cached.map(c => c.metrics);
  }
  // Fall back to live fetch
  try {
    const result = await liveFetchFn();
    return result || [];
  } catch (err) {
    console.error(`[Dashboard] ${platform} fetch error:`, err.message);
    return [];
  }
}

// GET /api/data/dashboard - Combined data from all sources
router.get('/dashboard', async (req, res) => {
  try {
    const { shopDomain, shopData } = req;
    const { startDate, endDate, days, refresh } = req.query;
    let dateRange;
    if (startDate && endDate) {
      dateRange = { start: startDate, end: endDate };
    } else {
      dateRange = getDateRange(parseInt(days) || 90);
    }

    // If refresh=true, force a live sync and update cache
    if (refresh === 'true') {
      try {
        await syncShopData(shopDomain, dateRange);
      } catch (err) {
        console.error('[Dashboard] Refresh sync error:', err.message);
      }
    }

    // Load all data from cache (instant) with live fallback
    const [shopifyData, metaData, googleData, klaviyoData, ga4Data, tiktokData] = await Promise.all([
      getDataWithCache('shopify', shopDomain, dateRange, async () => {
        if (!shopData?.accessToken) return [];
        const result = await shopifyService.fetchOrders(dateRange, shopData.accessToken, shopDomain);
        return (result.connected && result.data?.length > 0) ? result.data : [];
      }),
      getDataWithCache('meta', shopDomain, dateRange, async () => {
        const result = await metaService.fetchDailyInsights(dateRange, shopDomain);
        return result.data || [];
      }),
      getDataWithCache('google', shopDomain, dateRange, async () => {
        const result = await googleAdsService.fetchDailyMetrics(dateRange, shopDomain);
        return result.data || [];
      }),
      getDataWithCache('klaviyo', shopDomain, dateRange, async () => {
        const result = await klaviyoService.fetchMetrics(dateRange, shopDomain);
        return result.data || [];
      }),
      getDataWithCache('ga4', shopDomain, dateRange, async () => {
        const result = await ga4Service.fetchDailyMetrics(dateRange, shopDomain);
        return result.data || [];
      }),
      getDataWithCache('tiktok', shopDomain, dateRange, async () => {
        const result = await tiktokService.fetchDailyMetrics(dateRange, shopDomain);
        return result.data || [];
      }),
    ]);

    const dashboardData = {
      shopify: shopifyData,
      meta: metaData,
      google: googleData,
      tiktok: tiktokData,
      klaviyo: klaviyoData,
      ga4: ga4Data,
      timestamp: new Date().toISOString(),
    };

    // Save snapshot to database for this shop
    const today = new Date().toISOString().split('T')[0];
    if (shopifyData && Array.isArray(shopifyData)) {
      const totalRevenue = shopifyData.reduce((sum, day) => sum + (day.revenue || 0), 0);
      await saveSnapshot(shopDomain, today, 'shopify', 'revenue', totalRevenue);
    }

    res.json(dashboardData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/data/sync-status - Returns last sync time per platform
router.get('/sync-status', (req, res) => {
  try {
    const { shopDomain } = req;
    const status = getSyncStatus(shopDomain);
    res.json({ shopDomain, platforms: status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/data/history - Historical data for forecasting
router.get('/history', async (req, res) => {
  try {
    const { shopDomain, shopData } = req;
    const { metric = 'revenue', days = 365 } = req.query;
    const dateRange = getDateRange(parseInt(days));

    const cacheKeyPrefix = `history:${shopDomain}`;

    const dbHistory = await getHistory(shopDomain, metric, dateRange);

    if (dbHistory && dbHistory.length > 0) {
      return res.json({
        metric,
        period: `${days} days`,
        data: dbHistory,
        source: 'database',
      });
    }

    const shopifyData = await getCachedOrFetch(
      `${cacheKeyPrefix}:${metric}:${days}d`,
      async () => {
        const result = await shopifyService.fetchOrders(dateRange, shopData.accessToken, shopDomain);
        return result.data || [];
      },
      600
    );

    res.json({
      metric,
      period: `${days} days`,
      data: shopifyData,
      source: 'api',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/data/shopify/orders
router.get('/shopify/orders', async (req, res) => {
  try {
    const { shopDomain, shopData } = req;
    const dateRange = getDateRange(30);

    const data = await getCachedOrFetch(
      `data:${shopDomain}:shopify:orders:30d`,
      async () => {
        const result = await shopifyService.fetchOrders(dateRange, shopData.accessToken, shopDomain);
        return result.data || [];
      },
      300
    );

    res.json({ source: 'shopify', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/data/meta/campaigns
router.get('/meta/campaigns', async (req, res) => {
  try {
    const { shopDomain } = req;
    const dateRange = getDateRange(30);

    const data = await getCachedOrFetch(
      `data:${shopDomain}:meta:campaigns:30d`,
      async () => {
        const result = await metaService.fetchCampaigns(dateRange, shopDomain);
        return result.data || [];
      },
      300
    );

    res.json({ source: 'meta', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/data/google/campaigns
router.get('/google/campaigns', async (req, res) => {
  try {
    const { shopDomain } = req;
    const dateRange = getDateRange(30);

    const data = await getCachedOrFetch(
      `data:${shopDomain}:google:campaigns:30d`,
      async () => {
        const result = await googleAdsService.fetchCampaigns(dateRange, shopDomain);
        return result.data || [];
      },
      300
    );

    res.json({ source: 'google', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/data/klaviyo/flows
router.get('/klaviyo/flows', async (req, res) => {
  try {
    const { shopDomain } = req;

    const data = await getCachedOrFetch(
      `data:${shopDomain}:klaviyo:flows`,
      async () => {
        const result = await klaviyoService.fetchFlows();
        return result.data || [];
      },
      300
    );

    res.json({ source: 'klaviyo', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/data/ga4/sessions
router.get('/ga4/sessions', async (req, res) => {
  try {
    const { shopDomain } = req;
    const dateRange = getDateRange(30);

    const data = await getCachedOrFetch(
      `data:${shopDomain}:ga4:sessions:30d`,
      async () => {
        const result = await ga4Service.fetchDailyMetrics(dateRange, shopDomain);
        return result.data || [];
      },
      300
    );

    res.json({ source: 'ga4', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/data/invalidate - Invalidate cache for a source
router.post('/invalidate', (req, res) => {
  const { shopDomain } = req;
  const { source } = req.body;

  if (source) {
    invalidateCache(`data:${shopDomain}:${source}:*`);
    invalidateCache(`dashboard:${shopDomain}:${source}:*`);
    invalidateCache(`history:${shopDomain}:${source}:*`);
    res.json({ message: `Cache invalidated for ${source} on shop ${shopDomain}` });
  } else {
    invalidateCache(`data:${shopDomain}:*`);
    invalidateCache(`dashboard:${shopDomain}:*`);
    invalidateCache(`history:${shopDomain}:*`);
    res.json({ message: `All cache invalidated for shop ${shopDomain}` });
  }
});

export default router;
