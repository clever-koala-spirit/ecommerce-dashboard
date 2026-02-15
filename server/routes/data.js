import express from 'express';
import { shopifyService } from '../services/shopify.js';
import { metaService } from '../services/meta.js';
import { googleAdsService } from '../services/google.js';
import { tiktokService } from '../services/tiktok.js';
import { klaviyoService } from '../services/klaviyo.js';
import { ga4Service } from '../services/ga4.js';
import { getCachedOrFetch, invalidateCache } from '../middleware/cache.js';
import { mockData } from '../mock/mockData.js';
import { saveSnapshot, getHistory } from '../db/database.js';

const router = express.Router();

function getDateRange(days = 30) {
  const today = new Date();
  const start = new Date(today.getTime() - days * 24 * 60 * 60 * 1000);

  return {
    start: start.toISOString().split('T')[0],
    end: today.toISOString().split('T')[0],
  };
}

// GET /api/data/dashboard - Combined data from all sources
router.get('/dashboard', async (req, res) => {
  try {
    const { shopDomain, shopData } = req;
    const dateRange = getDateRange(30);

    // Create shop-specific cache keys
    const cacheKeyPrefix = `dashboard:${shopDomain}`;

    const shopifyData = await getCachedOrFetch(
      `${cacheKeyPrefix}:shopify:30d`,
      async () => {
        try {
          if (!shopData?.accessToken) throw new Error('No Shopify access token');
          const result = await shopifyService.fetchOrders(dateRange, shopData.accessToken, shopDomain);
          if (result.connected && result.data && result.data.length > 0) {
            return result.data;
          }
        } catch (err) {
          console.error('[Dashboard] Shopify fetch error:', err.message);
        }
        return mockData.shopify;
      },
      300
    );

    const metaData = await getCachedOrFetch(
      `${cacheKeyPrefix}:meta:30d`,
      async () => {
        const result = await metaService.fetchDailyInsights(dateRange);
        return result.data || mockData.meta;
      },
      300
    );

    const googleData = await getCachedOrFetch(
      `${cacheKeyPrefix}:google:30d`,
      async () => {
        const result = await googleAdsService.fetchDailyMetrics(dateRange);
        return result.data || mockData.google;
      },
      300
    );

    const klaviyoData = await getCachedOrFetch(
      `${cacheKeyPrefix}:klaviyo:30d`,
      async () => {
        const result = await klaviyoService.fetchMetrics(dateRange);
        return result.data || mockData.klaviyo;
      },
      300
    );

    const ga4Data = await getCachedOrFetch(
      `${cacheKeyPrefix}:ga4:30d`,
      async () => {
        const result = await ga4Service.fetchDailyMetrics(dateRange);
        return result.data || mockData.ga4;
      },
      300
    );

    const tiktokData = await getCachedOrFetch(
      `${cacheKeyPrefix}:tiktok:30d`,
      async () => {
        const result = await tiktokService.fetchDailyMetrics(dateRange, shopDomain);
        return result.data || mockData.tiktok;
      },
      300
    );

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
    // Save a revenue snapshot from Shopify data
    if (shopifyData && Array.isArray(shopifyData)) {
      const totalRevenue = shopifyData.reduce((sum, day) => sum + (day.revenue || 0), 0);
      await saveSnapshot(shopDomain, today, 'shopify', 'revenue', totalRevenue);
    }

    res.json(dashboardData);
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

    // Create shop-specific cache key
    const cacheKeyPrefix = `history:${shopDomain}`;

    // Try to get from database first (for the specific shop)
    const dbHistory = await getHistory(shopDomain, metric, dateRange);

    if (dbHistory && dbHistory.length > 0) {
      return res.json({
        metric,
        period: `${days} days`,
        data: dbHistory,
        source: 'database',
      });
    }

    // Fall back to live API data
    const shopifyData = await getCachedOrFetch(
      `${cacheKeyPrefix}:${metric}:${days}d`,
      async () => {
        const result = await shopifyService.fetchOrders(dateRange, shopData.accessToken, shopDomain);
        return result.data || mockData.shopify;
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
        return result.data || mockData.shopify;
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
        const result = await metaService.fetchCampaigns(dateRange);
        return result.data || mockData.metaCampaigns;
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
        const result = await googleAdsService.fetchCampaigns(dateRange);
        return result.data || mockData.googleCampaigns;
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
        return result.data || mockData.klaviyoFlows;
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
        const result = await ga4Service.fetchDailyMetrics(dateRange);
        return result.data || mockData.ga4;
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
  const { source, pattern = '*' } = req.body;

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
