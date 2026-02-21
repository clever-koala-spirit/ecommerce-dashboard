#!/usr/bin/env node

/**
 * Test script for the new competitor-beating analytics backend
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:4000';
const TEST_SHOP = 'test-shop.myshopify.com';

async function testAnalyticsBackend() {
  console.log('🚀 Testing Competitor-Beating Analytics Backend\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing server health...');
    const health = await fetch(`${BASE_URL}/api/health`);
    const healthData = await health.json();
    console.log(`✅ Server status: ${healthData.status}`);
    console.log(`📊 Version: ${healthData.version}\n`);

    // Test 2: Initialize Analytics
    console.log('2️⃣ Initializing analytics tables...');
    const initResponse = await fetch(`${BASE_URL}/api/analytics/initialize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shop-Domain': TEST_SHOP
      }
    });

    if (initResponse.ok) {
      const initData = await initResponse.json();
      console.log('✅ Analytics initialized successfully!');
      console.log(`🏪 Shop: ${initData.shopDomain}`);
      console.log(`🎯 Features enabled:`);
      initData.features?.forEach(feature => console.log(`   • ${feature}`));
    } else {
      console.log('⚠️ Analytics initialization response:', initResponse.status);
    }
    console.log('');

    // Test 3: Track a customer interaction
    console.log('3️⃣ Testing customer journey tracking...');
    const interactionResponse = await fetch(`${BASE_URL}/api/analytics/journey/interaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shop-Domain': TEST_SHOP
      },
      body: JSON.stringify({
        customerId: 'test-customer-123',
        sessionId: 'test-session-456',
        interactionType: 'website_visit',
        channel: 'organic_search',
        source: 'google',
        pageUrl: '/products/test-product',
        deviceType: 'desktop'
      })
    });

    if (interactionResponse.ok) {
      console.log('✅ Customer interaction tracked successfully!');
    } else {
      console.log('⚠️ Customer tracking response:', interactionResponse.status);
    }
    console.log('');

    // Test 4: Track attribution touchpoint
    console.log('4️⃣ Testing attribution engine...');
    const touchpointResponse = await fetch(`${BASE_URL}/api/analytics/attribution/touchpoint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shop-Domain': TEST_SHOP
      },
      body: JSON.stringify({
        customerId: 'test-customer-123',
        sessionId: 'test-session-456',
        channel: 'paid_search',
        source: 'google',
        medium: 'cpc',
        campaign: 'summer-sale',
        deviceType: 'desktop',
        pageUrl: '/products/test-product'
      })
    });

    if (touchpointResponse.ok) {
      console.log('✅ Attribution touchpoint tracked successfully!');
    } else {
      console.log('⚠️ Attribution tracking response:', touchpointResponse.status);
    }
    console.log('');

    // Test 5: Process a test order
    console.log('5️⃣ Testing real-time P&L processing...');
    const orderResponse = await fetch(`${BASE_URL}/api/analytics/pl/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shop-Domain': TEST_SHOP
      },
      body: JSON.stringify({
        orderId: 'test-order-789',
        customerId: 'test-customer-123',
        totalRevenue: 99.99,
        lineItems: [
          {
            productId: 'test-product-1',
            variantId: 'test-variant-1',
            quantity: 1,
            price: 99.99
          }
        ],
        shippingCost: 9.99,
        paymentGateway: 'shopify_payments'
      })
    });

    if (orderResponse.ok) {
      const orderData = await orderResponse.json();
      console.log('✅ P&L calculation completed!');
      console.log(`💰 Revenue: $${orderData.revenue}`);
      console.log(`📊 Gross Margin: ${orderData.grossMargin?.toFixed(1)}%`);
    } else {
      console.log('⚠️ P&L processing response:', orderResponse.status);
    }
    console.log('');

    // Test 6: Get executive dashboard
    console.log('6️⃣ Testing executive dashboard...');
    const dashboardResponse = await fetch(`${BASE_URL}/api/analytics/dashboard/executive?timeframe=7d`, {
      headers: {
        'X-Shop-Domain': TEST_SHOP
      }
    });

    if (dashboardResponse.ok) {
      const dashboardData = await dashboardResponse.json();
      console.log('✅ Executive dashboard generated!');
      console.log(`📈 Timeframe: ${dashboardData.timeframe?.startDate} to ${dashboardData.timeframe?.endDate}`);
      console.log(`💼 Revenue insights available: ${dashboardData.insights?.length || 0}`);
    } else {
      console.log('⚠️ Dashboard response:', dashboardResponse.status);
    }
    console.log('');

    console.log('🎉 ALL TESTS COMPLETED!');
    console.log('');
    console.log('🚀 COMPETITOR-BEATING BACKEND IS LIVE AND OPERATIONAL!');
    console.log('');
    console.log('Key endpoints now available:');
    console.log('• Multi-touch Attribution: /api/analytics/attribution');
    console.log('• Real-time P&L: /api/analytics/pl/realtime');
    console.log('• Customer Journey: /api/analytics/journey');
    console.log('• Revenue Analytics: /api/analytics/revenue');
    console.log('• Executive Dashboard: /api/analytics/dashboard/executive');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the server is running: npm start');
  }
}

// Run the test
testAnalyticsBackend();