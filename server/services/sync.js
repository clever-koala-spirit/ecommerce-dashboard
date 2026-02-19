import { getDB, getAllActiveShops, getAllPlatformConnections, getShop } from '../db/database.js';
import { shopifyService } from './shopify.js';
import { googleAdsService } from './google.js';
import { metaService } from './meta.js';
import { klaviyoService } from './klaviyo.js';
import { ga4Service } from './ga4.js';
import { tiktokService } from './tiktok.js';

const SYNC_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes
let syncTimer = null;
let isSyncing = false;

// Store timezone for consistent date calculations
const STORE_TIMEZONE = 'America/New_York';

function getDateRange(days = 90) {
  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: STORE_TIMEZONE });
  const [y, m, d] = todayStr.split('-').map(Number);
  const today = new Date(y, m - 1, d);
  const start = new Date(today.getTime() - days * 24 * 60 * 60 * 1000);
  const startStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
  return { start: startStr, end: todayStr };
}

/**
 * Save daily metrics to the daily_metrics table
 */
function saveDailyMetrics(date, platform, shopDomain, metricsJson) {
  const db = getDB();
  db.run(
    `INSERT INTO daily_metrics (date, platform, shop_domain, metrics_json, updated_at)
     VALUES (?, ?, ?, ?, datetime('now'))
     ON CONFLICT(date, platform, shop_domain) DO UPDATE SET
       metrics_json = excluded.metrics_json,
       updated_at = datetime('now')`,
    [date, platform, shopDomain, typeof metricsJson === 'string' ? metricsJson : JSON.stringify(metricsJson)]
  );
}

/**
 * Get cached daily metrics for a date range
 */
export function getCachedMetrics(platform, shopDomain, startDate, endDate) {
  const db = getDB();
  const results = db.exec(
    `SELECT date, metrics_json, updated_at FROM daily_metrics
     WHERE platform = ? AND shop_domain = ? AND date >= ? AND date <= ?
     ORDER BY date ASC`,
    [platform, shopDomain, startDate, endDate]
  );
  if (results.length === 0 || results[0].values.length === 0) return [];
  return results[0].values.map(row => ({
    date: row[0],
    metrics: JSON.parse(row[1]),
    updatedAt: row[2],
  }));
}

/**
 * Get sync status for all platforms for a shop
 */
export function getSyncStatus(shopDomain) {
  const db = getDB();
  const results = db.exec(
    `SELECT platform, MAX(updated_at) as last_sync FROM daily_metrics
     WHERE shop_domain = ? GROUP BY platform`,
    [shopDomain]
  );
  const status = {};
  if (results.length > 0 && results[0].values.length > 0) {
    results[0].values.forEach(row => {
      status[row[0]] = { lastSync: row[1] };
    });
  }
  return status;
}

/**
 * Sync a single platform's data for a shop
 */
async function syncPlatform(platform, shopDomain, dateRange, shopData) {
  try {
    let result;
    switch (platform) {
      case 'shopify':
        if (!shopData?.accessToken) return { success: false, error: 'No access token' };
        result = await shopifyService.fetchOrders(dateRange, shopData.accessToken, shopDomain);
        break;
      case 'google':
        result = await googleAdsService.fetchDailyMetrics(dateRange, shopDomain);
        break;
      case 'meta':
        result = await metaService.fetchDailyInsights(dateRange);
        break;
      case 'klaviyo':
        result = await klaviyoService.fetchMetrics(dateRange);
        break;
      case 'ga4':
        result = await ga4Service.fetchDailyMetrics(dateRange);
        break;
      case 'tiktok':
        result = await tiktokService.fetchDailyMetrics(dateRange, shopDomain);
        break;
      default:
        return { success: false, error: `Unknown platform: ${platform}` };
    }

    const data = result?.data || result || [];
    if (!Array.isArray(data)) {
      // Store as single entry for the full range
      saveDailyMetrics(dateRange.start, platform, shopDomain, data);
      return { success: true, records: 1 };
    }

    // Store each day's data individually
    let records = 0;
    for (const dayData of data) {
      const date = dayData.date || dateRange.start;
      saveDailyMetrics(date, platform, shopDomain, dayData);
      records++;
    }

    // If we got data as a flat array without dates, store the whole thing keyed by start date
    if (records === 0 && data.length > 0) {
      saveDailyMetrics(dateRange.start, platform, shopDomain, data);
      records = 1;
    }

    return { success: true, records };
  } catch (err) {
    console.error(`[Sync] Error syncing ${platform} for ${shopDomain}:`, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Run a full sync for all shops and platforms
 */
export async function runFullSync(days = 90) {
  if (isSyncing) {
    console.log('[Sync] Already syncing, skipping...');
    return;
  }

  isSyncing = true;
  console.log(`[Sync] Starting background sync (${days} days)...`);

  try {
    const shops = getAllActiveShops();
    if (!shops || shops.length === 0) {
      console.log('[Sync] No active shops found');
      return;
    }

    const dateRange = getDateRange(days);

    for (const shop of shops) {
      const shopDomain = shop.shopDomain;
      console.log(`[Sync] Syncing ${shopDomain}...`);

      // Always sync Shopify (it's the core platform)
      await syncPlatform('shopify', shopDomain, dateRange, shop);

      // Sync connected platforms
      const connections = getAllPlatformConnections(shopDomain);
      const connectedPlatforms = connections
        .filter(c => c.status === 'active')
        .map(c => c.platform);

      for (const platform of connectedPlatforms) {
        if (platform === 'shopify') continue; // Already synced
        await syncPlatform(platform, shopDomain, dateRange, shop);
      }
    }

    console.log('[Sync] Background sync complete');
  } catch (err) {
    console.error('[Sync] Background sync failed:', err.message);
  } finally {
    isSyncing = false;
  }
}

/**
 * Sync a specific date range for a shop (for refresh requests)
 */
export async function syncShopData(shopDomain, dateRange) {
  const shop = getShop(shopDomain);
  if (!shop) throw new Error(`Shop not found: ${shopDomain}`);

  const results = {};

  // Sync Shopify
  results.shopify = await syncPlatform('shopify', shopDomain, dateRange, shop);

  // Sync connected platforms
  const connections = getAllPlatformConnections(shopDomain);
  const connectedPlatforms = connections
    .filter(c => c.status === 'active')
    .map(c => c.platform);

  for (const platform of connectedPlatforms) {
    if (platform === 'shopify') continue;
    results[platform] = await syncPlatform(platform, shopDomain, dateRange, shop);
  }

  return results;
}

/**
 * Start the background sync timer
 */
export function startSyncSchedule() {
  // Initial sync on startup (last 90 days)
  setTimeout(() => {
    runFullSync(90).catch(err => console.error('[Sync] Initial sync error:', err.message));
  }, 5000); // Wait 5 seconds for services to initialize

  // Schedule recurring sync every 15 minutes
  syncTimer = setInterval(() => {
    // Only sync last 7 days on recurring syncs (faster)
    runFullSync(7).catch(err => console.error('[Sync] Scheduled sync error:', err.message));
  }, SYNC_INTERVAL_MS);

  console.log('[Sync] Background sync scheduled every 15 minutes');
}

/**
 * Stop the background sync timer
 */
export function stopSyncSchedule() {
  if (syncTimer) {
    clearInterval(syncTimer);
    syncTimer = null;
  }
}
