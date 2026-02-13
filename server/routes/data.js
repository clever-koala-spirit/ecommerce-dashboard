import express from 'express';
import { shopifyService } from '../services/shopify.js';
import { metaService } from '../services/meta.js';
import { googleAdsService } from '../services/google.js';
import { klaviyoService } from '../services/klaviyo.js';
import { ga4Service } from '../services/ga4.js';
import { getCachedOrFetch, invalidateCache } from '../middleware/cache.js';
import { mockData } from '../mock/mockData.js';

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
    const dateRange = getDateRange(30);

    const shopifyData = await getCachedOrFetch(
      'dashboard:shopify:30d',
      async () => {
        const result = await shopifyService.fetchOrders(dateRange);
        return result.data || mockData.shopify;
      },
      300
    );

    const metaData = await getCachedOrFetch(
      'dashboard:meta:30d',
      async () => {
        const result = await metaService.fetchDailyInsights(dateRange);
        return result.data || mockData.meta;
      },
      300
    );

    const googleData = await getCachedOrFetch(
      'dashboard:google:30d',
      async () => {
        const result = await googleAdsService.fetchDailyMetrics(dateRange);
        return result.data || mockData.google;
      },
      300
    );

    const klaviyoData = await getCachedOrFetch(
      'dashboard:klaviyo:30d',
      async () => {
        const result = await klaviyoService.fetchMetrics(dateRange);
        return result.data || mockData.klaviyo;
      },
      300
    );

    const ga4Data = await getCachedOrFetch(
      'dashboard:ga4:30d',
      async () => {
        const result = await ga4Service.fetchDailyMetrics(dateRange);
        return result.data || mockData.ga4;
      },
      300
    );

    res.json({
      shopify: shopifyData,
      meta: metaData,
      google: googleData,
      klaviyo: klaviyoData,
      ga4: ga4Data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/data/history - Historical data for forecasting
router.get('/history', async (req, res) => {
  try {
    const { metric = 'revenue', days = 365 } = req.query;
    const dateRange = getDateRange(parseInt(days));

    // In production, this would fetch from the database
    // For now, return mock data or live data
    const shopifyData = await getCachedOrFetch(
      `history:${metric}:${days}d`,
      async () => {
        const result = await shopifyService.fetchOrders(dateRange);
        return result.data || mockData.shopify;
      },
      600
    );

    res.json({
      metric,
      period: `${days} days`,
      data: shopifyData,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/data/shopify/orders
router.get('/shopify/orders', async (req, res) => {
  try {
    const dateRange = getDateRange(30);

    const data = await getCachedOrFetch(
      'data:shopify:orders:30d',
      async () => {
        const result = await shopifyService.fetchOrders(dateRange);
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
    const dateRange = getDateRange(30);

    const data = await getCachedOrFetch(
      'data:meta:campaigns:30d',
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
    const dateRange = getDateRange(30);

    const data = await getCachedOrFetch(
      'data:google:campaigns:30d',
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
    const data = await getCachedOrFetch(
      'data:klaviyo:flows',
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
    const dateRange = getDateRange(30);

    const data = await getCachedOrFetch(
      'data:ga4:sessions:30d',
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
  const { source, pattern = '*' } = req.body;

  if (source) {
    invalidateCache(`data:${source}:*`);
    invalidateCache(`dashboard:${source}:*`);
    res.json({ message: `Cache invalidated for ${source}` });
  } else {
    invalidateCache(`data:*`);
    invalidateCache(`dashboard:*`);
    res.json({ message: 'All cache invalidated' });
  }
});

export default router;
