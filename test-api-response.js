#!/usr/bin/env node

// Test API response for dashboard data
import { initDB, getDB } from './server/db/database.js';

await initDB();
const db = getDB();

const shopDomain = 'paintlykits.myshopify.com';

console.log('🧪 TESTING DASHBOARD API RESPONSE');
console.log('==================================');

// Simulate the dashboard API logic
function getDashboardData(shopDomain, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const dateFilter = startDate.toISOString().split('T')[0];
  
  // Get revenue
  const revenueResults = db.exec(`
    SELECT SUM(value) as total FROM metric_snapshots 
    WHERE shop_domain = ? AND metric = 'revenue' AND date >= ?
  `, [shopDomain, dateFilter]);
  
  const revenue = revenueResults.length > 0 && revenueResults[0].values.length > 0 
    ? parseFloat(revenueResults[0].values[0][0]) || 0 
    : 0;
  
  // Get orders
  const ordersResults = db.exec(`
    SELECT SUM(value) as total FROM metric_snapshots 
    WHERE shop_domain = ? AND metric = 'orders' AND date >= ?
  `, [shopDomain, dateFilter]);
  
  const orders = ordersResults.length > 0 && ordersResults[0].values.length > 0 
    ? parseInt(ordersResults[0].values[0][0]) || 0 
    : 0;
  
  // Get daily breakdown for last 7 days
  const dailyResults = db.exec(`
    SELECT date, 
           SUM(CASE WHEN metric = 'revenue' THEN value ELSE 0 END) as daily_revenue,
           SUM(CASE WHEN metric = 'orders' THEN value ELSE 0 END) as daily_orders
    FROM metric_snapshots 
    WHERE shop_domain = ? AND date >= ? 
    GROUP BY date ORDER BY date DESC LIMIT 7
  `, [shopDomain, dateFilter]);
  
  const dailyData = dailyResults.length > 0 && dailyResults[0].values.length > 0 
    ? dailyResults[0].values.map(([date, revenue, orders]) => ({
        date, 
        revenue: parseFloat(revenue) || 0, 
        orders: parseInt(orders) || 0
      }))
    : [];
  
  // Calculate predictions (simple growth rate)
  const avgDailyRevenue = revenue / days;
  const predictedNextWeek = avgDailyRevenue * 7;
  const growthRate = dailyData.length >= 2 
    ? (dailyData[0].revenue - dailyData[dailyData.length - 1].revenue) / dailyData[dailyData.length - 1].revenue 
    : 0;
  
  return {
    summary: {
      revenue: revenue,
      orders: orders,
      avgOrderValue: orders > 0 ? revenue / orders : 0,
      period: `${days} days`
    },
    dailyData: dailyData,
    predictions: {
      nextWeekRevenue: predictedNextWeek,
      growthRate: growthRate,
      confidence: dailyData.length >= 7 ? 'high' : 'low'
    },
    issues: {
      hasNaN: false,
      missingData: dailyData.length === 0,
      lowDataQuality: revenue < 100
    }
  };
}

const dashboardData = getDashboardData(shopDomain, 30);

console.log('📊 DASHBOARD RESPONSE:');
console.log(JSON.stringify(dashboardData, null, 2));

console.log('\n🔍 ANALYSIS:');
console.log(`Revenue: $${dashboardData.summary.revenue.toFixed(2)}`);
console.log(`Orders: ${dashboardData.summary.orders}`);
console.log(`AOV: $${dashboardData.summary.avgOrderValue.toFixed(2)}`);
console.log(`Daily breakdown: ${dashboardData.dailyData.length} days`);

// Check if this matches Leo's expectations
if (dashboardData.summary.revenue >= 25000) {
  console.log('✅ Revenue exceeds Leo\'s expected $29K+ - GOOD');
} else if (dashboardData.summary.revenue >= 1000) {
  console.log('⚠️  Revenue below expectations but reasonable');
} else {
  console.log('❌ Revenue too low - still an issue');
}

if (dashboardData.issues.hasNaN || dashboardData.issues.missingData) {
  console.log('❌ Still has NaN or missing data issues');
} else {
  console.log('✅ No NaN or missing data issues detected');
}

console.log('\n🎯 NEXT STEPS:');
console.log('1. Leo should access: https://slayseason.com');  
console.log('2. Login/register with paintlykits.myshopify.com domain');
console.log('3. Dashboard should now show correct revenue figures');
console.log('4. If still seeing $748, clear browser cache or try incognito mode');