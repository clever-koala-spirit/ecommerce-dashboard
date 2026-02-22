#!/usr/bin/env node

import { initDB, getDB } from './server/db/database.js';

async function debugDatabase() {
  console.log('🔍 Debugging database...');
  
  await initDB();
  const db = getDB();
  
  const TEST_SHOP = 'paintlykits.myshopify.com';

  // Check what's actually in the shops table
  console.log('\n📋 Raw shops table data:');
  try {
    const result = db.prepare('SELECT * FROM shops WHERE shop_domain = ?').all(TEST_SHOP);
    console.log('Query result:', result);
    
    if (result.length > 0) {
      const shop = result[0];
      console.log('Shop object keys:', Object.keys(shop));
      console.log('Shop data:');
      for (const [key, value] of Object.entries(shop)) {
        console.log(`  ${key}: ${value}`);
      }
    } else {
      console.log('No shops found');
    }
  } catch (e) {
    console.log('Error:', e.message);
  }

  // Check the getShop function implementation
  console.log('\n🔧 Testing getShop function...');
  try {
    // Import the getShop function
    const { getShop } = await import('./server/db/database.js');
    const shop = getShop(TEST_SHOP);
    console.log('getShop result:', shop);
  } catch (e) {
    console.log('getShop error:', e.message);
  }

  console.log('\n🔧 Testing manual authentication middleware...');
  // Test what the auth middleware would see
  const mockReq = {
    shopDomain: null,
    headers: { 'x-shop-domain': TEST_SHOP },
    query: {},
    session: {}
  };

  const shopDomain = mockReq.shopDomain ||
                     mockReq.headers['x-shop-domain'] ||
                     mockReq.query.shop ||
                     mockReq.session?.shopDomain;

  console.log('Shop domain from headers:', shopDomain);

  if (shopDomain) {
    const shopRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/;
    console.log('Domain regex test:', shopRegex.test(shopDomain));

    try {
      const { getShop } = await import('./server/db/database.js');
      const shop = getShop(shopDomain);
      console.log('Shop lookup result:', shop);
      if (shop) {
        console.log('Shop active check:', shop.isActive);
      }
    } catch (e) {
      console.log('Shop lookup error:', e.message);
    }
  }
}

debugDatabase().catch(console.error);