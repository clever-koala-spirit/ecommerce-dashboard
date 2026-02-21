#!/usr/bin/env node
/**
 * Test Predictions API - Verify confidence values are consistent
 */

const testCreativeFatigue = async () => {
  console.log('🎯 Testing Creative Fatigue API...');
  
  const testData = {
    campaignId: 'test-campaign-1',
    creativeAssets: [
      {
        id: 'creative-1',
        type: 'image',
        performance: {
          ctr: 0.034,
          cpm: 18.50,
          spend: 1000,
          impressions: 54000
        }
      }
    ],
    performanceData: {
      frequency: 2.8,
      days_running: 30,
      conversion_rate: 0.034
    }
  };

  try {
    const response = await fetch('http://localhost:4000/api/predictions/creative-fatigue', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    if (!response.ok) {
      console.log('❌ API Response:', response.status, response.statusText);
      const errorData = await response.text();
      console.log('❌ Error:', errorData);
      return null;
    }

    const data = await response.json();
    console.log('✅ Creative Fatigue Response:');
    console.log('   - Success:', data.success);
    console.log('   - Confidence:', data.analysis?.confidence || 'Not found');
    console.log('   - Fatigue Score:', data.analysis?.fatigue_score || 'Not found');
    
    return data;
  } catch (error) {
    console.log('❌ Request failed:', error.message);
    return null;
  }
};

const testBudgetOptimization = async () => {
  console.log('\n💰 Testing Budget Optimization API...');
  
  const testData = {
    budget: {
      current: 10000,
      daily: 500
    },
    metrics: {
      roas: 3.67,
      cpa: 15.50,
      revenue: 29000,
      orders: 15
    },
    timeframe: 'weekly'
  };

  try {
    const response = await fetch('http://localhost:4000/api/predictions/budget-optimize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    if (!response.ok) {
      console.log('❌ API Response:', response.status, response.statusText);
      const errorData = await response.text();
      console.log('❌ Error:', errorData);
      return null;
    }

    const data = await response.json();
    console.log('✅ Budget Optimization Response:');
    console.log('   - Success:', data.success);
    console.log('   - Confidence:', data.confidence || 'Not found');
    console.log('   - Predicted ROAS:', data.prediction?.predicted_roas || 'Not found');
    
    return data;
  } catch (error) {
    console.log('❌ Request failed:', error.message);
    return null;
  }
};

const testHealthCheck = async () => {
  console.log('\n🏥 Testing Health Check API...');
  
  try {
    const response = await fetch('http://localhost:4000/api/predictions/health');
    
    if (!response.ok) {
      console.log('❌ Health check failed:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    console.log('✅ Health Check Response:');
    console.log('   - Success:', data.success);
    console.log('   - Models available:', Object.keys(data.models || {}).length);
    console.log('   - JARVIS status:', data.jarvis ? 'OK' : 'Not available');
    
    return data;
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    return null;
  }
};

// Run tests
(async () => {
  console.log('🔧 Testing Predictions API - Confidence Value Consistency\n');
  
  await testHealthCheck();
  await testCreativeFatigue();
  await testBudgetOptimization();
  
  console.log('\n📊 Analysis Complete!');
  console.log('Check responses above to verify confidence value formats');
})();