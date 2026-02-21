-- SLAY SEASON DASHBOARD FIX
-- Fixes: $748 vs $29K+ revenue, NaN calculations, missing data

-- 1. Create domain alias (paintlykits.myshopify.com -> 5ugwnx-v8.myshopify.com)
INSERT INTO shops (shop_domain, access_token_encrypted, scope, shop_name, shop_email, plan_name, is_active)
SELECT 'paintlykits.myshopify.com', access_token_encrypted, scope, shop_name, shop_email, plan_name, is_active 
FROM shops WHERE shop_domain = '5ugwnx-v8.myshopify.com'
ON CONFLICT(shop_domain) DO UPDATE SET
  access_token_encrypted = excluded.access_token_encrypted,
  scope = excluded.scope,
  shop_name = excluded.shop_name,
  is_active = 1;

-- 2. Copy all metric data to the alias domain
INSERT INTO metric_snapshots (shop_domain, date, source, metric, value, dimensions, created_at)
SELECT 'paintlykits.myshopify.com', date, source, metric, value, dimensions, created_at
FROM metric_snapshots 
WHERE shop_domain = '5ugwnx-v8.myshopify.com'
ON CONFLICT DO NOTHING;

-- 3. Populate daily_metrics cache (this is what the dashboard API reads)
DELETE FROM daily_metrics WHERE shop_domain = 'paintlykits.myshopify.com';

INSERT INTO daily_metrics (date, platform, shop_domain, metrics_json, updated_at)
SELECT 
  date,
  source as platform,
  'paintlykits.myshopify.com' as shop_domain,
  json_object(
    'revenue', COALESCE(SUM(CASE WHEN metric = 'revenue' THEN value END), 0),
    'orders', COALESCE(SUM(CASE WHEN metric = 'orders' THEN value END), 0),
    'cogs', COALESCE(SUM(CASE WHEN metric = 'cogs' THEN value END), 0),
    'shipping', COALESCE(SUM(CASE WHEN metric = 'shipping' THEN value END), 0),
    'adSpend', COALESCE(SUM(CASE WHEN metric = 'adSpend' THEN value END), 0),
    'profit', COALESCE(SUM(CASE WHEN metric = 'revenue' THEN value END), 0) - 
              COALESCE(SUM(CASE WHEN metric = 'cogs' THEN value END), 0) - 
              COALESCE(SUM(CASE WHEN metric = 'adSpend' THEN value END), 0)
  ) as metrics_json,
  CURRENT_TIMESTAMP as updated_at
FROM metric_snapshots 
WHERE shop_domain = '5ugwnx-v8.myshopify.com'
  AND date >= date('now', '-90 days')
GROUP BY date, source
ORDER BY date DESC;

-- 4. Verification queries
SELECT 'SHOPS:' as verification_step;
SELECT shop_domain, shop_name, is_active FROM shops WHERE shop_domain LIKE '%paintly%';

SELECT 'DAILY METRICS SUMMARY:' as verification_step;
SELECT 
  platform, 
  COUNT(*) as days_of_data,
  SUM(JSON_EXTRACT(metrics_json, '$.revenue')) as total_revenue,
  SUM(JSON_EXTRACT(metrics_json, '$.orders')) as total_orders
FROM daily_metrics 
WHERE shop_domain = 'paintlykits.myshopify.com'
GROUP BY platform;

SELECT 'RECENT REVENUE DATA:' as verification_step;
SELECT 
  date, 
  platform, 
  JSON_EXTRACT(metrics_json, '$.revenue') as daily_revenue
FROM daily_metrics 
WHERE shop_domain = 'paintlykits.myshopify.com' 
  AND date >= date('now', '-7 days')
ORDER BY date DESC, platform;