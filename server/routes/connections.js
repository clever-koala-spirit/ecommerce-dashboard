import express from 'express';
import { shopifyService } from '../services/shopify.js';
import { metaService } from '../services/meta.js';
import { googleAdsService } from '../services/google.js';
import { klaviyoService } from '../services/klaviyo.js';
import { ga4Service } from '../services/ga4.js';
import { getDataCoverage, logSync, getLastSyncLog } from '../db/database.js';

const router = express.Router();

const services = {
  shopify: shopifyService,
  meta: metaService,
  google: googleAdsService,
  klaviyo: klaviyoService,
  ga4: ga4Service,
};

// GET /api/connections - Returns status of all connections
router.get('/', async (req, res) => {
  try {
    const { shopDomain, shopData } = req;
    const status = {};

    // Test all connections in parallel
    const testPromises = Object.entries(services).map(async ([name, service]) => {
      try {
        let testResult;

        // Pass access token for Shopify, other services use their own auth
        if (name === 'shopify') {
          testResult = await service.testConnection(shopData.accessToken);
        } else {
          testResult = await service.testConnection();
        }

        const lastSync = getLastSyncLog(shopDomain, name);

        return {
          name,
          status: {
            connected: testResult.connected,
            status: testResult.status,
            error: testResult.error,
            lastSynced: lastSync?.synced_at || null,
            recordsSynced: lastSync?.records_synced || 0,
            message: testResult.message || testResult.shopName || null,
          }
        };
      } catch (error) {
        return {
          name,
          status: {
            connected: false,
            status: 'error',
            error: error.message,
            lastSynced: null,
            recordsSynced: 0,
            message: null,
          }
        };
      }
    });

    const results = await Promise.allSettled(testPromises);

    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value) {
        status[result.value.name] = result.value.status;
      }
    });

    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/connections/:source/test - Test a specific connection
router.post('/:source/test', async (req, res) => {
  try {
    const { shopDomain, shopData } = req;
    const { source } = req.params;
    const service = services[source];

    if (!service) {
      return res.status(404).json({ error: 'Unknown source' });
    }

    let result;

    // Pass access token for Shopify
    if (source === 'shopify') {
      result = await service.testConnection(shopData.accessToken);
    } else {
      result = await service.testConnection();
    }

    res.json({
      source,
      shopDomain,
      ...result,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/connections/:source/sync - Trigger manual sync
router.post('/:source/sync', async (req, res) => {
  try {
    const { shopDomain, shopData } = req;
    const { source } = req.params;
    const service = services[source];

    if (!service) {
      return res.status(404).json({ error: 'Unknown source' });
    }

    let testResult;

    // Pass access token for Shopify
    if (source === 'shopify') {
      testResult = await service.testConnection(shopData.accessToken);
    } else {
      testResult = await service.testConnection();
    }

    if (!testResult.connected) {
      return res.status(400).json({
        error: 'Source not connected',
        details: testResult.error,
      });
    }

    // Trigger sync (would normally happen here)
    logSync(shopDomain, source, 'started', 0);

    res.json({
      source,
      shopDomain,
      status: 'syncing',
      message: `Sync started for ${source}`,
    });

    // Simulate sync completion
    setTimeout(() => {
      logSync(shopDomain, source, 'completed', 100);
    }, 2000);
  } catch (error) {
    const { shopDomain } = req;
    const { source } = req.params;
    logSync(shopDomain, source, 'failed', 0, error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/connections/:source/data - Get latest data for a source
router.get('/:source/data', async (req, res) => {
  try {
    const { shopDomain, shopData } = req;
    const { source } = req.params;
    const service = services[source];

    if (!service) {
      return res.status(404).json({ error: 'Unknown source' });
    }

    let testResult;

    // Pass access token for Shopify
    if (source === 'shopify') {
      testResult = await service.testConnection(shopData.accessToken);
    } else {
      testResult = await service.testConnection();
    }

    if (!testResult.connected) {
      return res.status(400).json({
        error: 'Source not connected',
        details: testResult.error,
      });
    }

    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const dateRange = {
      start: thirtyDaysAgo.toISOString().split('T')[0],
      end: today.toISOString().split('T')[0],
    };

    let data;

    switch (source) {
      case 'shopify':
        data = await service.fetchOrders(dateRange, shopData.accessToken);
        break;
      case 'meta':
        data = await service.fetchDailyInsights(dateRange);
        break;
      case 'google':
        data = await service.fetchDailyMetrics(dateRange);
        break;
      case 'klaviyo':
        data = await service.fetchMetrics(dateRange);
        break;
      case 'ga4':
        data = await service.fetchDailyMetrics(dateRange);
        break;
      default:
        return res.status(400).json({ error: 'Unknown source' });
    }

    res.json({
      source,
      shopDomain,
      ...data,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/connections/coverage - Returns data coverage stats
router.get('/coverage/stats', (req, res) => {
  try {
    const { shopDomain } = req;
    const coverage = getDataCoverage(shopDomain);
    res.json(coverage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
