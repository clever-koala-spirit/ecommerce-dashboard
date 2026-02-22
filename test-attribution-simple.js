#!/usr/bin/env node

const BASE_URL = 'http://localhost:4000';
const SHOP_DOMAIN = 'paintlykits.myshopify.com';

async function testAttributionAPI() {
  console.log('\n🎯 ATTRIBUTION API TESTS\n');
  console.log('='.repeat(50));
  
  let passed = 0;
  let failed = 0;
  const startTime = Date.now();

  // Helper function to make API calls
  async function apiTest(name, method, endpoint, data, expectedStatus = 200) {
    try {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Shop-Domain': SHOP_DOMAIN
        }
      };
      
      if (data && method !== 'GET') {
        options.body = JSON.stringify(data);
      }
      
      if (method === 'GET' && data) {
        const params = new URLSearchParams(data);
        endpoint += `?${params}`;
      }

      const response = await fetch(`${BASE_URL}${endpoint}`, options);
      const responseData = await response.text();
      
      let parsedData = null;
      try {
        parsedData = JSON.parse(responseData);
      } catch (e) {
        parsedData = responseData;
      }

      if (response.status === expectedStatus || (response.status >= 200 && response.status < 300)) {
        console.log(`✅ ${name}`);
        console.log(`   Status: ${response.status}`);
        if (parsedData && typeof parsedData === 'object') {
          console.log(`   Response keys: ${Object.keys(parsedData).join(', ')}`);
        }
        passed++;
        return { success: true, data: parsedData };
      } else {
        console.log(`❌ ${name}`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Response: ${responseData.substring(0, 200)}...`);
        failed++;
        return { success: false, data: parsedData };
      }
    } catch (error) {
      console.log(`❌ ${name} - ${error.message}`);
      failed++;
      return { success: false, error: error.message };
    }
  }

  // Test 1: Initialize Attribution Tables
  await apiTest(
    'Initialize Attribution Tables', 
    'POST', 
    '/api/analytics/initialize'
  );

  // Test 2: Track Touchpoint
  const touchpointData = {
    customerId: 'test-customer-123',
    sessionId: 'test-session-456',
    channel: 'Meta Ads',
    campaign: 'Holiday Campaign 2024',
    source: 'facebook',
    medium: 'cpc',
    content: 'holiday_ad_1',
    term: 'christmas_gifts',
    platform: 'Facebook',
    deviceType: 'mobile',
    pageUrl: 'https://paintlykits.com/products/christmas-bundle',
    referrer: 'https://facebook.com',
    utmParams: {
      utm_source: 'facebook',
      utm_medium: 'cpc',
      utm_campaign: 'holiday_campaign_2024',
      utm_content: 'holiday_ad_1',
      utm_term: 'christmas_gifts'
    },
    conversionValue: 0,
    conversionType: null
  };

  await apiTest(
    'Track Customer Touchpoint', 
    'POST', 
    '/api/analytics/attribution/touchpoint',
    touchpointData
  );

  // Test 3: Track Conversion Touchpoint
  const conversionTouchpoint = {
    ...touchpointData,
    sessionId: 'test-session-789',
    conversionValue: 149.99,
    conversionType: 'purchase',
    orderId: 'test-order-001',
    productIds: ['prod_1', 'prod_2']
  };

  await apiTest(
    'Track Conversion Touchpoint', 
    'POST', 
    '/api/analytics/attribution/touchpoint',
    conversionTouchpoint
  );

  // Test 4: Get Attribution Analytics
  const result = await apiTest(
    'Get Attribution Analytics', 
    'GET', 
    '/api/analytics/attribution',
    {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      modelType: 'ai_enhanced'
    }
  );

  // Test 5: Get Journey Analytics  
  await apiTest(
    'Get Customer Journey Analytics', 
    'GET', 
    '/api/analytics/journey',
    {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    }
  );

  // Test 6: Test Different Attribution Models
  const models = ['linear', 'time_decay', 'position', 'ai_enhanced'];
  for (const model of models) {
    await apiTest(
      `Get Attribution Analytics (${model} model)`, 
      'GET', 
      '/api/analytics/attribution',
      {
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        modelType: model
      }
    );
  }

  // Summary
  const endTime = Date.now();
  const totalTests = passed + failed;
  const successRate = (passed / totalTests * 100).toFixed(1);
  
  console.log('\n📊 ATTRIBUTION API TEST RESULTS');
  console.log('='.repeat(40));
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Success Rate: ${successRate}%`);
  console.log(`Test Duration: ${endTime - startTime}ms`);

  if (successRate >= 90) {
    console.log('\n🎉 ATTRIBUTION API IS PRODUCTION READY!');
  } else if (successRate >= 75) {
    console.log('\n⚠️  ATTRIBUTION API NEEDS MINOR FIXES');
  } else {
    console.log('\n🚨 ATTRIBUTION API NEEDS MAJOR FIXES');
  }

  if (result.success && result.data) {
    console.log('\n🔍 SAMPLE ATTRIBUTION DATA');
    console.log('='.repeat(30));
    if (result.data.analytics && Array.isArray(result.data.analytics)) {
      console.log(`Channels found: ${result.data.analytics.length}`);
      result.data.analytics.slice(0, 3).forEach(channel => {
        console.log(`- ${channel.channel}: $${channel.revenue?.toFixed(2) || '0.00'}`);
      });
    }
    if (result.data.summary) {
      console.log(`Total Revenue: $${result.data.summary.totalRevenue?.toFixed(2) || '0.00'}`);
      console.log(`Total Orders: ${result.data.summary.totalOrders || 0}`);
    }
  }

  process.exit(failed > 0 ? 1 : 0);
}

// Run the tests
testAttributionAPI().catch(console.error);