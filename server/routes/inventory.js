// Inventory Management API Routes
// Provides comprehensive inventory tracking, analytics, and optimization endpoints

import express from 'express';
import InventoryAnalyticsService from '../services/inventoryAnalytics.js';
import { shopifyService } from '../services/shopify.js';
import dbAdapter from '../services/dbAdapter.js';

const router = express.Router();

// Initialize services
const inventoryService = new InventoryAnalyticsService(dbAdapter, shopifyService);

// Middleware to validate shop authentication
const validateShopAuth = (req, res, next) => {
  const shopId = req.headers['x-shop-id'] || req.body.shop_id || req.query.shop_id;
  
  if (!shopId) {
    return res.status(400).json({
      error: 'Missing shop_id',
      message: 'Shop ID is required for inventory operations'
    });
  }
  
  req.shopId = shopId;
  next();
};

/**
 * GET /api/inventory/levels
 * Get comprehensive inventory levels with analytics
 * 
 * Query Parameters:
 * - stock_status: Filter by stock status (out_of_stock, critical_low, low_stock, normal, healthy, overstocked)
 * - velocity_class: Filter by velocity (fast_moving, medium_moving, slow_moving, dead_stock)
 * - product_type: Filter by product type
 * - vendor: Filter by vendor
 * - needs_action: Filter products that need action (boolean)
 * - search: Search in title, SKU, or barcode
 * - sort_by: Sort criteria (stock_status, velocity, stock_value, turnover, days_remaining, title, created_at)
 * - limit: Number of results to return (default: 100)
 * - offset: Pagination offset (default: 0)
 */
