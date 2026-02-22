#!/usr/bin/env node

import { initDB, getDB, getShop } from './server/db/database.js';

async function verifySetup() {
  console.log('🔍 Verifying test setup...');
  
  await initDB();
  const db = getDB();
  
  const TEST_SHOP = 'paintlykits.myshopify.com';

  // Check shops table structure
  console.log('\n📋 Shops table structure:');
  try {
    const tableInfo = db.exec("PRAGMA table_info(shops)");
    if (tableInfo.length > 0) {
      console.log('Columns:', tableInfo[0].values.map(row => `${row[1]} (${row[2]})`).join(', '));
    }
  } catch (e) {
    console.log('Error getting table info:', e.message);
  }

  // Check if shop exists using SQL
  console.log('\n🏪 Shop lookup (SQL):');
  try {
    const result = db.exec(`SELECT shop_domain, shop_name, is_active, installed_at FROM shops WHERE shop_domain = '${TEST_SHOP}'`);
    if (result.length > 0 && result[0].values.length > 0) {
      const row = result[0].values[0];
      console.log(`✅ Found shop: ${row[0]} | Name: ${row[1]} | Active: ${row[2]} | Installed: ${row[3]}`);
    } else {
      console.log(`❌ Shop not found: ${TEST_SHOP}`);
      
      // Try to create it
      console.log('\n🛠️  Creating test shop...');
      db.exec(`
        INSERT OR REPLACE INTO shops (
          shop_domain, shop_name, is_active, installed_at, updated_at
        ) VALUES (
          '${TEST_SHOP}', 'Test Paintly Kits', 1, datetime('now'), datetime('now')
        )
      `);
      console.log('✅ Test shop created');
    }
  } catch (e) {
    console.log('❌ SQL query error:', e.message);
  }

  // Check using getShop function
  console.log('\n🏪 Shop lookup (getShop function):');
  try {
    const shop = getShop(TEST_SHOP);
    if (shop) {
      console.log(`✅ getShop found: ${shop.shopName || 'No name'} | Active: ${shop.isActive}`);
    } else {
      console.log(`❌ getShop returned null for ${TEST_SHOP}`);
    }
  } catch (e) {
    console.log('❌ getShop error:', e.message);
  }

  // Check attribution tables
  console.log('\n📊 Attribution tables:');
  const tables = ['customer_touchpoints', 'attribution_models', 'attribution_results'];
  for (const table of tables) {
    try {
      const result = db.exec(`SELECT COUNT(*) FROM ${table}`);
      const count = result[0].values[0][0];
      console.log(`✅ ${table}: ${count} records`);
    } catch (e) {
      console.log(`❌ ${table}: ${e.message}`);
    }
  }

  // Test API call
  console.log('\n🌐 Testing API call:');
  try {
    const response = await fetch('http://localhost:4000/api/analytics/initialize', {
      method: 'POST',
      headers: {
        'X-Shop-Domain': TEST_SHOP,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.text();
    console.log(`Status: ${response.status}`);
    console.log(`Response: ${data.substring(0, 200)}`);
  } catch (e) {
    console.log(`❌ API call failed: ${e.message}`);
  }
}

verifySetup().catch(console.error);