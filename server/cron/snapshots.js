import cron from 'node-cron';
import { shopifyService } from '../services/shopify.js';
import { metaService } from '../services/meta.js';
import { googleAdsService } from '../services/google.js';
import { klaviyoService } from '../services/klaviyo.js';
import { ga4Service } from '../services/ga4.js';
import { saveSnapshot, logSync, getAllActiveShops } from '../db/database.js';

const services = {
  shopify: shopifyService,
  meta: metaService,
  google: googleAdsService,
  klaviyo: klaviyoService,
  ga4: ga4Service,
};

async function syncSource(shopDomain, shopAccessToken, sourceName, service) {
  try {
    let testResult;

    // Pass access token for Shopify service
    if (sourceName === 'shopify') {
      testResult = await service.testConnection(shopAccessToken, shopDomain);
    } else {
      testResult = await service.testConnection();
    }

    if (!testResult.connected) {
      logSync(shopDomain, sourceName, 'skipped', 0, 'Source not connected');
      return { sourceName, status: 'skipped' };
    }

    const today = new Date();
    const dateRange = {
      start: today.toISOString().split('T')[0],
      end: today.toISOString().split('T')[0],
    };

    let data;
    let recordCount = 0;

    switch (sourceName) {
      case 'shopify':
        const shopifyResult = await service.fetchOrders(dateRange, shopAccessToken, shopDomain);
        if (shopifyResult.data) {
          data = shopifyResult.data;
          recordCount = data.length;
          data.forEach((day) => {
            saveSnapshot(
              shopDomain,
              day.date,
              sourceName,
              'revenue',
              day.revenue,
              { orders: day.orders, aov: day.aov }
            );
          });
        }
        break;

      case 'meta':
        const metaResult = await service.fetchDailyInsights(dateRange);
        if (metaResult.data) {
          data = metaResult.data;
          recordCount = data.length;
          data.forEach((day) => {
            saveSnapshot(
              shopDomain,
              day.date,
              sourceName,
              'spend',
              day.spend,
              { roas: day.roas, impressions: day.impressions }
            );
          });
        }
        break;

      case 'google':
        const googleResult = await service.fetchDailyMetrics(dateRange);
        if (googleResult.data) {
          data = googleResult.data;
          recordCount = data.length;
          data.forEach((day) => {
            saveSnapshot(
              shopDomain,
              day.date,
              sourceName,
              'spend',
              day.spend,
              { roas: day.roas, clicks: day.clicks }
            );
          });
        }
        break;

      case 'klaviyo':
        const klaviyoResult = await service.fetchMetrics(dateRange);
        if (klaviyoResult.data) {
          data = klaviyoResult.data;
          recordCount = data.length;
        }
        break;

      case 'ga4':
        const ga4Result = await service.fetchDailyMetrics(dateRange);
        if (ga4Result.data) {
          data = ga4Result.data;
          recordCount = data.length;
          data.forEach((day) => {
            saveSnapshot(
              shopDomain,
              day.date,
              sourceName,
              'sessions',
              day.sessions,
              { revenue: day.revenue, conversionRate: day.conversionRate }
            );
          });
        }
        break;
    }

    logSync(shopDomain, sourceName, 'completed', recordCount);
    console.log(
      `[Cron] Snapshot created for ${shopDomain} - ${sourceName}: ${recordCount} records`
    );

    return { sourceName, status: 'completed', recordCount };
  } catch (error) {
    const errorMsg = error.message || 'Unknown error';
    logSync(shopDomain, sourceName, 'failed', 0, errorMsg);
    console.error(
      `[Cron] Error syncing ${sourceName} for ${shopDomain}:`,
      errorMsg
    );

    return { sourceName, status: 'failed', error: errorMsg };
  }
}

export function startCronJobs() {
  // Run daily at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('[Cron] Starting daily snapshot sync...');

    const allResults = [];
    const shops = getAllActiveShops();

    if (shops.length === 0) {
      console.log('[Cron] No active shops found');
      return;
    }

    for (const shop of shops) {
      console.log(`[Cron] Syncing shop: ${shop.shopDomain}`);
      const results = [];

      for (const [sourceName, service] of Object.entries(services)) {
        const result = await syncSource(shop.shopDomain, shop.accessToken, sourceName, service);
        results.push(result);
      }

      allResults.push({ shop: shop.shopDomain, results });
    }

    console.log('[Cron] Daily snapshot sync completed:', allResults);
  });

  // Also run every 30 minutes for demo/testing purposes
  cron.schedule('*/30 * * * *', async () => {
    console.log('[Cron] Running 30-minute refresh...');

    const shops = getAllActiveShops();

    if (shops.length === 0) {
      console.log('[Cron] No active shops found. Using mock data.');
      return;
    }

    for (const shop of shops) {
      const connectedSources = [];

      for (const [sourceName, service] of Object.entries(services)) {
        let testResult;

        // Pass access token for Shopify service
        if (sourceName === 'shopify') {
          testResult = await service.testConnection(shop.accessToken, shop.shopDomain);
        } else {
          testResult = await service.testConnection();
        }

        if (testResult.connected) {
          connectedSources.push(sourceName);
          const result = await syncSource(shop.shopDomain, shop.accessToken, sourceName, service);
          console.log(`[Cron] Refreshed ${sourceName} for ${shop.shopDomain}:`, result.status);
        }
      }

      if (connectedSources.length === 0) {
        console.log(`[Cron] No sources connected for ${shop.shopDomain}. Using mock data.`);
      }
    }
  });

  console.log('[Cron] Cron jobs started');
}

export function stopCronJobs() {
  cron.getTasks().forEach((task) => task.stop());
  console.log('[Cron] All cron jobs stopped');
}
