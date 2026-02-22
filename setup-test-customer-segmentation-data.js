#!/usr/bin/env node

/**
 * Setup Test Data for Customer Segmentation
 * 
 * This script creates realistic test data for the customer segmentation
 * feature including new and returning customers with orders.
 */

import { initDB, getDB } from './server/db/database.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log('🧪 Setting up Customer Segmentation Test Data');
console.log('=============================================\n');

async function setupTestData() {
  try {
    // Initialize database
    console.log('📊 Initializing database...');
    await initDB();
    const db = getDB();
    console.log('✅ Database initialized');

    // Test shop domain
    const shopDomain = 'paintly-kits.myshopify.com';
    
    // Clear existing test data
    console.log('\n🧹 Clearing existing test data...');
    db.run(`DELETE FROM shopify_orders WHERE shop_domain = ?`, [shopDomain]);
    console.log('✅ Cleared existing orders');

    // Create test customers with varying order patterns
    console.log('\n👥 Creating test customers and orders...');
    
    const testCustomers = [
      // New customers (first order in our date range)
      {
        customerId: 'cust_001_new',
        email: 'alice.new@example.com',
        orders: [
          { date: '2024-01-15', price: 89.99, status: 'paid' }
        ]
      },
      {
        customerId: 'cust_002_new',
        email: 'bob.new@example.com',
        orders: [
          { date: '2024-01-20', price: 149.99, status: 'paid' }
        ]
      },
      {
        customerId: 'cust_003_new',
        email: 'carol.new@example.com',
        orders: [
          { date: '2024-02-01', price: 199.99, status: 'paid' },
          { date: '2024-02-10', price: 79.99, status: 'paid' }
        ]
      },
      
      // Returning customers (first order before our date range)
      {
        customerId: 'cust_004_returning',
        email: 'david.returning@example.com',
        orders: [
          { date: '2023-10-15', price: 125.50, status: 'paid' }, // First order (before range)
          { date: '2024-01-25', price: 95.00, status: 'paid' },  // Returning order
          { date: '2024-02-05', price: 110.00, status: 'paid' }  // Another return
        ]
      },
      {
        customerId: 'cust_005_returning',
        email: 'emma.returning@example.com',
        orders: [
          { date: '2023-11-01', price: 89.99, status: 'paid' }, // First order (before range)
          { date: '2024-01-30', price: 129.99, status: 'paid' } // Returning order
        ]
      },
      {
        customerId: 'cust_006_returning',
        email: 'frank.returning@example.com',
        orders: [
          { date: '2023-12-01', price: 199.99, status: 'paid' }, // First order (before range)
          { date: '2024-02-15', price: 89.99, status: 'paid' },  // Returning
          { date: '2024-02-18', price: 49.99, status: 'paid' }   // Another return
        ]
      }
    ];

    let orderIdCounter = 1;
    let totalOrdersInserted = 0;

    for (const customer of testCustomers) {
      for (const order of customer.orders) {
        const orderId = orderIdCounter++;
        
        db.run(`
          INSERT INTO shopify_orders (
            id, shop_domain, customer_id, customer_email,
            total_price, financial_status, fulfillment_status,
            order_number, currency, created_at, updated_at,
            processed_at, source_name, referring_site,
            total_tax, subtotal_price, gateway,
            contact_email, test_order, synced_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          orderId,                    // id
          shopDomain,                 // shop_domain  
          customer.customerId,        // customer_id
          customer.email,             // customer_email
          order.price,                // total_price
          order.status,               // financial_status
          'fulfilled',                // fulfillment_status
          1000 + orderId,             // order_number
          'USD',                      // currency
          order.date + 'T10:00:00Z',  // created_at
          order.date + 'T10:00:00Z',  // updated_at
          order.date + 'T10:00:00Z',  // processed_at
          orderId % 3 === 0 ? 'facebook' : orderId % 3 === 1 ? 'google' : 'web', // source_name
          orderId % 2 === 0 ? 'facebook.com' : 'google.com', // referring_site
          order.price * 0.08,         // total_tax (8%)
          order.price * 0.92,         // subtotal_price
          'shopify_payments',         // gateway
          customer.email,             // contact_email
          0,                          // test_order
          new Date().toISOString()    // synced_at
        ]);

        totalOrdersInserted++;
      }
      
      console.log(`  ✅ Created customer ${customer.customerId} with ${customer.orders.length} orders`);
    }

    console.log(`\n📈 Test data summary:`);
    console.log(`  Total customers: ${testCustomers.length}`);
    console.log(`  Total orders: ${totalOrdersInserted}`);
    
    // Verify the data
    console.log('\n🔍 Verifying test data...');
    
    const totalOrders = db.exec(`SELECT COUNT(*) FROM shopify_orders WHERE shop_domain = ?`, [shopDomain]);
    const newCustomerOrders = db.exec(`
      WITH first_orders AS (
        SELECT customer_id, MIN(created_at) as first_order
        FROM shopify_orders 
        WHERE shop_domain = ? AND financial_status = 'paid' AND customer_id IS NOT NULL
        GROUP BY customer_id
      )
      SELECT COUNT(*) FROM shopify_orders so
      JOIN first_orders fo ON so.customer_id = fo.customer_id
      WHERE so.shop_domain = ? 
        AND so.created_at >= '2024-01-01'
        AND DATE(so.created_at) = DATE(fo.first_order)
    `, [shopDomain, shopDomain]);
    
    const returningCustomerOrders = db.exec(`
      WITH first_orders AS (
        SELECT customer_id, MIN(created_at) as first_order
        FROM shopify_orders 
        WHERE shop_domain = ? AND financial_status = 'paid' AND customer_id IS NOT NULL
        GROUP BY customer_id
      )
      SELECT COUNT(*) FROM shopify_orders so
      JOIN first_orders fo ON so.customer_id = fo.customer_id
      WHERE so.shop_domain = ? 
        AND so.created_at >= '2024-01-01'
        AND DATE(so.created_at) != DATE(fo.first_order)
    `, [shopDomain, shopDomain]);

    console.log(`  ✅ Total orders in database: ${totalOrders[0].values[0][0]}`);
    console.log(`  ✅ New customer orders (first orders in 2024): ${newCustomerOrders[0].values[0][0]}`);
    console.log(`  ✅ Returning customer orders: ${returningCustomerOrders[0].values[0][0]}`);

    console.log('\n🎉 Test data setup complete!');
    console.log('You can now test the customer segmentation API endpoints.');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the setup
setupTestData().then(() => {
  console.log('\n💀 Triple Whale is about to get destroyed by our customer segmentation.');
  process.exit(0);
}).catch(error => {
  console.error('💥 Setup failed:', error);
  process.exit(1);
});