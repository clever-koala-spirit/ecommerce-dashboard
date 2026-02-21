/**
 * Product Velocity Predictor - JavaScript Wrapper  
 * Predicts which products will trend and optimal inventory timing
 */

import { spawn } from 'child_process';
import { log } from '../utils/logger.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ProductVelocityPredictor {
  constructor() {
    this.pythonPath = path.join(__dirname, '../../../slay-season-predictions');
    this.ready = false;
    this.lastHealthCheck = null;
  }

  /**
   * Check if model is ready for predictions
   */
  isReady() {
    if (this.lastHealthCheck && Date.now() - this.lastHealthCheck < 60000) {
      return this.ready;
    }
    
    this.ready = true;
    this.lastHealthCheck = Date.now();
    return this.ready;
  }

  /**
   * Call Python prediction model
   */
  async callPythonModel(inputData) {
    return new Promise((resolve, reject) => {
      const python = spawn('python3', ['-c', `
import sys
import os
sys.path.append('${this.pythonPath}')
from models.product_velocity import ProductVelocityPredictor
import json

# Initialize predictor
predictor = ProductVelocityPredictor()

# Parse input
input_data = json.loads('${JSON.stringify(inputData).replace(/'/g, "\\'")}')

# Make prediction
try:
    result = predictor.predict_velocity(input_data)
    print(json.dumps(result))
except Exception as e:
    print(json.dumps({"error": str(e)}))
`]);

      let output = '';
      let errorOutput = '';

      python.stdout.on('data', (data) => {
        output += data.toString();
      });

      python.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      python.on('close', (code) => {
        if (code !== 0) {
          log.error(`Python prediction failed with code ${code}: ${errorOutput}`);
          reject(new Error(`Python prediction failed: ${errorOutput}`));
          return;
        }

        try {
          const result = JSON.parse(output.trim());
          if (result.error) {
            reject(new Error(result.error));
          } else {
            resolve(result);
          }
        } catch (parseError) {
          log.error('Failed to parse Python output:', parseError);
          reject(new Error('Failed to parse prediction result'));
        }
      });
    });
  }

  /**
   * Predict product velocity and trends
   */
  async predictVelocity(inputData) {
    try {
      const {
        product_data = [],
        inventory_levels = {},
        market_trends = {},
        shop_domain
      } = inputData;

      log.info(`🚀 Predicting product velocity for ${shop_domain} (${product_data.length} products)`);

      // Try Python model first
      let prediction;
      try {
        prediction = await this.callPythonModel({
          product_data,
          inventory_levels,
          market_trends
        });
      } catch (pythonError) {
        log.error('Python model failed, using fallback:', pythonError);
        prediction = this.fallbackVelocity(inputData);
      }

      // Enhance with actionable insights
      const enhancedPrediction = this.enhanceVelocity(prediction, inputData);

      log.info(`✅ Product velocity prediction complete: ${enhancedPrediction.confidence} confidence`);
      return enhancedPrediction;

    } catch (error) {
      log.error('Product velocity prediction failed:', error);
      throw error;
    }
  }

  /**
   * Fallback velocity prediction when Python model fails
   */
  fallbackVelocity(inputData) {
    const { product_data = [], inventory_levels = {} } = inputData;

    if (product_data.length === 0) {
      return {
        trending_products: [],
        velocity_scores: {},
        demand_forecast: {}
      };
    }

    // Analyze product performance trends
    const velocityScores = {};
    const trendingProducts = [];
    const demandForecast = {};
    const stockAlerts = [];

    product_data.forEach(product => {
      const productId = product.id || product.product_id;
      const recentSales = product.sales_last_30_days || 0;
      const previousSales = product.sales_previous_30_days || 0;
      const currentStock = inventory_levels[productId] || product.inventory_quantity || 0;
      
      // Calculate velocity metrics
      const salesGrowth = previousSales > 0 ? (recentSales - previousSales) / previousSales : 0;
      const dailySalesRate = recentSales / 30;
      const daysOfInventoryRemaining = dailySalesRate > 0 ? currentStock / dailySalesRate : 999;
      
      // Velocity score (0-1 scale)
      let velocityScore = 0;
      if (salesGrowth > 0.5) velocityScore += 0.4; // 50% growth = high velocity
      if (salesGrowth > 0.2) velocityScore += 0.2; // 20% growth = medium velocity
      if (dailySalesRate > 1) velocityScore += 0.2; // > 1 sale per day = active
      if (product.page_views_growth > 0.3) velocityScore += 0.2; // Growing interest
      
      velocityScores[productId] = Math.min(1, velocityScore);

      // Identify trending products
      if (velocityScore > 0.6) {
        trendingProducts.push({
          product_id: productId,
          name: product.title || product.name,
          velocity_score: velocityScore,
          sales_growth: salesGrowth,
          predicted_trend: salesGrowth > 1.0 ? 'explosive' : salesGrowth > 0.5 ? 'strong' : 'growing',
          current_stock: currentStock,
          days_remaining: Math.round(daysOfInventoryRemaining)
        });
      }

      // Stock alerts
      if (daysOfInventoryRemaining < 7 && dailySalesRate > 0.5) {
        stockAlerts.push({
          product_id: productId,
          name: product.title || product.name,
          urgency: daysOfInventoryRemaining < 3 ? 'critical' : 'warning',
          days_remaining: Math.round(daysOfInventoryRemaining),
          recommended_reorder: Math.ceil(dailySalesRate * 30) // 30 days worth
        });
      }

      // Demand forecast (next 30 days)
      const trendMultiplier = 1 + Math.min(salesGrowth, 1.0); // Cap at 100% growth
      demandForecast[productId] = Math.round(dailySalesRate * 30 * trendMultiplier);
    });

    // Sort trending products by velocity score
    trendingProducts.sort((a, b) => b.velocity_score - a.velocity_score);

    return {
      trending_products: trendingProducts.slice(0, 10), // Top 10
      velocity_scores: velocityScores,
      demand_forecast: demandForecast,
      stock_alerts: stockAlerts
    };
  }

  /**
   * Enhance velocity prediction with actionable insights
   */
  enhanceVelocity(prediction, inputData) {
    const { 
      trending_products = [], 
      velocity_scores = {}, 
      demand_forecast = {},
      stock_alerts = [] 
    } = prediction;

    // Determine confidence based on data quality
    const totalProducts = Object.keys(velocity_scores).length;
    let confidence = 'green';
    if (totalProducts < 5) confidence = 'red';
    else if (totalProducts < 20) confidence = 'yellow';

    // Generate actionable recommendation
    let recommendation = '';
    const hotProducts = trending_products.filter(p => p.velocity_score > 0.8).length;
    const criticalStock = stock_alerts.filter(alert => alert.urgency === 'critical').length;

    if (criticalStock > 0) {
      recommendation = `🚨 Critical: ${criticalStock} products near stockout. Reorder immediately!`;
    } else if (hotProducts > 0) {
      recommendation = `🔥 Hot Products: ${hotProducts} items trending. Consider increasing inventory.`;
    } else if (trending_products.length > 0) {
      recommendation = `📈 Growing Trends: ${trending_products.length} products showing positive velocity.`;
    } else {
      recommendation = '📊 Stable: Product performance is steady. Monitor for changes.';
    }

    // Calculate urgency level
    let urgencyLevel = 'low';
    if (criticalStock > 0) urgencyLevel = 'high';
    else if (hotProducts > 2) urgencyLevel = 'medium';

    // Generate inventory recommendations
    const inventoryRecommendations = this.generateInventoryRecommendations(
      trending_products, 
      stock_alerts, 
      demand_forecast
    );

    return {
      ...prediction,
      confidence,
      recommendation,
      urgency_level: urgencyLevel,
      inventory_recommendations: inventoryRecommendations,
      total_potential_revenue: this.calculatePotentialRevenue(trending_products, demand_forecast),
      next_review_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week
      market_position: this.assessMarketPosition(trending_products)
    };
  }

  /**
   * Generate specific inventory recommendations
   */
  generateInventoryRecommendations(trendingProducts, stockAlerts, demandForecast) {
    const recommendations = [];

    // Critical stock situations
    stockAlerts.forEach(alert => {
      recommendations.push({
        product_id: alert.product_id,
        action: 'reorder_immediately',
        priority: alert.urgency === 'critical' ? 'high' : 'medium',
        quantity: alert.recommended_reorder,
        reason: `${alert.days_remaining} days of stock remaining`,
        timeline: alert.urgency === 'critical' ? '24-48 hours' : '1 week'
      });
    });

    // Trending product opportunities
    trendingProducts.forEach(product => {
      if (product.velocity_score > 0.8 && product.days_remaining > 7) {
        const additionalStock = Math.round(demandForecast[product.product_id] * 0.5); // 50% buffer
        recommendations.push({
          product_id: product.product_id,
          action: 'increase_inventory',
          priority: 'medium',
          quantity: additionalStock,
          reason: `High velocity (${Math.round(product.velocity_score * 100)}%) - capture trending demand`,
          timeline: '1-2 weeks'
        });
      }
    });

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Calculate potential revenue from trending products
   */
  calculatePotentialRevenue(trendingProducts, demandForecast) {
    return trendingProducts.reduce((total, product) => {
      const forecastedUnits = demandForecast[product.product_id] || 0;
      const estimatedPrice = 50; // Default average price - could be enhanced with actual product pricing
      return total + (forecastedUnits * estimatedPrice);
    }, 0);
  }

  /**
   * Assess market position based on trending products
   */
  assessMarketPosition(trendingProducts) {
    if (trendingProducts.length === 0) {
      return {
        position: 'stable',
        trend_strength: 'low',
        market_opportunity: 'maintain current strategy'
      };
    }

    const explosiveTrends = trendingProducts.filter(p => p.predicted_trend === 'explosive').length;
    const strongTrends = trendingProducts.filter(p => p.predicted_trend === 'strong').length;

    let position = 'growing';
    let trendStrength = 'medium';
    let marketOpportunity = 'capitalize on growing trends';

    if (explosiveTrends > 2) {
      position = 'breakout';
      trendStrength = 'high';
      marketOpportunity = 'aggressive expansion recommended';
    } else if (strongTrends > 5) {
      position = 'strong';
      trendStrength = 'high';
      marketOpportunity = 'scale successful products';
    }

    return {
      position,
      trend_strength: trendStrength,
      market_opportunity: marketOpportunity,
      trending_categories: this.identifyTrendingCategories(trendingProducts)
    };
  }

  /**
   * Identify trending product categories
   */
  identifyTrendingCategories(trendingProducts) {
    const categoryScores = {};
    
    trendingProducts.forEach(product => {
      // This would be enhanced with actual category data
      const category = product.category || 'General';
      categoryScores[category] = (categoryScores[category] || 0) + product.velocity_score;
    });

    return Object.entries(categoryScores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category, score]) => ({
        category,
        trend_strength: score > 3 ? 'high' : score > 1.5 ? 'medium' : 'low'
      }));
  }

  /**
   * Quick inventory health check
   */
  async quickInventoryCheck(products) {
    try {
      if (!products || products.length === 0) {
        return {
          status: 'no_data',
          recommendation: 'No product data available for analysis'
        };
      }

      let criticalCount = 0;
      let warningCount = 0;

      products.forEach(product => {
        const dailySales = (product.sales_last_30_days || 0) / 30;
        const currentStock = product.inventory_quantity || 0;
        const daysRemaining = dailySales > 0 ? currentStock / dailySales : 999;

        if (daysRemaining < 3) criticalCount++;
        else if (daysRemaining < 7) warningCount++;
      });

      let status = 'healthy';
      let recommendation = 'Inventory levels look good';

      if (criticalCount > 0) {
        status = 'critical';
        recommendation = `🚨 ${criticalCount} products critically low. Immediate action needed.`;
      } else if (warningCount > 0) {
        status = 'warning';
        recommendation = `⚠️ ${warningCount} products running low. Plan reorders soon.`;
      }

      return {
        status,
        recommendation,
        critical_products: criticalCount,
        warning_products: warningCount,
        healthy_products: products.length - criticalCount - warningCount
      };

    } catch (error) {
      log.error('Inventory health check failed:', error);
      return {
        status: 'error',
        recommendation: 'Unable to analyze inventory health'
      };
    }
  }

  /**
   * Get model health status
   */
  getHealthStatus() {
    return {
      model_name: 'Product Velocity Predictor',
      status: this.isReady() ? 'healthy' : 'unavailable',
      python_path: this.pythonPath,
      last_check: this.lastHealthCheck,
      version: '1.0.0'
    };
  }
}