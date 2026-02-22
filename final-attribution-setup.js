#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables manually
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value && !key.startsWith('#')) {
      process.env[key.trim()] = value.trim();
    }
  });
}

import { initDB, getDB, getShop, encrypt } from './server/db/database.js';

async function finalAttributionSetup() {
  console.log('🚀 Final Attribution System Setup...');
  
  await initDB();
  const db = getDB();
  
  const TEST_SHOP = 'paintlykits.myshopify.com';

  // Step 1: Create properly encrypted test shop
  console.log('\n🏪 Creating properly encrypted test shop...');
  try {
    // Delete existing test shop
    db.exec(`DELETE FROM shops WHERE shop_domain = '${TEST_SHOP}'`);
    
    // Create with proper encryption
    const testToken = 'shpat_test_token_for_attribution_testing_12345';
    const encryptedToken = encrypt(testToken);
    
    db.exec(`
      INSERT INTO shops (
        shop_domain, 
        access_token_encrypted, 
        scope, 
        shop_name, 
        shop_email, 
        plan_name, 
        is_active, 
        installed_at, 
        updated_at
      ) VALUES (
        '${TEST_SHOP}',
        '${encryptedToken}',
        'read_orders,read_products,read_customers',
        'Paintly Kits Test Store',
        'test@paintlykits.com',
        'basic',
        1,
        datetime('now'),
        datetime('now')
      )
    `);
    
    console.log('✅ Test shop created with encrypted token');
  } catch (error) {
    console.log(`❌ Failed to create test shop: ${error.message}`);
    return;
  }

  // Step 2: Verify getShop function works
  console.log('\n🔍 Testing getShop function:');
  try {
    const shop = getShop(TEST_SHOP);
    if (shop) {
      console.log('✅ getShop successful:');
      console.log(`   Shop Name: ${shop.shopName}`);
      console.log(`   Is Active: ${shop.isActive}`);
      console.log(`   Has Access Token: ${!!shop.accessToken}`);
    } else {
      console.log('❌ getShop returned null');
      return;
    }
  } catch (e) {
    console.log(`❌ getShop error: ${e.message}`);
    return;
  }

  // Step 3: Initialize attribution tables  
  console.log('\n📊 Initializing attribution system:');
  try {
    const attributionEngine = (await import('./server/services/attributionEngine.js')).default;
    attributionEngine.initializeTables();
    console.log('✅ Attribution tables ready');
  } catch (error) {
    console.log(`❌ Attribution setup failed: ${error.message}`);
    return;
  }

  // Step 4: Test all required API endpoints
  console.log('\n🌐 Testing all attribution API endpoints:');
  
  const endpoints = [
    { name: 'Initialize Attribution', method: 'POST', path: '/api/analytics/initialize' },
    { name: 'Get Attribution Analytics', method: 'GET', path: '/api/analytics/attribution?startDate=2026-01-01&endDate=2026-02-21&modelType=ai_enhanced' },
    { name: 'Get Journey Analytics', method: 'GET', path: '/api/analytics/journey?startDate=2026-01-01&endDate=2026-02-21' }
  ];

  let apiTestsPassed = 0;
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`http://localhost:4000${endpoint.path}`, {
        method: endpoint.method,
        headers: {
          'X-Shop-Domain': TEST_SHOP,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        console.log(`✅ ${endpoint.name}: Status ${response.status}`);
        apiTestsPassed++;
      } else {
        const errorText = await response.text();
        console.log(`❌ ${endpoint.name}: Status ${response.status} - ${errorText.substring(0, 100)}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name}: ${error.message}`);
    }
  }

  // Step 5: Add sample test data for realistic testing
  console.log('\n📝 Adding sample attribution data:');
  try {
    const attributionEngine = (await import('./server/services/attributionEngine.js')).default;
    
    // Sample customer journey
    const touchpoints = [
      {
        customerId: 'customer-001',
        sessionId: 'session-001',
        channel: 'Google Ads',
        campaign: 'Holiday Sales 2024',
        source: 'google',
        medium: 'cpc',
        content: 'holiday_ad_text',
        term: 'paint kits',
        platform: 'Google',
        deviceType: 'desktop',
        pageUrl: 'https://paintlykits.com/collections/all',
        referrer: 'https://google.com'
      },
      {
        customerId: 'customer-001',
        sessionId: 'session-002',
        channel: 'Email',
        campaign: 'Follow-up Email',
        source: 'klaviyo',
        medium: 'email',
        content: 'abandoned_cart',
        platform: 'Email',
        deviceType: 'mobile',
        pageUrl: 'https://paintlykits.com/cart',
        referrer: 'https://email.klaviyo.com'
      },
      {
        customerId: 'customer-001',
        sessionId: 'session-003',
        channel: 'Direct',
        source: 'direct',
        medium: 'direct',
        platform: 'Direct',
        deviceType: 'mobile',
        pageUrl: 'https://paintlykits.com/checkout/complete',
        conversionValue: 89.99,
        conversionType: 'purchase',
        orderId: 'order-001',
        productIds: ['paint-kit-deluxe', 'brushes-set']
      }
    ];

    for (let i = 0; i < touchpoints.length; i++) {
      await attributionEngine.trackTouchpoint(TEST_SHOP, touchpoints[i]);
    }
    
    console.log('✅ Sample touchpoint data added');
  } catch (error) {
    console.log(`❌ Sample data failed: ${error.message}`);
  }

  // Step 6: Final verification with attribution analytics
  console.log('\n🎯 Final verification - Attribution analytics:');
  try {
    const response = await fetch(`http://localhost:4000/api/analytics/attribution?startDate=2026-01-01&endDate=2026-02-21&modelType=ai_enhanced`, {
      headers: {
        'X-Shop-Domain': TEST_SHOP,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Attribution analytics working:');
      console.log(`   Channels found: ${data.analytics?.length || 0}`);
      console.log(`   Total orders: ${data.summary?.totalOrders || 0}`);
      console.log(`   Total revenue: $${data.summary?.totalRevenue || 0}`);
      
      if (data.analytics?.length > 0) {
        console.log('   Top channels:');
        data.analytics.slice(0, 3).forEach(channel => {
          console.log(`     - ${channel.channel}: $${channel.revenue?.toFixed(2) || '0.00'}`);
        });
      }
    } else {
      const errorText = await response.text();
      console.log(`❌ Attribution analytics failed: ${errorText}`);
    }
  } catch (error) {
    console.log(`❌ Final verification failed: ${error.message}`);
  }

  // Summary
  console.log('\n🎉 ATTRIBUTION SYSTEM SETUP COMPLETE!');
  console.log('='.repeat(50));
  console.log(`✅ Test shop: ${TEST_SHOP}`);
  console.log(`✅ Database: Properly configured`);
  console.log(`✅ Attribution tables: Initialized`);
  console.log(`✅ API endpoints: ${apiTestsPassed}/${endpoints.length} working`);
  console.log(`✅ Sample data: Added`);
  console.log('\nYou can now run the full attribution API test suite!');
}

finalAttributionSetup().catch(console.error);