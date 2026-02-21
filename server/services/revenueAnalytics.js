/**
 * Advanced Revenue Analytics Engine
 * Competitor-beating revenue insights with predictive modeling
 */

import { getDB } from '../db/database.js';
import { log } from '../utils/logger.js';

class RevenueAnalytics {
  constructor() {
    this.revenueMetrics = {
      TOTAL_REVENUE: 'total_revenue',
      NET_REVENUE: 'net_revenue',
      RECURRING_REVENUE: 'recurring_revenue',
      NEW_CUSTOMER_REVENUE: 'new_customer_revenue',
      RETURNING_CUSTOMER_REVENUE: 'returning_customer_revenue',
      PRODUCT_REVENUE: 'product_revenue',
      CHANNEL_REVENUE: 'channel_revenue',
      COHORT_REVENUE: 'cohort_revenue'
    };

    this.forecastModels = {
      LINEAR_TREND: 'linear_trend',
      EXPONENTIAL_SMOOTHING: 'exponential_smoothing',
      SEASONAL_ARIMA: 'seasonal_arima',
      MACHINE_LEARNING: 'machine_learning'
    };

    this.cohortTypes = {
      MONTHLY: 'monthly',
      WEEKLY: 'weekly',
      ACQUISITION_CHANNEL: 'acquisition_channel',
      CUSTOMER_SEGMENT: 'customer_segment'
    };
  }

  /**
   * Initialize revenue analytics tables
   */
  initializeTables() {
    const db = getDB();
    
    // Revenue streams breakdown
    db.run(`
      CREATE TABLE IF NOT EXISTS revenue_streams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        shop_domain TEXT NOT NULL,
        stream_name TEXT NOT NULL,
        stream_type TEXT NOT NULL,
        date DATE NOT NULL,
        revenue REAL NOT NULL,
        orders INTEGER NOT NULL,
        customers INTEGER NOT NULL,
        avg_order_value REAL NOT NULL,
        growth_rate REAL,
        market_share REAL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX(shop_domain, date),
        INDEX(stream_type),
        UNIQUE(shop_domain, stream_name, date)
      );
    `);

    // Product performance analytics
    db.run(`
      CREATE TABLE IF NOT EXISTS product_revenue_analytics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        shop_domain TEXT NOT NULL,
        product_id TEXT NOT NULL,
        product_title TEXT,
        category TEXT,
        date DATE NOT NULL,
        units_sold INTEGER NOT NULL,
        revenue REAL NOT NULL,
        refunds REAL DEFAULT 0,
        net_revenue REAL NOT NULL,
        avg_selling_price REAL NOT NULL,
        inventory_turns REAL,
        sell_through_rate REAL,
        contribution_margin REAL,
        revenue_rank INTEGER,
        growth_rate_7d REAL,
        growth_rate_30d REAL,
        forecasted_demand INTEGER,
        stock_out_risk REAL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX(shop_domain, date),
        INDEX(revenue_rank),
        UNIQUE(shop_domain, product_id, date)
      );
    `);

    // Customer cohort analysis
    db.run(`
      CREATE TABLE IF NOT EXISTS customer_cohorts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        shop_domain TEXT NOT NULL,
        cohort_period TEXT NOT NULL,
        cohort_type TEXT NOT NULL,
        cohort_identifier TEXT NOT NULL,
        period_number INTEGER NOT NULL,
        customers INTEGER NOT NULL,
        revenue REAL NOT NULL,
        orders INTEGER NOT NULL,
        retention_rate REAL NOT NULL,
        ltv_cumulative REAL NOT NULL,
        ltv_predicted REAL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX(shop_domain, cohort_period),
        INDEX(cohort_type),
        UNIQUE(shop_domain, cohort_period, cohort_type, period_number)
      );
    `);

    // Revenue forecasts
    db.run(`
      CREATE TABLE IF NOT EXISTS revenue_forecasts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        shop_domain TEXT NOT NULL,
        forecast_date DATE NOT NULL,
        forecast_type TEXT NOT NULL,
        model_type TEXT NOT NULL,
        predicted_revenue REAL NOT NULL,
        confidence_interval_low REAL NOT NULL,
        confidence_interval_high REAL NOT NULL,
        actual_revenue REAL,
        accuracy_score REAL,
        model_parameters TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX(shop_domain, forecast_date),
        INDEX(model_type),
        UNIQUE(shop_domain, forecast_date, forecast_type, model_type)
      );
    `);

    // Channel attribution revenue
    db.run(`
      CREATE TABLE IF NOT EXISTS channel_revenue_attribution (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        shop_domain TEXT NOT NULL,
        date DATE NOT NULL,
        channel TEXT NOT NULL,
        attribution_model TEXT NOT NULL,
        attributed_revenue REAL NOT NULL,
        attributed_orders INTEGER NOT NULL,
        first_touch_revenue REAL NOT NULL,
        last_touch_revenue REAL NOT NULL,
        assisted_revenue REAL NOT NULL,
        channel_efficiency REAL,
        incremental_revenue REAL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX(shop_domain, date),
        INDEX(channel),
        UNIQUE(shop_domain, date, channel, attribution_model)
      );
    `);

    // Revenue optimization insights
    db.run(`
      CREATE TABLE IF NOT EXISTS revenue_insights (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        shop_domain TEXT NOT NULL,
        insight_type TEXT NOT NULL,
        insight_category TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        impact_score REAL NOT NULL,
        potential_revenue REAL,
        confidence_level REAL,
        action_items TEXT,
        data_points TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT 1,
        INDEX(shop_domain, impact_score),
        INDEX(insight_type)
      );
    `);

    log.info('Revenue analytics tables initialized');
  }

