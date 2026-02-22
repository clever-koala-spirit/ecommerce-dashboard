#!/usr/bin/env node

/**
 * Test Script for Customer Segmentation API Endpoints
 * 
 * This script tests our new /api/analytics/customer-segments and 
 * /api/analytics/new-vs-returning endpoints to ensure they work
 * with real data from the dashboard.
 */

import { config } from 'dotenv';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '.env') });

// Import our services directly
import customerSegmentation from './server/services/customerSegmentation.js';

console.log('🔥 CUSTOMER SEGMENTATION API TEST');
console.log('==================================\n');

async function testCustomerSegmentationAPI() {
  try {
    // Test shop domain (use a real one from your database)
    const testShopDomain = 'paintly-kits.myshopify.com';
    
    console.log(`Testing with shop domain: ${testShopDomain}\n`);

    // Test 1: Customer Segmentation Analysis
    console.log('📊 Test 1: Customer Segmentation Analysis');
    console.log('------------------------------------------');
    
    const segmentationResult = await customerSegmentation.getCustomerSegmentation(testShopDomain, {
      startDate: '2024-01-01',
      endDate: '2024-02-21',
      currency: 'USD'
    });

    if (segmentationResult.success) {
      console.log('✅ Customer Segmentation API: SUCCESS');
      console.log(`   New Customers: ${segmentationResult.data.newCustomers.customerCount}`);
      console.log(`   Returning Customers: ${segmentationResult.data.returningCustomers.customerCount}`);
      console.log(`   New Customer Revenue: $${segmentationResult.data.newCustomers.totalRevenue.toFixed(2)}`);
      console.log(`   Returning Customer Revenue: $${segmentationResult.data.returningCustomers.totalRevenue.toFixed(2)}`);
      console.log(`   New Customer Profit Margin: ${segmentationResult.data.newCustomers.profitMargin.toFixed(1)}%`);
      console.log(`   Returning Customer Profit Margin: ${segmentationResult.data.returningCustomers.profitMargin.toFixed(1)}%`);
      console.log(`   Total Cohorts: ${segmentationResult.data.cohorts.totalCohorts}`);
      console.log(`   Acquisition Channels: ${segmentationResult.data.acquisitionFunnel.channels.length}`);
    } else {
      console.log('❌ Customer Segmentation API: FAILED');
      console.log(segmentationResult);
    }

    console.log('\n');

    // Test 2: New vs Returning Trends
    console.log('📈 Test 2: New vs Returning Trends Analysis');
    console.log('-------------------------------------------');

    const trendsResult = await customerSegmentation.getNewVsReturningTrends(testShopDomain, {
      startDate: '2024-01-01',
      endDate: '2024-02-21',
      granularity: 'daily'
    });

    if (trendsResult.success) {
      console.log('✅ Trends Analysis API: SUCCESS');
      console.log(`   Date Range: ${trendsResult.data.dateRange.startDate} to ${trendsResult.data.dateRange.endDate}`);
      console.log(`   Granularity: ${trendsResult.data.granularity}`);
      console.log(`   Total Data Points: ${Object.keys(trendsResult.data.trends).length}`);
      
      // Show sample data point
      const sampleDate = Object.keys(trendsResult.data.trends)[0];
      if (sampleDate) {
        const sample = trendsResult.data.trends[sampleDate];
        console.log(`   Sample (${sampleDate}):`);
        console.log(`     New Customers: ${sample.new.uniqueCustomers} customers, $${sample.new.revenue.toFixed(2)} revenue`);
        console.log(`     Returning Customers: ${sample.returning.uniqueCustomers} customers, $${sample.returning.revenue.toFixed(2)} revenue`);
      }
    } else {
      console.log('❌ Trends Analysis API: FAILED');
      console.log(trendsResult);
    }

    console.log('\n');

  } catch (error) {
    console.error('🚨 TEST FAILED:', error);
    console.log('Error details:', {
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 5).join('\n')
    });
  }
}

async function testWithExpressAPI() {
  console.log('🌐 Test 3: Express API Endpoints');
  console.log('--------------------------------');

  try {
    // Start a minimal Express server to test the actual endpoints
    const app = express();
    app.use(express.json());

    // Import and use analytics routes
    const analyticsRouter = (await import('./server/routes/analytics.js')).default;
    
    // Mock middleware for testing
    app.use((req, res, next) => {
      req.shopDomain = 'paintly-kits.myshopify.com';
      next();
    });

    app.use('/api/analytics', analyticsRouter);

    const server = app.listen(0, () => {
      const port = server.address().port;
      console.log(`✅ Test server started on port ${port}`);

      // Test the endpoints
      testEndpoint(port, '/api/analytics/customer-segments?startDate=2024-01-01&endDate=2024-02-21')
        .then(() => testEndpoint(port, '/api/analytics/new-vs-returning?startDate=2024-01-01&endDate=2024-02-21&granularity=daily'))
        .finally(() => {
          server.close();
          console.log('✅ Test server closed\n');
        });
    });

  } catch (error) {
    console.error('🚨 Express API Test Failed:', error.message);
  }
}

async function testEndpoint(port, endpoint) {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`http://localhost:${port}${endpoint}`);
    const data = await response.json();

    if (response.ok) {
      console.log(`✅ ${endpoint}: SUCCESS (${response.status})`);
      console.log(`   Response size: ${JSON.stringify(data).length} bytes`);
      
      if (data.success) {
        console.log(`   Data structure: ${Object.keys(data.data || {}).join(', ')}`);
      }
    } else {
      console.log(`❌ ${endpoint}: FAILED (${response.status})`);
      console.log(`   Error: ${data.error}`);
    }
  } catch (error) {
    console.log(`❌ ${endpoint}: NETWORK ERROR`);
    console.log(`   ${error.message}`);
  }
}

// Run all tests
async function runAllTests() {
  console.log('Starting Customer Segmentation API Tests...\n');
  
  await testCustomerSegmentationAPI();
  await testWithExpressAPI();
  
  console.log('🎉 All tests completed!');
  console.log('💀 Triple Whale is officially defeated by our superior customer segmentation.');
  
  process.exit(0);
}

runAllTests().catch(error => {
  console.error('💥 Test suite failed:', error);
  process.exit(1);
});