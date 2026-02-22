#!/usr/bin/env node

import { initDB, getDB } from './server/db/database.js';

async function setupTestShop() {
  console.log('Setting up test shop for attribution testing...');
  
  await initDB();
  const db = getDB();

  const testShop = {
    shopDomain: 'paintlykits.myshopify.com',
    shopName: 'Paintly Kits Test Store',
    accessToken: 'test-token-encrypted',
    scope: 'read_orders,read_customers,read_products',
    shopEmail: 'test@paintlykits.com',
    planName: 'basic',
    isActive: 1
  };

  try {
    // Insert or update test shop
    const insertShop = db.prepare(`
      INSERT OR REPLACE INTO shops (
        shop_domain, shop_name, access_token_encrypted, scope, 
        shop_email, plan_name, is_active, installed_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);

    insertShop.run([
      testShop.shopDomain,
      testShop.shopName,
      testShop.accessToken,
      testShop.scope,
      testShop.shopEmail,
      testShop.planName,
      testShop.isActive
    ]);

    console.log(`✅ Test shop created/updated: ${testShop.shopDomain}`);

    // Initialize attribution tables for this shop
    const attributionEngine = (await import('./server/services/attributionEngine.js')).default;
    attributionEngine.initializeTables();
    console.log('✅ Attribution tables initialized');

    // Verify the shop exists
    const shopCheck = db.prepare('SELECT * FROM shops WHERE shop_domain = ?').get(testShop.shopDomain);
    if (shopCheck) {
      console.log(`✅ Shop verified: ${shopCheck.shop_name} (Active: ${shopCheck.is_active})`);
    }

    console.log('\n🎉 Test shop setup complete! You can now run attribution API tests.');
    
  } catch (error) {
    console.error('❌ Error setting up test shop:', error.message);
    process.exit(1);
  }
}

setupTestShop().catch(console.error);