  /**
   * Calculate comprehensive revenue analytics
   */
  async calculateRevenueAnalytics(shopDomain, options = {}) {
    const {
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate = new Date().toISOString().split('T')[0],
      includeForecasts = true,
      includeCohorts = true
    } = options;

    const analytics = {
      timeframe: { startDate, endDate },
      overview: await this.calculateRevenueOverview(shopDomain, startDate, endDate),
      streams: await this.calculateRevenueStreams(shopDomain, startDate, endDate),
      products: await this.getTopProductPerformance(shopDomain, startDate, endDate),
      channels: await this.getChannelRevenue(shopDomain, startDate, endDate),
      trends: await this.calculateRevenueTrends(shopDomain, startDate, endDate)
    };

    if (includeCohorts) {
      analytics.cohorts = await this.calculateCohortAnalysis(shopDomain, options);
    }

    if (includeForecasts) {
      analytics.forecasts = await this.generateRevenueForecasts(shopDomain);
    }

    // Generate insights
    analytics.insights = await this.generateRevenueInsights(shopDomain, analytics);

    return analytics;
  }

  /**
   * Calculate revenue overview metrics
   */
  async calculateRevenueOverview(shopDomain, startDate, endDate) {
    const db = getDB();
    
    // Current period metrics
    const currentMetrics = db.prepare(`
      SELECT 
        COALESCE(SUM(value), 0) as total_revenue,
        COUNT(DISTINCT date) as active_days,
        COUNT(*) as total_orders
      FROM metric_snapshots
      WHERE shop_domain = ? AND source = 'shopify' AND metric = 'sales'
        AND date BETWEEN ? AND ?
    `).get([shopDomain, startDate, endDate]);

    // Previous period for comparison
    const periodLength = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);
    const prevStartDate = new Date(new Date(startDate).getTime() - periodLength * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const prevEndDate = new Date(new Date(startDate).getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const previousMetrics = db.prepare(`
      SELECT COALESCE(SUM(value), 0) as total_revenue
      FROM metric_snapshots
      WHERE shop_domain = ? AND source = 'shopify' AND metric = 'sales'
        AND date BETWEEN ? AND ?
    `).get([shopDomain, prevStartDate, prevEndDate]);

    // Calculate growth rates
    const revenueGrowth = previousMetrics.total_revenue > 0 
      ? ((currentMetrics.total_revenue - previousMetrics.total_revenue) / previousMetrics.total_revenue) * 100
      : 0;

    // Get customer metrics
    const customerMetrics = db.prepare(`
      SELECT 
        COUNT(DISTINCT customer_id) as unique_customers,
        COUNT(DISTINCT CASE WHEN total_orders = 1 THEN customer_id END) as new_customers,
        COUNT(DISTINCT CASE WHEN total_orders > 1 THEN customer_id END) as returning_customers
      FROM customer_profiles
      WHERE shop_domain = ?
        AND last_seen_at BETWEEN ? AND ?
    `).get([shopDomain, startDate, endDate]);

    const avgOrderValue = currentMetrics.total_orders > 0 
      ? currentMetrics.total_revenue / currentMetrics.total_orders
      : 0;

    const avgRevenuePerCustomer = customerMetrics.unique_customers > 0
      ? currentMetrics.total_revenue / customerMetrics.unique_customers
      : 0;

    return {
      totalRevenue: currentMetrics.total_revenue,
      revenueGrowth,
      totalOrders: currentMetrics.total_orders,
      avgOrderValue,
      uniqueCustomers: customerMetrics.unique_customers,
      newCustomers: customerMetrics.new_customers,
      returningCustomers: customerMetrics.returning_customers,
      avgRevenuePerCustomer,
      activeDays: currentMetrics.active_days,
      dailyAvgRevenue: currentMetrics.active_days > 0 
        ? currentMetrics.total_revenue / currentMetrics.active_days 
        : 0
    };
  }

  /**
   * Calculate revenue streams
   */
  async calculateRevenueStreams(shopDomain, startDate, endDate) {
    const db = getDB();

    // New vs returning customer revenue
    const customerTypeRevenue = db.prepare(`
      SELECT 
        CASE WHEN cp.total_orders = 1 THEN 'new_customer' ELSE 'returning_customer' END as customer_type,
        SUM(ms.value) as revenue,
        COUNT(*) as orders,
        COUNT(DISTINCT cp.customer_id) as customers
      FROM metric_snapshots ms
      JOIN customer_profiles cp ON ms.dimensions LIKE '%' || cp.customer_id || '%'
      WHERE ms.shop_domain = ? AND ms.source = 'shopify' AND ms.metric = 'sales'
        AND ms.date BETWEEN ? AND ?
      GROUP BY customer_type
    `).all([shopDomain, startDate, endDate]);

    // Channel-based revenue (from attribution)
    const channelRevenue = db.prepare(`
      SELECT 
        channel,
        SUM(attributed_revenue) as revenue,
        SUM(attributed_orders) as orders
      FROM channel_revenue_attribution
      WHERE shop_domain = ? AND date BETWEEN ? AND ?
      GROUP BY channel
      ORDER BY revenue DESC
    `).all([shopDomain, startDate, endDate]);

    // Product category revenue (if categories are tracked)
    const categoryRevenue = db.prepare(`
      SELECT 
        category,
        SUM(revenue) as revenue,
        SUM(units_sold) as units,
        COUNT(DISTINCT product_id) as products
      FROM product_revenue_analytics
      WHERE shop_domain = ? AND date BETWEEN ? AND ?
        AND category IS NOT NULL
      GROUP BY category
      ORDER BY revenue DESC
    `).all([shopDomain, startDate, endDate]);

    return {
      customerType: customerTypeRevenue,
      channels: channelRevenue,
      categories: categoryRevenue
    };
  }

  /**
   * Get top product performance
   */
  async getTopProductPerformance(shopDomain, startDate, endDate, limit = 20) {
    const db = getDB();

    const topProducts = db.prepare(`
      SELECT 
        product_id,
        product_title,
        category,
        SUM(revenue) as total_revenue,
        SUM(units_sold) as total_units,
        AVG(avg_selling_price) as avg_price,
        AVG(contribution_margin) as avg_margin,
        AVG(growth_rate_30d) as growth_rate,
        MAX(revenue_rank) as best_rank,
        AVG(sell_through_rate) as sell_through_rate
      FROM product_revenue_analytics
      WHERE shop_domain = ? AND date BETWEEN ? AND ?
      GROUP BY product_id, product_title, category
      ORDER BY total_revenue DESC
      LIMIT ?
    `).all([shopDomain, startDate, endDate, limit]);

    // Calculate market share for each product
    const totalRevenue = topProducts.reduce((sum, p) => sum + p.total_revenue, 0);
    
    return topProducts.map(product => ({
      ...product,
      marketShare: totalRevenue > 0 ? (product.total_revenue / totalRevenue) * 100 : 0,
      revenuePerUnit: product.total_units > 0 ? product.total_revenue / product.total_units : 0
    }));
  }

  /**
   * Get channel revenue attribution
   */
  async getChannelRevenue(shopDomain, startDate, endDate) {
    const db = getDB();

    const channelData = db.prepare(`
      SELECT 
        channel,
        attribution_model,
        SUM(attributed_revenue) as revenue,
        SUM(attributed_orders) as orders,
        AVG(channel_efficiency) as efficiency,
        SUM(incremental_revenue) as incremental_revenue
      FROM channel_revenue_attribution
      WHERE shop_domain = ? AND date BETWEEN ? AND ?
      GROUP BY channel, attribution_model
      ORDER BY revenue DESC
    `).all([shopDomain, startDate, endDate]);

    // Group by channel with different attribution models
    const channelGroups = {};
    channelData.forEach(item => {
      if (!channelGroups[item.channel]) {
        channelGroups[item.channel] = {
          channel: item.channel,
          attributionModels: {}
        };
      }
      channelGroups[item.channel].attributionModels[item.attribution_model] = {
        revenue: item.revenue,
        orders: item.orders,
        efficiency: item.efficiency,
        incrementalRevenue: item.incremental_revenue
      };
    });

    return Object.values(channelGroups);
  }

  /**
   * Calculate revenue trends
   */
  async calculateRevenueTrends(shopDomain, startDate, endDate) {
    const db = getDB();

    // Daily revenue trend
    const dailyTrend = db.prepare(`
      SELECT 
        date,
        SUM(value) as revenue,
        COUNT(*) as orders,
        SUM(value) / COUNT(*) as avg_order_value
      FROM metric_snapshots
      WHERE shop_domain = ? AND source = 'shopify' AND metric = 'sales'
        AND date BETWEEN ? AND ?
      GROUP BY date
      ORDER BY date ASC
    `).all([shopDomain, startDate, endDate]);

    // Calculate moving averages
    const movingAverage7 = this.calculateMovingAverage(dailyTrend.map(d => d.revenue), 7);
    const movingAverage30 = this.calculateMovingAverage(dailyTrend.map(d => d.revenue), 30);

    // Weekly aggregation
    const weeklyTrend = this.aggregateByWeek(dailyTrend);

    // Monthly aggregation
    const monthlyTrend = this.aggregateByMonth(dailyTrend);

    return {
      daily: dailyTrend.map((day, index) => ({
        ...day,
        movingAvg7: movingAverage7[index],
        movingAvg30: movingAverage30[index]
      })),
      weekly: weeklyTrend,
      monthly: monthlyTrend
    };
  }

  /**
   * Calculate cohort analysis
   */
  async calculateCohortAnalysis(shopDomain, options = {}) {
    const db = getDB();
    const { cohortType = this.cohortTypes.MONTHLY } = options;

    // Get customer first purchase dates
    const customerCohorts = db.prepare(`
      SELECT 
        customer_id,
        DATE(first_seen_at) as cohort_date,
        total_spent,
        total_orders
      FROM customer_profiles
      WHERE shop_domain = ?
      ORDER BY cohort_date ASC
    `).all([shopDomain]);

    // Group customers by cohort period
    const cohorts = {};
    customerCohorts.forEach(customer => {
      const cohortKey = this.getCohortKey(customer.cohort_date, cohortType);
      if (!cohorts[cohortKey]) {
        cohorts[cohortKey] = [];
      }
      cohorts[cohortKey].push(customer);
    });

    // Calculate cohort metrics for each period
    const cohortAnalysis = {};
    
    Object.keys(cohorts).forEach(cohortKey => {
      const cohortCustomers = cohorts[cohortKey];
      cohortAnalysis[cohortKey] = {
        cohortPeriod: cohortKey,
        initialCustomers: cohortCustomers.length,
        periods: this.calculateCohortPeriods(shopDomain, cohortCustomers, cohortKey)
      };
    });

    return cohortAnalysis;
  }

  /**
   * Generate revenue forecasts
   */
  async generateRevenueForecasts(shopDomain, daysAhead = 30) {
    const db = getDB();

    // Get historical revenue data
    const historicalData = db.prepare(`
      SELECT 
        date,
        SUM(value) as revenue
      FROM metric_snapshots
      WHERE shop_domain = ? AND source = 'shopify' AND metric = 'sales'
        AND date >= date('now', '-90 days')
      GROUP BY date
      ORDER BY date ASC
    `).all([shopDomain]);

    if (historicalData.length < 7) {
      return { error: 'Insufficient historical data for forecasting' };
    }

    const revenues = historicalData.map(d => d.revenue);
    const forecasts = {};

    // Linear trend forecast
    forecasts.linearTrend = this.generateLinearTrendForecast(revenues, daysAhead);

    // Exponential smoothing forecast
    forecasts.exponentialSmoothing = this.generateExponentialSmoothingForecast(revenues, daysAhead);

    // Simple seasonal forecast (if enough data)
    if (historicalData.length >= 28) {
      forecasts.seasonal = this.generateSeasonalForecast(revenues, daysAhead);
    }

    // Store forecasts in database
    await this.storeRevenueForecasts(shopDomain, forecasts);

    return forecasts;
  }

  /**
   * Generate revenue insights
   */
  async generateRevenueInsights(shopDomain, analytics) {
    const insights = [];

    // Revenue growth insights
    if (analytics.overview.revenueGrowth > 20) {
      insights.push({
        type: 'positive_trend',
        category: 'growth',
        title: 'Strong Revenue Growth',
        description: `Revenue has grown by ${analytics.overview.revenueGrowth.toFixed(1)}% compared to the previous period`,
        impactScore: 85,
        potentialRevenue: analytics.overview.totalRevenue * 0.1,
        confidenceLevel: 0.9
      });
    } else if (analytics.overview.revenueGrowth < -10) {
      insights.push({
        type: 'negative_trend',
        category: 'growth',
        title: 'Revenue Decline Alert',
        description: `Revenue has declined by ${Math.abs(analytics.overview.revenueGrowth).toFixed(1)}%`,
        impactScore: 95,
        potentialRevenue: analytics.overview.totalRevenue * 0.15,
        confidenceLevel: 0.95,
        actionItems: ['Review marketing campaigns', 'Analyze customer feedback', 'Check competitor activity']
      });
    }

    // AOV insights
    const industryAvgAOV = 75; // This would come from industry benchmarks
    if (analytics.overview.avgOrderValue < industryAvgAOV * 0.8) {
      insights.push({
        type: 'optimization',
        category: 'aov',
        title: 'Low Average Order Value',
        description: `Your AOV of $${analytics.overview.avgOrderValue.toFixed(2)} is below industry average`,
        impactScore: 75,
        potentialRevenue: analytics.overview.totalOrders * (industryAvgAOV - analytics.overview.avgOrderValue),
        confidenceLevel: 0.8,
        actionItems: ['Implement upselling', 'Create product bundles', 'Offer free shipping thresholds']
      });
    }

    // Product performance insights
    if (analytics.products && analytics.products.length > 0) {
      const topProduct = analytics.products[0];
      if (topProduct.marketShare > 50) {
        insights.push({
          type: 'concentration_risk',
          category: 'diversification',
          title: 'Revenue Concentration Risk',
          description: `${topProduct.product_title} accounts for ${topProduct.marketShare.toFixed(1)}% of revenue`,
          impactScore: 70,
          confidenceLevel: 0.85,
          actionItems: ['Diversify product portfolio', 'Promote other products', 'Reduce dependency on single product']
        });
      }
    }

    // Channel insights
    if (analytics.channels && analytics.channels.length > 0) {
      const topChannel = analytics.channels[0];
      const channelRevenue = topChannel.attributionModels?.ai_enhanced?.revenue || 0;
      const totalChannelRevenue = analytics.channels.reduce((sum, ch) => 
        sum + (ch.attributionModels?.ai_enhanced?.revenue || 0), 0
      );
      
      if (totalChannelRevenue > 0 && channelRevenue / totalChannelRevenue > 0.6) {
        insights.push({
          type: 'channel_dependency',
          category: 'marketing',
          title: 'High Channel Dependency',
          description: `${topChannel.channel} drives ${((channelRevenue / totalChannelRevenue) * 100).toFixed(1)}% of attributed revenue`,
          impactScore: 65,
          confidenceLevel: 0.8,
          actionItems: ['Diversify marketing channels', 'Test new acquisition channels', 'Reduce single channel risk']
        });
      }
    }

    // Store insights in database
    await this.storeRevenueInsights(shopDomain, insights);

    return insights;
  }

  /**
   * Helper: Calculate moving average
   */
  calculateMovingAverage(data, window) {
    const result = [];
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - window + 1);
      const subset = data.slice(start, i + 1);
      const average = subset.reduce((sum, val) => sum + val, 0) / subset.length;
      result.push(average);
    }
    return result;
  }

  /**
   * Helper: Aggregate daily data by week
   */
  aggregateByWeek(dailyData) {
    const weeks = {};
    dailyData.forEach(day => {
      const date = new Date(day.date);
      const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeks[weekKey]) {
        weeks[weekKey] = { week: weekKey, revenue: 0, orders: 0 };
      }
      weeks[weekKey].revenue += day.revenue;
      weeks[weekKey].orders += day.orders;
    });
    
    return Object.values(weeks).map(week => ({
      ...week,
      avgOrderValue: week.orders > 0 ? week.revenue / week.orders : 0
    }));
  }

  /**
   * Helper: Aggregate daily data by month
   */
  aggregateByMonth(dailyData) {
    const months = {};
    dailyData.forEach(day => {
      const monthKey = day.date.substring(0, 7); // YYYY-MM
      
      if (!months[monthKey]) {
        months[monthKey] = { month: monthKey, revenue: 0, orders: 0 };
      }
      months[monthKey].revenue += day.revenue;
      months[monthKey].orders += day.orders;
    });
    
    return Object.values(months).map(month => ({
      ...month,
      avgOrderValue: month.orders > 0 ? month.revenue / month.orders : 0
    }));
  }

  /**
   * Helper: Generate linear trend forecast
   */
  generateLinearTrendForecast(data, daysAhead) {
    if (data.length < 2) return [];
    
    // Simple linear regression
    const n = data.length;
    const x = data.map((_, i) => i);
    const y = data;
    
    const xMean = x.reduce((sum, val) => sum + val, 0) / n;
    const yMean = y.reduce((sum, val) => sum + val, 0) / n;
    
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < n; i++) {
      numerator += (x[i] - xMean) * (y[i] - yMean);
      denominator += (x[i] - xMean) ** 2;
    }
    
    const slope = denominator === 0 ? 0 : numerator / denominator;
    const intercept = yMean - slope * xMean;
    
    const forecasts = [];
    for (let i = 1; i <= daysAhead; i++) {
      const predicted = slope * (n - 1 + i) + intercept;
      forecasts.push({
        day: i,
        predicted: Math.max(0, predicted),
        confidenceLow: Math.max(0, predicted * 0.8),
        confidenceHigh: predicted * 1.2
      });
    }
    
    return forecasts;
  }

  /**
   * Helper: Generate exponential smoothing forecast
   */
  generateExponentialSmoothingForecast(data, daysAhead) {
    if (data.length < 2) return [];
    
    const alpha = 0.3; // Smoothing parameter
    let smoothed = data[0];
    
    // Calculate smoothed values
    for (let i = 1; i < data.length; i++) {
      smoothed = alpha * data[i] + (1 - alpha) * smoothed;
    }
    
    // Generate forecasts
    const forecasts = [];
    for (let i = 1; i <= daysAhead; i++) {
      forecasts.push({
        day: i,
        predicted: Math.max(0, smoothed),
        confidenceLow: Math.max(0, smoothed * 0.85),
        confidenceHigh: smoothed * 1.15
      });
    }
    
    return forecasts;
  }

  /**
   * Helper: Generate seasonal forecast
   */
  generateSeasonalForecast(data, daysAhead) {
    const seasonLength = 7; // Weekly seasonality
    const forecasts = [];
    
    for (let i = 1; i <= daysAhead; i++) {
      const seasonalIndex = (data.length + i - 1) % seasonLength;
      const historicalSeasonal = [];
      
      for (let j = seasonalIndex; j < data.length; j += seasonLength) {
        historicalSeasonal.push(data[j]);
      }
      
      const seasonalAvg = historicalSeasonal.reduce((sum, val) => sum + val, 0) / historicalSeasonal.length;
      
      forecasts.push({
        day: i,
        predicted: Math.max(0, seasonalAvg),
        confidenceLow: Math.max(0, seasonalAvg * 0.75),
        confidenceHigh: seasonalAvg * 1.25
      });
    }
    
    return forecasts;
  }

  /**
   * Store revenue forecasts in database
   */
  async storeRevenueForecasts(shopDomain, forecasts) {
    const db = getDB();
    
    Object.keys(forecasts).forEach(modelType => {
      const modelForecasts = forecasts[modelType];
      if (Array.isArray(modelForecasts)) {
        modelForecasts.forEach((forecast, index) => {
          const forecastDate = new Date();
          forecastDate.setDate(forecastDate.getDate() + index + 1);
          
          db.prepare(`
            INSERT OR REPLACE INTO revenue_forecasts (
              shop_domain, forecast_date, forecast_type, model_type,
              predicted_revenue, confidence_interval_low, confidence_interval_high,
              model_parameters
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).run([
            shopDomain,
            forecastDate.toISOString().split('T')[0],
            'daily_revenue',
            modelType,
            forecast.predicted,
            forecast.confidenceLow,
            forecast.confidenceHigh,
            JSON.stringify({ day: forecast.day })
          ]);
        });
      }
    });
  }

  /**
   * Store revenue insights in database
   */
  async storeRevenueInsights(shopDomain, insights) {
    const db = getDB();
    
    // Clear existing insights
    db.prepare('DELETE FROM revenue_insights WHERE shop_domain = ?').run([shopDomain]);
    
    // Insert new insights
    insights.forEach(insight => {
      db.prepare(`
        INSERT INTO revenue_insights (
          shop_domain, insight_type, insight_category, title, description,
          impact_score, potential_revenue, confidence_level, action_items, data_points
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run([
        shopDomain,
        insight.type,
        insight.category,
        insight.title,
        insight.description,
        insight.impactScore,
        insight.potentialRevenue || null,
        insight.confidenceLevel,
        JSON.stringify(insight.actionItems || []),
        JSON.stringify(insight.dataPoints || {})
      ]);
    });
  }

  /**
   * Get cohort key based on type
   */
  getCohortKey(date, cohortType) {
    const d = new Date(date);
    switch (cohortType) {
      case this.cohortTypes.WEEKLY:
        const weekStart = new Date(d.setDate(d.getDate() - d.getDay()));
        return weekStart.toISOString().split('T')[0];
      case this.cohortTypes.MONTHLY:
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      default:
        return date;
    }
  }

  /**
   * Calculate cohort periods
   */
  calculateCohortPeriods(shopDomain, customers, cohortKey) {
    // This would calculate retention and revenue for each period after cohort start
    // Simplified implementation
    const periods = [];
    const totalCustomers = customers.length;
    
    for (let period = 0; period <= 12; period++) {
      const retainedCustomers = customers.filter(c => c.total_orders > period).length;
      const revenue = customers
        .filter(c => c.total_orders > period)
        .reduce((sum, c) => sum + c.total_spent, 0);
      
      periods.push({
        period,
        customers: retainedCustomers,
        retentionRate: (retainedCustomers / totalCustomers) * 100,
        revenue,
        avgRevenue: retainedCustomers > 0 ? revenue / retainedCustomers : 0
      });
    }
    
    return periods;
  }
}

export default new RevenueAnalytics();