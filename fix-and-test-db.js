#!/usr/bin/env node

import { initDB, getDB, getShop } from './server/db/database.js';

async function fixAndTestDatabase() {
  console.log('🔧 Fixing and testing database...');
  
  await initDB();
  const db = getDB();
  
  const TEST_SHOP = 'paintlykits.myshopify.com';

  // Check current state
  console.log('\n📋 Current shops in database:');
  try {
    const results = db.exec('SELECT shop_domain, shop_name, is_active FROM shops');
    if (results.length > 0 && results[0].values.length > 0) {
      results[0].values.forEach(row => {
        console.log(`  - ${row[0]} | Name: ${row[1]} | Active: ${row[2]}`);
      });
    } else {
      console.log('  No shops found');
    }
  } catch (e) {
    console.log('Error:', e.message);
  }

  // Fix/create the test shop properly
  console.log(`\n🏪 Setting up test shop: ${TEST_SHOP}`);
  try {
    // Delete any existing test shop first
    db.exec(`DELETE FROM shops WHERE shop_domain = '${TEST_SHOP}'`);
    
    // Create shop with proper values
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
        'test-encrypted-token-12345',
        'read_orders,read_products,read_customers',
        'Paintly Kits Test Store',
        'test@paintlykits.com',
        'basic',
        1,
        datetime('now'),
        datetime('now')
      )
    `);
    
    console.log('✅ Test shop created');
  } catch (error) {
    console.log(`❌ Failed to create test shop: ${error.message}`);
  }

  // Verify with direct query
  console.log('\n🔍 Verifying shop with direct query:');
  try {
    const results = db.exec(`SELECT * FROM shops WHERE shop_domain = '${TEST_SHOP}'`);
    if (results.length > 0 && results[0].values.length > 0) {
      const row = results[0].values[0];
      console.log('✅ Shop found:');
      console.log(`   Domain: ${row[1]}`);
      console.log(`   Name: ${row[4]}`);
      console.log(`   Active: ${row[9]}`);
      console.log(`   Installed: ${row[7]}`);
    } else {
      console.log('❌ Shop not found in direct query');
    }
  } catch (e) {
    console.log(`❌ Direct query error: ${e.message}`);
  }

  // Test getShop function
  console.log('\n🔍 Testing getShop function:');
  try {
    const shop = getShop(TEST_SHOP);
    if (shop) {
      console.log('✅ getShop successful:');
      console.log(`   Shop Name: ${shop.shopName}`);
      console.log(`   Is Active: ${shop.isActive}`);
      console.log(`   Plan: ${shop.planName}`);
    } else {
      console.log('❌ getShop returned null');
    }
  } catch (e) {
    console.log(`❌ getShop error: ${e.message}`);
  }

  // Initialize attribution tables
  console.log('\n📊 Setting up attribution tables:');
  try {
    const attributionEngine = (await import('./server/services/attributionEngine.js')).default;
    attributionEngine.initializeTables();
    console.log('✅ Attribution tables initialized');
  } catch (error) {
    console.log(`❌ Attribution tables failed: ${error.message}`);
  }

  // Test API authentication
  console.log('\n🌐 Testing API with proper authentication:');
  try {
    const response = await fetch('http://localhost:4000/api/analytics/attribution', {
      method: 'GET',
      headers: {
        'X-Shop-Domain': TEST_SHOP,
        'Content-Type': 'application/json'
      }
    });
    
    const responseText = await response.text();
    console.log(`Status: ${response.status}`);
    
    if (response.status === 200) {
      console.log('✅ API authentication successful!');
      try {
        const data = JSON.parse(responseText);
        console.log(`   Found ${data.analytics?.length || 0} channels`);
        console.log(`   Total revenue: $${data.summary?.totalRevenue || 0}`);
      } catch {
        console.log('   Response received (not JSON)');
      }
    } else {
      console.log(`❌ API response: ${responseText.substring(0, 200)}`);
    }
  } catch (error) {
    console.log(`❌ API test failed: ${error.message}`);
  }

  console.log('\n🎉 Database setup and testing complete!');
  console.log(`\nTest shop ready: ${TEST_SHOP}`);
}

fixAndTestDatabase().catch(console.error);