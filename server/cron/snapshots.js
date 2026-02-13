import cron from 'node-cron';
import { shopifyService } from '../services/shopify.js';
import { metaService } from '../services/meta.js';
import { googleAdsService } from '../services/google.js';
import { klaviyoService } from '../services/klaviyo.js';
import { ga4Service } from '../services/ga4.js';
import { saveSnapshot, logSync } from '../db/database.js';

const services = {
  shopify: shopifyService,
  meta: metaService,
  google: googleAdsService,
  klaviyo: klaviyoService,
  ga4: ga4Service,
};

async function syncSource(sourceName, service) {
  try {
    const testResult = await service.testConnection();

    if (!testResult.connected) {
      logSync(sourceName, 'skipped', 0, 'Source not connected');
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
        const shopifyResult = await service.fetchOrders(dateRange);
        if (shopifyResult.data) {
          data = shopifyResult.data;
          recordCount = data.length;
          data.forEach((day) => {
            saveSnapshot(
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

    logSync(sourceName, 'completed', recordCount);
    console.log(
      `[Cron] Snapshot created for ${sourceName}: ${recordCount} records`
    );

    return { sourceName, status: 'completed', recordCount };
  } catch (error) {
    const errorMsg = error.message || 'Unknown error';
    logSync(sourceName, 'failed', 0, errorMsg);
    console.error(
      `[Cron] Error syncing ${sourceName}:`,
      errorMsg
    );

    return { sourceName, status: 'failed', error: errorMsg };
  }
}

export function startCronJobs() {
  // Run daily at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('[Cron] Starting daily snapshot sync...');

    const results = [];

    for (const [sourceName, service] of Object.entries(services)) {
      const result = await syncSource(sourceName, service);
      results.push(result);
    }

    console.log('[Cron] Daily snapshot sync completed:', results);
  });

  // Also run every 30 minutes for demo/testing purposes
  cron.schedule('*/30 * * * *', async () => {
    console.log('[Cron] Running 30-minute refresh...');

    // Only sync sources that are connected
    const connectedSources = [];

    for (const [sourceName, service] of Object.entries(services)) {
      const testResult = await service.testConnection();
      if (testResult.connected) {
        connectedSources.push(sourceName);
        const result = await syncSource(sourceName, service);
        console.log(`[Cron] Refreshed ${sourceName}:`, result.status);
      }
    }

    if (connectedSources.length === 0) {
      console.log('[Cron] No sources connected. Using mock data.');
    }
  });

  console.log('[Cron] Cron jobs started');
}

export function stopCronJobs() {
  cron.getTasks().forEach((task) => task.stop());
  console.log('[Cron] All cron jobs stopped');
}
