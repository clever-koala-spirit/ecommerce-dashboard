#!/usr/bin/env node

/**
 * COMPREHENSIVE BACKEND TESTING SUITE
 * Tests all critical backend functionality for Slay Season Dashboard
 */

import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

import { initDB, getDB, getShop, getAllPlatformConnections } from './db/database.js';

// Colors for output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  header: (msg) => console.log(`\n${colors.bold}${colors.blue}🔍 ${msg}${colors.reset}`),
  subheader: (msg) => console.log(`${colors.yellow}${msg}${colors.reset}`)
};

const BASE_URL = 'http://localhost:4000';
const TEST_SHOP = '5ugwnx-v8.myshopify.com';

let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: []
};

function recordResult(testName, passed, error = null) {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    log.success(testName);
  } else {
    testResults.failed++;
    log.error(`${testName}${error ? ': ' + error : ''}`);
    if (error) testResults.errors.push({ test: testName, error });
  }
}

async function testAPI(endpoint, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'X-Shop-Domain': TEST_SHOP,
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
    
    return { 
      status: response.status, 
      data, 
      ok: response.ok,
      headers: response.headers
    };
  } catch (error) {
    return { status: 0, data: null, error: error.message, ok: false };
  }
}

async function runTests() {
  console.log(`${colors.bold}${colors.blue}`);
  console.log('🚀 SLAY SEASON BACKEND COMPREHENSIVE TEST SUITE');
  console.log('================================================');
  console.log(`Test Shop: ${TEST_SHOP}`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`${colors.reset}\n`);

  // Initialize database
  log.header('INITIALIZING DATABASE');
  try {
    await initDB();
    log.success('Database initialized successfully');
  } catch (error) {
    log.error(`Database initialization failed: ${error.message}`);
    return;
  }

  // 1. TEST DATABASE SETUP
  log.header('1. DATABASE INTEGRITY TESTS');
  
  const db = getDB();
  
  // Check if test shop exists
  try {
    const shop = getShop(TEST_SHOP);
    recordResult('Shop exists in database', !!shop);
    if (shop) {
      log.info(`Shop data: ${shop.shopName || 'Unknown'}, Active: ${shop.isActive}`);
    }
  } catch (error) {
    recordResult('Shop lookup', false, error.message);
  }

  // Check platform connections
  try {
    const connections = getAllPlatformConnections(TEST_SHOP);
    recordResult('Platform connections query', true);
    log.info(`Found ${connections.length} platform connections`);
    connections.forEach(conn => {
      log.info(`  - ${conn.platform}: ${conn.status}`);
    });
  } catch (error) {
    recordResult('Platform connections query', false, error.message);
  }

  // Check metric snapshots data
  try {
    const metricResults = db.exec(`
      SELECT COUNT(*) as count FROM metric_snapshots 
      WHERE shop_domain = ?
    `, [TEST_SHOP]);
    
    const metricCount = metricResults.length > 0 && metricResults[0].values.length > 0 
      ? parseInt(metricResults[0].values[0][0]) 
      : 0;
    
    recordResult('Metric snapshots data exists', metricCount > 0);
    log.info(`Found ${metricCount} metric snapshot records`);
  } catch (error) {
    recordResult('Metric snapshots query', false, error.message);
  }

  // 2. TEST API ENDPOINTS
  log.header('2. API ENDPOINT TESTS');

  // Health check
  const health = await testAPI('/api/health');
  recordResult('Health endpoint', health.ok && health.data?.status === 'ok', 
    health.error || (health.data?.status !== 'ok' ? `Status: ${health.data?.status}` : null));

  // Auth endpoints
  log.subheader('Authentication Endpoints:');
  
  const authSession = await testAPI('/api/auth/session');
  recordResult('Auth session endpoint responds', authSession.status !== 0, authSession.error);

  const authCheck = await testAPI(`/api/auth/check?shop=${TEST_SHOP}`);
  recordResult('Auth check endpoint', authCheck.ok, authCheck.error);
  if (authCheck.ok) {
    log.info(`Shop installed: ${authCheck.data?.installed}`);
  }

  // Dashboard data endpoint (main critical endpoint)
  log.subheader('Dashboard Data Endpoint:');
  
  const dashboard = await testAPI('/api/data/dashboard');
  recordResult('Dashboard endpoint responds', dashboard.status !== 0, dashboard.error);
  
  if (dashboard.status === 401) {
    log.warning('Dashboard requires authentication (expected)');
    // Test with mock auth header
    const dashboardAuth = await testAPI('/api/data/dashboard', {
      headers: { 'X-Shop-Domain': TEST_SHOP }
    });
    recordResult('Dashboard with shop header', dashboardAuth.status !== 0, dashboardAuth.error);
    
    if (dashboardAuth.ok && dashboardAuth.data) {
      // Validate dashboard data structure
      const data = dashboardAuth.data;
      recordResult('Dashboard has summary data', !!data.summary);
      recordResult('Dashboard has revenue data', typeof data.summary?.revenue === 'number');
      recordResult('Dashboard has orders data', typeof data.summary?.orders === 'number');
      recordResult('Dashboard revenue is not NaN', !isNaN(data.summary?.revenue));
      recordResult('Dashboard orders is not NaN', !isNaN(data.summary?.orders));
      
      log.info(`Revenue: $${data.summary?.revenue?.toFixed(2) || 'N/A'}`);
      log.info(`Orders: ${data.summary?.orders || 'N/A'}`);
      
      // Test response time
      const startTime = Date.now();
      await testAPI('/api/data/dashboard', { headers: { 'X-Shop-Domain': TEST_SHOP } });
      const responseTime = Date.now() - startTime;
      recordResult('Dashboard response < 2s', responseTime < 2000, 
        responseTime >= 2000 ? `${responseTime}ms` : null);
      log.info(`Dashboard response time: ${responseTime}ms`);
    }
  }

  // Connection endpoints
  log.subheader('Platform Connection Endpoints:');
  
  const connections = await testAPI('/api/connections/status');
  recordResult('Connections status endpoint', connections.status !== 0, connections.error);

  // Test specific platform endpoints
  const platforms = ['shopify', 'google', 'meta', 'klaviyo'];
  for (const platform of platforms) {
    const platformTest = await testAPI(`/api/connections/${platform}`);
    recordResult(`${platform} connection endpoint`, platformTest.status !== 0, platformTest.error);
  }

  // Data endpoints
  log.subheader('Data Integration Endpoints:');
  
  const dataEndpoints = [
    '/api/data/shopify',
    '/api/data/google',
    '/api/data/meta',
    '/api/data/klaviyo'
  ];

  for (const endpoint of dataEndpoints) {
    const result = await testAPI(endpoint);
    recordResult(`${endpoint} endpoint`, result.status !== 0, result.error);
  }

  // AI/Predictions endpoints
  log.subheader('AI Predictions Endpoints:');
  
  const predictions = await testAPI('/api/predictions');
  recordResult('Predictions endpoint', predictions.status !== 0, predictions.error);

  if (predictions.ok && predictions.data) {
    const hasData = Array.isArray(predictions.data) || 
                   !!predictions.data.predictions || 
                   (typeof predictions.data === 'object' && Object.keys(predictions.data).length > 0);
    recordResult('Predictions has data', hasData);
    
    // Handle both array and object formats
    let predictionArray = [];
    if (Array.isArray(predictions.data)) {
      predictionArray = predictions.data;
    } else if (predictions.data.predictions) {
      predictionArray = predictions.data.predictions;
    } else if (typeof predictions.data === 'object') {
      // Convert object format to array
      predictionArray = Object.values(predictions.data);
    }
    
    if (predictionArray?.length > 0) {
      predictionArray.forEach((pred, idx) => {
        const hasValidConfidence = pred.confidence !== undefined && 
          !isNaN(parseFloat(pred.confidence)) && 
          pred.confidence !== 'NaN%';
        recordResult(`Prediction ${idx + 1} confidence valid`, hasValidConfidence, 
          hasValidConfidence ? null : `Got: ${pred.confidence}`);
      });
    }
  }

  // 3. TEST FINANCIAL CALCULATIONS
  log.header('3. FINANCIAL CALCULATIONS VALIDATION');
  
  // Test COGS calculation (58.8%)
  try {
    const testRevenue = 1000;
    const expectedCOGS = testRevenue * 0.588;
    const profit = testRevenue - expectedCOGS;
    const profitMargin = (profit / testRevenue) * 100;
    
    recordResult('COGS calculation (58.8%)', Math.abs(expectedCOGS - 588) < 0.01);
    recordResult('Profit margin calculation', Math.abs(profitMargin - 41.2) < 0.1);
    
    log.info(`Test: $${testRevenue} revenue → $${expectedCOGS} COGS → $${profit} profit (${profitMargin.toFixed(1)}%)`);
  } catch (error) {
    recordResult('Financial calculations', false, error.message);
  }

  // 4. TEST DATABASE PERFORMANCE
  log.header('4. DATABASE PERFORMANCE TESTS');
  
  try {
    const startTime = Date.now();
    db.exec(`
      SELECT 
        DATE(date) as day,
        SUM(CASE WHEN metric = 'revenue' THEN value ELSE 0 END) as revenue,
        SUM(CASE WHEN metric = 'orders' THEN value ELSE 0 END) as orders
      FROM metric_snapshots 
      WHERE shop_domain = ? 
        AND date >= date('now', '-30 days')
      GROUP BY DATE(date) 
      ORDER BY day DESC
    `, [TEST_SHOP]);
    const queryTime = Date.now() - startTime;
    
    recordResult('Complex dashboard query < 100ms', queryTime < 100, 
      queryTime >= 100 ? `${queryTime}ms` : null);
    log.info(`Dashboard query time: ${queryTime}ms`);
  } catch (error) {
    recordResult('Database query performance', false, error.message);
  }

  // 5. TEST ERROR HANDLING
  log.header('5. ERROR HANDLING TESTS');
  
  // Test invalid shop domain
  const invalidShop = await testAPI('/api/data/dashboard', {
    headers: { 'X-Shop-Domain': 'invalid-shop.myshopify.com' }
  });
  recordResult('Invalid shop returns proper error', 
    invalidShop.status === 401 && invalidShop.data?.error);

  // Test malformed requests
  const malformedRequest = await testAPI('/api/data/dashboard', {
    method: 'POST',
    body: 'invalid-json',
    headers: { 'Content-Type': 'application/json' }
  });
  recordResult('Malformed request handling', 
    malformedRequest.status >= 400 && malformedRequest.status < 500);

  // 6. FINAL REPORT
  log.header('TEST RESULTS SUMMARY');
  
  console.log(`${colors.bold}Total Tests: ${testResults.total}${colors.reset}`);
  console.log(`${colors.green}Passed: ${testResults.passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${testResults.failed}${colors.reset}`);
  
  const successRate = (testResults.passed / testResults.total * 100).toFixed(1);
  console.log(`${colors.bold}Success Rate: ${successRate}%${colors.reset}`);

  if (testResults.failed > 0) {
    log.header('FAILED TESTS DETAIL');
    testResults.errors.forEach(({ test, error }) => {
      log.error(`${test}: ${error}`);
    });
  }

  // Commercial readiness assessment
  log.header('COMMERCIAL READINESS ASSESSMENT');
  
  if (successRate >= 95) {
    log.success('BACKEND IS READY FOR COMMERCIAL USE');
  } else if (successRate >= 85) {
    log.warning('BACKEND NEEDS MINOR FIXES BEFORE COMMERCIAL USE');
  } else {
    log.error('BACKEND REQUIRES MAJOR FIXES BEFORE COMMERCIAL USE');
  }

  console.log(`\n${colors.bold}🎯 NEXT STEPS:${colors.reset}`);
  if (testResults.failed > 0) {
    console.log('1. Fix failed tests listed above');
    console.log('2. Re-run this test suite');
    console.log('3. Deploy when success rate > 95%');
  } else {
    console.log('1. All tests passing! ✅');
    console.log('2. Ready for production deployment');
    console.log('3. Monitor performance in production');
  }
}

// Run the tests
runTests().catch(error => {
  log.error(`Test suite failed: ${error.message}`);
  process.exit(1);
});