#!/usr/bin/env node

/**
 * Setup Test Data for Slay Season Backend Testing
 * Adds test shop and sample metric data for comprehensive testing
 */

import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

import { initDB, getDB, encrypt } from './db/database.js';

const TEST_SHOP = 'paintlykits.myshopify.com';

async function setupTestData() {
  console.log('🔧 Setting up test data for comprehensive backend testing...\n');
  
  await initDB();
  const db = getDB();

  // 1. Add test shop if it doesn't exist
  console.log('1. Adding test shop...');
  
  try {
    // Check if shop already exists
    const existingShop = db.exec(`SELECT * FROM shops WHERE shop_domain = ?`, [TEST_SHOP]);
    
    if (existingShop.length === 0 || existingShop[0].values.length === 0) {
      // Create test shop
      const testAccessToken = encrypt('test-access-token-123');
      
      db.run(`
        INSERT INTO shops (
          shop_domain, access_token_encrypted, scope, shop_name, shop_email,
          plan_name, is_active, installed_at
        ) VALUES (?, ?, ?, ?, ?, ?, 1, ?)
      `, [
        TEST_SHOP,
        testAccessToken,
        'read_orders,read_products,read_analytics',
        'Paintly Kits Test Store',
        'test@paintlykits.com',
        'Growth',
        new Date().toISOString()
      ]);
      
      console.log('✅ Test shop added successfully');
    } else {
      console.log('✅ Test shop already exists');
    }
  } catch (error) {
    console.log(`❌ Error adding test shop: ${error.message}`);
  }

  // 2. Add sample platform connections
  console.log('2. Adding platform connections...');
  
  const platforms = [
    { platform: 'shopify', credentials: { access_token: 'test-token' } },
    { platform: 'google', credentials: { access_token: 'test-google-token' } },
    { platform: 'meta', credentials: { access_token: 'test-meta-token' } },
    { platform: 'klaviyo', credentials: { api_key: 'test-klaviyo-key' } }
  ];

  for (const { platform, credentials } of platforms) {
    try {
      const encryptedCredentials = encrypt(JSON.stringify(credentials));
      
      db.run(`
        INSERT OR REPLACE INTO platform_connections (
          shop_domain, platform, credentials_encrypted, status, last_sync_at
        ) VALUES (?, ?, ?, 'active', ?)
      `, [TEST_SHOP, platform, encryptedCredentials, new Date().toISOString()]);
      
      console.log(`✅ ${platform} connection added`);
    } catch (error) {
      console.log(`❌ Error adding ${platform} connection: ${error.message}`);
    }
  }

  // 3. Add sample metric snapshots (last 30 days of data)
  console.log('3. Adding sample metric snapshots...');
  
  try {
    const today = new Date();
    const metricsData = [];
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Generate realistic sample data
      const baseRevenue = 800 + Math.random() * 400; // $800-1200 per day
      const orders = Math.floor(baseRevenue / 60) + Math.floor(Math.random() * 5); // ~$60 AOV
      const adSpend = baseRevenue * 0.25 + Math.random() * 50; // ~25% ad spend
      const cogs = baseRevenue * 0.588; // 58.8% COGS as specified
      
      metricsData.push(
        [TEST_SHOP, dateStr, 'shopify', 'revenue', baseRevenue, new Date().toISOString()],
        [TEST_SHOP, dateStr, 'shopify', 'orders', orders, new Date().toISOString()],
        [TEST_SHOP, dateStr, 'meta', 'ad_spend', adSpend, new Date().toISOString()],
        [TEST_SHOP, dateStr, 'internal', 'cogs', cogs, new Date().toISOString()]
      );
    }
    
    // Clear existing test data
    db.run(`DELETE FROM metric_snapshots WHERE shop_domain = ?`, [TEST_SHOP]);
    
    // Insert new data
    const insertStmt = db.prepare(`
      INSERT INTO metric_snapshots (shop_domain, date, source, metric, value, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    metricsData.forEach(data => {
      insertStmt.run(data);
    });
    
    insertStmt.free();
    
    console.log(`✅ Added ${metricsData.length} metric snapshots`);
  } catch (error) {
    console.log(`❌ Error adding metric snapshots: ${error.message}`);
  }

  // 4. Verify the data
  console.log('4. Verifying test data...');
  
  try {
    // Check shop
    const shopCheck = db.exec(`SELECT shop_domain, shop_name, is_active FROM shops WHERE shop_domain = ?`, [TEST_SHOP]);
    if (shopCheck.length > 0 && shopCheck[0].values.length > 0) {
      console.log(`✅ Shop verified: ${shopCheck[0].values[0].join(', ')}`);
    }
    
    // Check connections
    const connectionCheck = db.exec(`SELECT platform, status FROM platform_connections WHERE shop_domain = ?`, [TEST_SHOP]);
    if (connectionCheck.length > 0 && connectionCheck[0].values.length > 0) {
      console.log(`✅ Connections verified: ${connectionCheck[0].values.length} platforms connected`);
    }
    
    // Check metrics
    const metricCheck = db.exec(`
      SELECT 
        COUNT(*) as total_records,
        SUM(CASE WHEN metric = 'revenue' THEN value ELSE 0 END) as total_revenue,
        SUM(CASE WHEN metric = 'orders' THEN value ELSE 0 END) as total_orders
      FROM metric_snapshots 
      WHERE shop_domain = ?
    `, [TEST_SHOP]);
    
    if (metricCheck.length > 0 && metricCheck[0].values.length > 0) {
      const [totalRecords, totalRevenue, totalOrders] = metricCheck[0].values[0];
      console.log(`✅ Metrics verified: ${totalRecords} records, $${totalRevenue.toFixed(2)} revenue, ${totalOrders} orders`);
    }
    
  } catch (error) {
    console.log(`❌ Error verifying data: ${error.message}`);
  }

  console.log('\n🎉 Test data setup complete!');
  console.log('\nYou can now run:');
  console.log('  cd .. && node comprehensive-backend-test.js');
  console.log('\nTo test the backend with realistic sample data.');
}

setupTestData().catch(error => {
  console.error(`Setup failed: ${error.message}`);
  process.exit(1);
});