#!/usr/bin/env node

import { initDB, getDB } from './server/db/database.js';
import attributionEngine from './server/services/attributionEngine.js';

async function setupCompleteTestEnvironment() {
  console.log('🚀 Setting up complete test environment...');
  
  await initDB();
  const db = getDB();
  
  const TEST_SHOP = 'paintlykits.myshopify.com';

  // Step 1: Create test shop with all required fields
  console.log('\n🏪 Creating test shop...');
  try {
    const insertShop = db.prepare(`
      INSERT OR REPLACE INTO shops (
        shop_domain, 
        access_token_encrypted, 
        scope, 
        shop_name, 
        shop_email, 
        plan_name, 
        is_active, 
        installed_at, 
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);

    insertShop.run([
      TEST_SHOP,
      'test-encrypted-token-12345', // Required field
      'read_orders,read_products,read_customers', // Required field
      'Paintly Kits Test Store',
      'test@paintlykits.com',
      'basic',
      1 // is_active = true
    ]);
    
    console.log('✅ Test shop created successfully');
  } catch (error) {
    console.log(`❌ Failed to create test shop: ${error.message}`);
    process.exit(1);
  }

  // Step 2: Initialize attribution tables
  console.log('\n📊 Initializing attribution tables...');
  try {
    attributionEngine.initializeTables();
    console.log('✅ Attribution tables initialized');
  } catch (error) {
    console.log(`❌ Failed to initialize attribution tables: ${error.message}`);
    process.exit(1);
  }

  // Step 3: Verify shop exists
  console.log('\n🔍 Verifying shop...');
  try {
    const shop = db.prepare('SELECT * FROM shops WHERE shop_domain = ?').get(TEST_SHOP);
    if (shop) {
      console.log(`✅ Shop verified: ${shop.shop_name} (Active: ${shop.is_active})`);
    } else {
      console.log('❌ Shop verification failed');
      process.exit(1);
    }
  } catch (error) {
    console.log(`❌ Shop verification error: ${error.message}`);
    process.exit(1);
  }

  // Step 4: Verify attribution tables
  console.log('\n📋 Verifying attribution tables...');
  const tables = ['customer_touchpoints', 'attribution_models', 'attribution_results'];
  for (const table of tables) {
    try {
      const result = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get();
      console.log(`✅ ${table}: exists (${result.count} records)`);
    } catch (error) {
      console.log(`❌ ${table}: ${error.message}`);
      process.exit(1);
    }
  }

  // Step 5: Add some sample data for testing
  console.log('\n📝 Adding sample touchpoint data...');
  try {
    await attributionEngine.trackTouchpoint(TEST_SHOP, {
      customerId: 'test-customer-001',
      sessionId: 'test-session-001',
      channel: 'Google Ads',
      campaign: 'Test Campaign',
      source: 'google',
      medium: 'cpc',
      content: 'test_ad',
      term: 'test_keyword',
      platform: 'Google',
      deviceType: 'desktop',
      pageUrl: 'https://paintlykits.com/test',
      referrer: 'https://google.com'
    });

    await attributionEngine.trackTouchpoint(TEST_SHOP, {
      customerId: 'test-customer-001',
      sessionId: 'test-session-001',
      channel: 'Direct',
      campaign: null,
      source: 'direct',
      medium: 'direct',
      platform: 'Direct',
      deviceType: 'desktop',
      pageUrl: 'https://paintlykits.com/checkout',
      referrer: null,
      conversionValue: 99.99,
      conversionType: 'purchase',
      orderId: 'test-order-001',
      productIds: ['test-prod-1', 'test-prod-2']
    });
    
    console.log('✅ Sample touchpoint data added');
  } catch (error) {
    console.log(`❌ Failed to add sample data: ${error.message}`);
  }

  // Step 6: Test API call
  console.log('\n🌐 Testing API authentication...');
  try {
    const response = await fetch('http://localhost:4000/api/analytics/attribution', {
      method: 'GET',
      headers: {
        'X-Shop-Domain': TEST_SHOP,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log(`Status: ${response.status}`);
    
    if (response.ok) {
      console.log('✅ API authentication successful');
      console.log(`   Found ${data.analytics?.length || 0} channels in attribution data`);
    } else {
      console.log(`❌ API call failed: ${data.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.log(`❌ API test failed: ${error.message}`);
  }

  console.log('\n🎉 Test environment setup complete!');
  console.log(`\nYou can now run tests with shop: ${TEST_SHOP}`);
}

setupCompleteTestEnvironment().catch(console.error);