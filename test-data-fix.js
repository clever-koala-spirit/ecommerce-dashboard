#!/usr/bin/env node

// Quick test to check dashboard data for 5ugwnx-v8.myshopify.com
import { initDB, getDB } from './server/db/database.js';

await initDB();

const db = getDB();

// Get recent 30 days of revenue data
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
const dateFilter = thirtyDaysAgo.toISOString().split('T')[0];

console.log('=== SLAY SEASON DATA DEBUG ===');
console.log('Shop Domain: 5ugwnx-v8.myShopify.com');
console.log('Date Filter (last 30 days):', dateFilter);
console.log('');

// Test revenue data
const revenueResults = db.exec(`
  SELECT date, value, source FROM metric_snapshots 
  WHERE shop_domain = ? AND metric = 'revenue' AND date >= ? 
  ORDER BY date DESC LIMIT 20
`, ['5ugwnx-v8.myshopify.com', dateFilter]);

if (revenueResults.length > 0 && revenueResults[0].values.length > 0) {
  console.log('📊 RECENT REVENUE DATA:');
  revenueResults[0].values.forEach(([date, value, source]) => {
    console.log(`  ${date}: $${parseFloat(value).toFixed(2)} (${source})`);
  });
  
  // Calculate total
  const total = revenueResults[0].values.reduce((sum, [,value]) => sum + parseFloat(value), 0);
  console.log(`\n💰 TOTAL LAST 30 DAYS: $${total.toFixed(2)}`);
} else {
  console.log('❌ NO REVENUE DATA FOUND');
}

console.log('\n=== ORDERS DATA ===');
const ordersResults = db.exec(`
  SELECT date, value, source FROM metric_snapshots 
  WHERE shop_domain = ? AND metric = 'orders' AND date >= ? 
  ORDER BY date DESC LIMIT 10
`, ['5ugwnx-v8.myshopify.com', dateFilter]);

if (ordersResults.length > 0 && ordersResults[0].values.length > 0) {
  const totalOrders = ordersResults[0].values.reduce((sum, [,value]) => sum + parseFloat(value), 0);
  console.log(`📦 TOTAL ORDERS LAST 30 DAYS: ${totalOrders}`);
} else {
  console.log('❌ NO ORDERS DATA FOUND');
}

// Check all available metrics
console.log('\n=== ALL AVAILABLE METRICS ===');
const metricsResults = db.exec(`
  SELECT DISTINCT metric, COUNT(*) as count FROM metric_snapshots 
  WHERE shop_domain = ? GROUP BY metric ORDER BY metric
`, ['5ugwnx-v8.myshopify.com']);

if (metricsResults.length > 0) {
  metricsResults[0].values.forEach(([metric, count]) => {
    console.log(`  ${metric}: ${count} records`);
  });
}

// Add domain alias
console.log('\n=== ADDING DOMAIN ALIAS ===');
try {
  // Get the shop data
  const shopResults = db.exec(`SELECT * FROM shops WHERE shop_domain = ?`, ['5ugwnx-v8.myshopify.com']);
  
  if (shopResults.length > 0 && shopResults[0].values.length > 0) {
    const [id, shopDomain, accessToken, scope, shopName, shopEmail, planName, isActive, installedAt] = shopResults[0].values[0];
    
    // Insert alias with same data
    db.run(`
      INSERT INTO shops (shop_domain, access_token_encrypted, scope, shop_name, shop_email, plan_name, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(shop_domain) DO UPDATE SET
        access_token_encrypted = excluded.access_token_encrypted,
        scope = excluded.scope,
        shop_name = excluded.shop_name,
        is_active = 1
    `, ['paintlykits.myshopify.com', accessToken, scope, shopName, shopEmail, planName, isActive]);
    
    console.log('✅ Added domain alias: paintlykits.myshopify.com → 5ugwnx-v8.myshopify.com');
  }
} catch (error) {
  console.log('❌ Failed to add domain alias:', error.message);
}

console.log('\n=== DOMAIN ALIAS TEST ===');
const aliasResults = db.exec(`SELECT shop_domain, shop_name FROM shops WHERE shop_domain IN (?, ?)`, 
  ['5ugwnx-v8.myshopify.com', 'paintlykits.myshopify.com']);

if (aliasResults.length > 0) {
  console.log('Available domains:');
  aliasResults[0].values.forEach(([domain, name]) => {
    console.log(`  ${domain} → ${name}`);
  });
}