#!/usr/bin/env node

// Simple test script for inventory API endpoints
const testShopId = 'test-shop.myshopify.com';
const baseURL = 'http://localhost:4000';

async function testInventoryEndpoints() {
  console.log('🧪 Testing Inventory Management API Endpoints\n');

  const endpoints = [
    '/api/inventory/levels',
    '/api/inventory/summary', 
    '/api/inventory/alerts',
    '/api/inventory/turnover',
    '/api/inventory/forecast?days=30'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`📡 Testing: ${endpoint}`);
      
      const response = await fetch(`${baseURL}${endpoint}`, {
        headers: {
          'X-Shop-Id': testShopId,
          'Content-Type': 'application/json'
        }
      });

      console.log(`   Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   Success: ${data.success ? '✅' : '❌'}`);
        
        if (data.data) {
          if (data.data.products) {
            console.log(`   Products: ${data.data.products.length}`);
          }
          if (data.data.alerts) {
            console.log(`   Alerts: ${data.data.alerts.length}`);
          }
          if (data.data.kpis) {
            console.log(`   KPIs: ${Object.keys(data.data.kpis).length} metrics`);
          }
        }
      } else {
        const error = await response.text();
        console.log(`   Error: ${error.substring(0, 100)}...`);
      }
      
    } catch (error) {
      console.log(`   Failed: ${error.message}`);
    }
    
    console.log(''); // Empty line for readability
  }

  console.log('🏁 Test completed');
}

// Check if server is running first
fetch(`${baseURL}/api/health`)
  .then(response => {
    if (response.ok) {
      console.log('✅ Server is running\n');
      return testInventoryEndpoints();
    } else {
      throw new Error('Server not responding');
    }
  })
  .catch(error => {
    console.log('❌ Server is not running or not accessible');
    console.log('   Please start the server with: npm run start');
    console.log('   Error:', error.message);
    process.exit(1);
  });