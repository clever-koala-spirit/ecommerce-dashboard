#!/usr/bin/env node

// Simple console colors
const colors = {
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  gray: (text) => `\x1b[90m${text}\x1b[0m`,
  white: (text) => `\x1b[37m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`
};

const chalk = {
  blue: { bold: (text) => colors.blue(colors.bold(text)) },
  green: colors.green,
  red: colors.red,
  yellow: { bold: (text) => colors.yellow(colors.bold(text)) },
  gray: colors.gray,
  white: colors.white
};

const BASE_URL = 'http://localhost:4000';
const SHOP_DOMAIN = 'paintlykits.myshopify.com';

async function testAttributionAPI() {
  console.log(chalk.blue.bold('\n🎯 ATTRIBUTION API TESTS\n'));
  console.log(chalk.blue('=' + '='.repeat(50)));
  
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
        console.log(chalk.green(`✅ ${name}`));
        console.log(chalk.gray(`   Status: ${response.status}`));
        if (parsedData && typeof parsedData === 'object') {
          console.log(chalk.gray(`   Response keys: ${Object.keys(parsedData).join(', ')}`));
        }
        passed++;
        return { success: true, data: parsedData };
      } else {
        console.log(chalk.red(`❌ ${name}`));
        console.log(chalk.gray(`   Status: ${response.status}`));
        console.log(chalk.gray(`   Response: ${responseData.substring(0, 200)}...`));
        failed++;
        return { success: false, data: parsedData };
      }
    } catch (error) {
      console.log(chalk.red(`❌ ${name} - ${error.message}`));
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

  // Test 7: Track Multiple Touchpoints for Journey
  const journeyTouchpoints = [
    { ...touchpointData, sessionId: 'journey-001', channel: 'Google Ads', timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000 },
    { ...touchpointData, sessionId: 'journey-001', channel: 'Email', timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000 },
    { ...touchpointData, sessionId: 'journey-001', channel: 'Direct', timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000, conversionValue: 199.99, conversionType: 'purchase', orderId: 'journey-order-001' }
  ];

  for (let i = 0; i < journeyTouchpoints.length; i++) {
    await apiTest(
      `Track Journey Touchpoint ${i + 1}`, 
      'POST', 
      '/api/analytics/attribution/touchpoint',
      journeyTouchpoints[i]
    );
  }

  // Test 8: Executive Dashboard (includes attribution data)
  await apiTest(
    'Executive Dashboard with Attribution', 
    'GET', 
    '/api/analytics/dashboard/executive',
    { timeframe: '30d' }
  );

  // Summary
  const endTime = Date.now();
  const totalTests = passed + failed;
  const successRate = (passed / totalTests * 100).toFixed(1);
  
  console.log(chalk.blue.bold('\n📊 ATTRIBUTION API TEST RESULTS'));
  console.log(chalk.blue('=' + '='.repeat(40)));
  console.log(chalk.white(`Total Tests: ${totalTests}`));
  console.log(chalk.green(`Passed: ${passed}`));
  console.log(chalk.red(`Failed: ${failed}`));
  console.log(chalk.yellow(`Success Rate: ${successRate}%`));
  console.log(chalk.gray(`Test Duration: ${endTime - startTime}ms`));

  if (successRate >= 90) {
    console.log(chalk.green.bold('\n🎉 ATTRIBUTION API IS PRODUCTION READY!'));
  } else if (successRate >= 75) {
    console.log(chalk.yellow.bold('\n⚠️  ATTRIBUTION API NEEDS MINOR FIXES'));
  } else {
    console.log(chalk.red.bold('\n🚨 ATTRIBUTION API NEEDS MAJOR FIXES'));
  }

  if (result.success && result.data) {
    console.log(chalk.blue.bold('\n🔍 SAMPLE ATTRIBUTION DATA'));
    console.log(chalk.blue('=' + '='.repeat(30)));
    if (result.data.analytics && Array.isArray(result.data.analytics)) {
      console.log(chalk.white(`Channels found: ${result.data.analytics.length}`));
      result.data.analytics.slice(0, 3).forEach(channel => {
        console.log(chalk.gray(`- ${channel.channel}: $${channel.revenue?.toFixed(2) || '0.00'}`));
      });
    }
    if (result.data.summary) {
      console.log(chalk.white(`Total Revenue: $${result.data.summary.totalRevenue?.toFixed(2) || '0.00'}`));
      console.log(chalk.white(`Total Orders: ${result.data.summary.totalOrders || 0}`));
    }
  }

  process.exit(failed > 0 ? 1 : 0);
}

// Run the tests
testAttributionAPI().catch(console.error);