router.get('/levels', validateShopAuth, async (req, res) => {
  try {
    console.log(`📦 Getting inventory levels for shop: ${req.shopId}`);
    
    const filters = {
      stock_status: req.query.stock_status,
      velocity_class: req.query.velocity_class,
      product_type: req.query.product_type,
      vendor: req.query.vendor,
      needs_action: req.query.needs_action === 'true',
      search: req.query.search,
      sort_by: req.query.sort_by || 'stock_status'
    };

    // Remove undefined filters
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined || filters[key] === null || filters[key] === '') {
        delete filters[key];
      }
    });

    const result = await inventoryService.getInventoryLevels(req.shopId, filters);

    // Apply pagination
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    
    const paginatedProducts = result.products.slice(offset, offset + limit);
    
    res.json({
      success: true,
      data: {
        products: paginatedProducts,
        summary: result.summary,
        metadata: {
          ...result.metadata,
          pagination: {
            total: result.products.length,
            limit,
            offset,
            has_more: offset + limit < result.products.length
          }
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error in /api/inventory/levels:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get inventory levels',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/inventory/turnover
 * Get inventory turnover analysis with performance metrics
 * 
 * Query Parameters:
 * - period: Analysis period in days (default: 90)
 * - sort_by: Sort criteria (turnover, stock_value, revenue, title)
 * - limit: Number of results to return (default: 50)
 */
router.get('/turnover', validateShopAuth, async (req, res) => {
  try {
    console.log(`📊 Getting inventory turnover for shop: ${req.shopId}`);
    
    const period = parseInt(req.query.period) || 90;
    const result = await inventoryService.getInventoryTurnover(req.shopId, period);

    // Apply sorting and pagination
    const sortBy = req.query.sort_by || 'turnover';
    const limit = parseInt(req.query.limit) || 50;

    let sortedAnalysis = [...result.turnover_analysis];
    
    switch (sortBy) {
      case 'stock_value':
        sortedAnalysis.sort((a, b) => b.total_stock_value - a.total_stock_value);
        break;
      case 'revenue':
        sortedAnalysis.sort((a, b) => b.total_revenue_90d - a.total_revenue_90d);
        break;
      case 'title':
        sortedAnalysis.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        // Already sorted by turnover in service
        break;
    }

    const paginatedAnalysis = sortedAnalysis.slice(0, limit);

    res.json({
      success: true,
      data: {
        turnover_analysis: paginatedAnalysis,
        summary: result.summary,
        period_days: result.period_days,
        metadata: {
          total_products: sortedAnalysis.length,
          showing: paginatedAnalysis.length,
          sort_by: sortBy
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error in /api/inventory/turnover:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get inventory turnover',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/inventory/alerts
 * Get inventory alerts and recommendations
 * 
 * Query Parameters:
 * - types: Comma-separated list of alert types (stock,dead_stock,overstock,high_value) or 'all'
 * - severity: Filter by severity (critical, high, medium, low)
 * - limit: Number of alerts to return (default: 50)
 */
router.get('/alerts', validateShopAuth, async (req, res) => {
  try {
    console.log(`🚨 Getting inventory alerts for shop: ${req.shopId}`);
    
    const alertTypes = req.query.types ? req.query.types.split(',') : ['all'];
    const result = await inventoryService.getInventoryAlerts(req.shopId, alertTypes);
    
    let filteredAlerts = result.alerts;
    
    // Filter by severity if specified
    if (req.query.severity) {
      filteredAlerts = filteredAlerts.filter(alert => alert.severity === req.query.severity);
    }
    
    // Apply limit
    const limit = parseInt(req.query.limit) || 50;
    const limitedAlerts = filteredAlerts.slice(0, limit);

    res.json({
      success: true,
      data: {
        alerts: limitedAlerts,
        summary: result.summary,
        metadata: {
          total_alerts: filteredAlerts.length,
          showing: limitedAlerts.length,
          alert_types: alertTypes,
          severity_filter: req.query.severity || 'all'
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error in /api/inventory/alerts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get inventory alerts',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/inventory/summary
 * Get high-level inventory summary and KPIs
 */
router.get('/summary', validateShopAuth, async (req, res) => {
  try {
    console.log(`📋 Getting inventory summary for shop: ${req.shopId}`);
    
    // Get basic inventory data
    const inventoryData = await inventoryService.getInventoryLevels(req.shopId);
    const alerts = await inventoryService.getInventoryAlerts(req.shopId, ['all']);
    const turnoverData = await inventoryService.getInventoryTurnover(req.shopId, 90);

    // Calculate key performance indicators
    const kpis = {
      // Basic metrics
      total_products: inventoryData.summary.total_products,
      total_stock_value: inventoryData.summary.total_stock_value,
      avg_inventory_turnover: turnoverData.summary.avg_turnover,
      
      // Stock health
      healthy_stock_percentage: inventoryData.summary.total_products > 0 ? 
        ((inventoryData.summary.stock_status.healthy + inventoryData.summary.stock_status.normal) / inventoryData.summary.total_products * 100).toFixed(1) : 0,
      
      // Risk indicators
      stockout_risk_products: inventoryData.summary.stock_status.out_of_stock + inventoryData.summary.stock_status.critical_low,
      dead_stock_value: inventoryData.summary.dead_stock_value,
      dead_stock_percentage: inventoryData.summary.total_stock_value > 0 ? 
        (inventoryData.summary.dead_stock_value / inventoryData.summary.total_stock_value * 100).toFixed(1) : 0,
      
      // Actionable insights
      urgent_actions_needed: alerts.summary.critical_alerts + alerts.summary.high_priority,
      reorder_needed: inventoryData.summary.reorder_needed_count,
      
      // Performance indicators
      fast_movers: inventoryData.summary.velocity.fast_moving,
      slow_movers: inventoryData.summary.velocity.slow_moving,
      
      // Financial impact
      potential_lost_sales: inventoryData.summary.stock_status.out_of_stock * 100, // Estimated
      optimization_opportunity: inventoryData.summary.dead_stock_value + 
        (inventoryData.summary.stock_status.overstocked * 50) // Estimated
    };

    // Generate recommendations
    const recommendations = generateRecommendations(inventoryData.summary, alerts.summary, kpis);

    res.json({
      success: true,
      data: {
        kpis,
        stock_distribution: inventoryData.summary.stock_status,
        velocity_distribution: inventoryData.summary.velocity,
        alert_summary: alerts.summary,
        turnover_summary: turnoverData.summary,
        recommendations,
        health_score: calculateInventoryHealthScore(kpis)
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error in /api/inventory/summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get inventory summary',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/inventory/update-costs
 * Update product costs for better inventory analytics
 */
router.post('/update-costs', validateShopAuth, async (req, res) => {
  try {
    console.log(`💰 Updating product costs for shop: ${req.shopId}`);
    
    const { costs } = req.body;
    
    if (!costs || !Array.isArray(costs)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid costs data',
        message: 'Costs should be an array of {variant_id, cost_per_item} objects'
      });
    }

    // Validate cost data
    const validCosts = costs.filter(cost => 
      cost.variant_id && 
      typeof cost.cost_per_item === 'number' && 
      cost.cost_per_item >= 0
    );

    if (validCosts.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid costs provided',
        message: 'Each cost entry must have variant_id and valid cost_per_item'
      });
    }

    // Update costs in database
    const updatePromises = validCosts.map(cost => 
      dbAdapter.run(`
        INSERT OR REPLACE INTO product_costs (shop_id, variant_id, cost_per_item, updated_at)
        VALUES (?, ?, ?, ?)
      `, [req.shopId, cost.variant_id, cost.cost_per_item, new Date().toISOString()])
    );

    await Promise.all(updatePromises);

    res.json({
      success: true,
      data: {
        updated_count: validCosts.length,
        invalid_count: costs.length - validCosts.length
      },
      message: `Updated costs for ${validCosts.length} variants`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error updating product costs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update product costs',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/inventory/forecast
 * Get inventory forecasting based on sales trends
 */
router.get('/forecast', validateShopAuth, async (req, res) => {
  try {
    console.log(`🔮 Getting inventory forecast for shop: ${req.shopId}`);
    
    const days = parseInt(req.query.days) || 30;
    const variant_id = req.query.variant_id;

    // Get current inventory data
    const inventoryData = await inventoryService.getInventoryLevels(req.shopId);
    
    let products = inventoryData.products;
    
    // Filter to specific variant if requested
    if (variant_id) {
      products = products.filter(p => p.id == variant_id);
    }

    // Generate forecasts for each product
    const forecasts = products.map(product => {
      const forecastDays = [];
      let currentStock = product.inventory_quantity;
      const dailySales = product.sales_velocity;
      
      for (let day = 1; day <= days; day++) {
        currentStock = Math.max(0, currentStock - dailySales);
        
        forecastDays.push({
          day,
          date: new Date(Date.now() + day * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          predicted_stock: Math.round(currentStock * 100) / 100,
          will_stockout: currentStock <= 0,
          needs_reorder: currentStock <= product.reorder_point
        });
      }

      const stockoutDay = forecastDays.find(day => day.will_stockout);
      const reorderDay = forecastDays.find(day => day.needs_reorder);

      return {
        variant_id: product.id,
        title: product.title,
        variant_title: product.variant_title,
        current_stock: product.inventory_quantity,
        sales_velocity: dailySales,
        reorder_point: product.reorder_point,
        
        forecast_days: forecastDays,
        
        predictions: {
          stockout_in_days: stockoutDay ? stockoutDay.day : null,
          reorder_needed_in_days: reorderDay ? reorderDay.day : null,
          stock_at_end_of_period: forecastDays[forecastDays.length - 1]?.predicted_stock || 0
        }
      };
    });

    // Generate summary
    const summary = {
      total_forecasted: forecasts.length,
      will_stockout: forecasts.filter(f => f.predictions.stockout_in_days !== null).length,
      need_reorder_soon: forecasts.filter(f => f.predictions.reorder_needed_in_days && f.predictions.reorder_needed_in_days <= 14).length,
      avg_days_until_stockout: forecasts
        .filter(f => f.predictions.stockout_in_days !== null)
        .reduce((sum, f, _, arr) => sum + f.predictions.stockout_in_days / arr.length, 0) || null
    };

    res.json({
      success: true,
      data: {
        forecasts: variant_id ? forecasts : forecasts.slice(0, 20), // Limit unless specific variant
        summary,
        forecast_period_days: days
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error getting inventory forecast:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get inventory forecast',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Helper function to generate recommendations
function generateRecommendations(inventorySummary, alertsSummary, kpis) {
  const recommendations = [];

  // Stockout prevention
  if (alertsSummary.critical_alerts > 0) {
    recommendations.push({
      type: 'urgent',
      title: 'Immediate Action Required',
      description: `${alertsSummary.critical_alerts} products are critically low or out of stock`,
      action: 'Review urgent reorder alerts and place emergency orders',
      priority: 'high',
      impact: 'Prevent lost sales and customer dissatisfaction'
    });
  }

  // Dead stock optimization
  if (parseFloat(kpis.dead_stock_percentage) > 10) {
    recommendations.push({
      type: 'optimization',
      title: 'Dead Stock Clean-up',
      description: `${kpis.dead_stock_percentage}% of inventory value is tied up in dead stock`,
      action: 'Create promotional campaigns or bundles to move dead inventory',
      priority: 'medium',
      impact: `Free up $${kpis.dead_stock_value.toFixed(0)} in working capital`
    });
  }

  // Inventory turnover improvement
  if (kpis.avg_inventory_turnover < 6) {
    recommendations.push({
      type: 'performance',
      title: 'Improve Inventory Turnover',
      description: `Average turnover of ${kpis.avg_inventory_turnover.toFixed(1)} is below optimal levels`,
      action: 'Focus on fast-moving products and reduce slow-moving inventory',
      priority: 'medium',
      impact: 'Increase cash flow and reduce carrying costs'
    });
  }

  // Healthy stock percentage
  if (parseFloat(kpis.healthy_stock_percentage) < 70) {
    recommendations.push({
      type: 'strategy',
      title: 'Improve Stock Health',
      description: `Only ${kpis.healthy_stock_percentage}% of products have healthy stock levels`,
      action: 'Implement better demand forecasting and reorder point calculations',
      priority: 'medium',
      impact: 'Reduce stockouts and overstock situations'
    });
  }

  // Reorder optimization
  if (kpis.reorder_needed > inventorySummary.total_products * 0.2) {
    recommendations.push({
      type: 'process',
      title: 'Automate Reorders',
      description: `${kpis.reorder_needed} products need reordering`,
      action: 'Set up automated reorder alerts or integrate with suppliers',
      priority: 'low',
      impact: 'Reduce manual work and prevent stockouts'
    });
  }

  return recommendations;
}

// Helper function to calculate inventory health score
function calculateInventoryHealthScore(kpis) {
  let score = 100;

  // Deduct for stockout risk
  score -= (kpis.stockout_risk_products / Math.max(1, kpis.total_products)) * 30;

  // Deduct for dead stock
  score -= Math.min(30, parseFloat(kpis.dead_stock_percentage));

  // Add for good turnover
  if (kpis.avg_inventory_turnover > 8) score += 10;
  else if (kpis.avg_inventory_turnover < 4) score -= 15;

  // Add for healthy stock percentage
  score += (parseFloat(kpis.healthy_stock_percentage) - 50) * 0.3;

  return Math.max(0, Math.min(100, Math.round(score)));
}

export default router;