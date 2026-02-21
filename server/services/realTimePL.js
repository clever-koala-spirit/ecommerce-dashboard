/**
 * Real-Time Profit & Loss Calculator
 * Competitor-beating real-time P&L analytics with cost tracking
 */

import { getDB } from '../db/database.js';
import { log } from '../utils/logger.js';
import { io } from '../index.js'; // WebSocket for real-time updates

class RealTimePL {
  constructor() {
    this.costCategories = {
      COGS: 'cost_of_goods_sold',
      ADVERTISING: 'advertising',
      SHIPPING: 'shipping',
      PAYMENT_PROCESSING: 'payment_processing',
      FIXED_COSTS: 'fixed_costs',
      LABOR: 'labor',
      SOFTWARE: 'software',
      OTHER: 'other'
    };
    
    this.marginTypes = {
      GROSS_MARGIN: 'gross_margin',
      CONTRIBUTION_MARGIN: 'contribution_margin',
      NET_MARGIN: 'net_margin'
    };
  }

  /**
   * Initialize P&L tables
   */
  initializeTables() {
    const db = getDB();
    
    // Product cost tracking
    db.run(`
      CREATE TABLE IF NOT EXISTS product_costs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        shop_domain TEXT NOT NULL,
        product_id TEXT NOT NULL,
        variant_id TEXT,
        cost_of_goods REAL NOT NULL,
        supplier_cost REAL,
        manufacturing_cost REAL,
        packaging_cost REAL,
        labor_cost_per_unit REAL,
        overhead_allocation REAL,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX(shop_domain, product_id),
        UNIQUE(shop_domain, product_id, variant_id)
      );
    `);

    // Real-time cost tracking
    db.run(`
      CREATE TABLE IF NOT EXISTS realtime_costs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        shop_domain TEXT NOT NULL,
        cost_type TEXT NOT NULL,
        cost_category TEXT NOT NULL,
        amount REAL NOT NULL,
        currency TEXT DEFAULT 'USD',
        order_id TEXT,
        product_id TEXT,
        campaign_id TEXT,
        description TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        processed BOOLEAN DEFAULT 0,
        INDEX(shop_domain, timestamp),
        INDEX(cost_category),
        INDEX(processed)
      );
    `);

    // P&L snapshots for real-time analytics
    db.run(`
      CREATE TABLE IF NOT EXISTS pl_snapshots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        shop_domain TEXT NOT NULL,
        snapshot_time DATETIME NOT NULL,
        period_start DATETIME NOT NULL,
        period_end DATETIME NOT NULL,
        total_revenue REAL NOT NULL,
        total_cogs REAL NOT NULL,
        gross_profit REAL NOT NULL,
        gross_margin_percent REAL NOT NULL,
        total_advertising_cost REAL NOT NULL,
        total_shipping_cost REAL NOT NULL,
        total_payment_fees REAL NOT NULL,
        total_fixed_costs REAL NOT NULL,
        contribution_margin REAL NOT NULL,
        contribution_margin_percent REAL NOT NULL,
        net_profit REAL NOT NULL,
        net_margin_percent REAL NOT NULL,
        order_count INTEGER NOT NULL,
        avg_order_value REAL NOT NULL,
        customer_acquisition_cost REAL,
        lifetime_value_ratio REAL,
        break_even_orders INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX(shop_domain, snapshot_time),
        UNIQUE(shop_domain, snapshot_time)
      );
    `);

    // Product-level P&L tracking
    db.run(`
      CREATE TABLE IF NOT EXISTS product_pl (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        shop_domain TEXT NOT NULL,
        product_id TEXT NOT NULL,
        date DATE NOT NULL,
        units_sold INTEGER NOT NULL,
        total_revenue REAL NOT NULL,
        total_cogs REAL NOT NULL,
        allocated_ad_spend REAL NOT NULL,
        allocated_shipping REAL NOT NULL,
        allocated_fees REAL NOT NULL,
        gross_profit REAL NOT NULL,
        contribution_profit REAL NOT NULL,
        gross_margin_percent REAL NOT NULL,
        contribution_margin_percent REAL NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX(shop_domain, date),
        INDEX(product_id),
        UNIQUE(shop_domain, product_id, date)
      );
    `);

    // Campaign P&L tracking
    db.run(`
      CREATE TABLE IF NOT EXISTS campaign_pl (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        shop_domain TEXT NOT NULL,
        campaign_id TEXT NOT NULL,
        platform TEXT NOT NULL,
        campaign_name TEXT,
        date DATE NOT NULL,
        ad_spend REAL NOT NULL,
        revenue REAL NOT NULL,
        orders INTEGER NOT NULL,
        clicks INTEGER,
        impressions INTEGER,
        cogs REAL NOT NULL,
        contribution_profit REAL NOT NULL,
        roas REAL NOT NULL,
        cpa REAL,
        margin_after_ad_spend REAL NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX(shop_domain, date),
        INDEX(campaign_id),
        UNIQUE(shop_domain, campaign_id, date)
      );
    `);

    log.info('Real-time P&L tables initialized');
  }

  /**
   * Process new order for real-time P&L calculation
   */
  async processOrderPL(shopDomain, orderData) {
    const db = getDB();
    
    try {
      const {
        orderId,
        totalRevenue,
        lineItems,
        shippingCost = 0,
        taxAmount = 0,
        discountAmount = 0,
        paymentGateway = 'shopify_payments',
        customerId,
        orderTimestamp = new Date().toISOString()
      } = orderData;

      // Calculate total COGS
      let totalCOGS = 0;
      const productPLData = [];

      for (const item of lineItems) {
        const productCost = await this.getProductCost(shopDomain, item.productId, item.variantId);
        const itemCOGS = productCost * item.quantity;
        totalCOGS += itemCOGS;

        productPLData.push({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          revenue: item.price * item.quantity,
          cogs: itemCOGS,
          unitCost: productCost
        });
      }

      // Calculate payment processing fees
      const paymentFee = this.calculatePaymentFee(totalRevenue, paymentGateway);

      // Record real-time costs
      await this.recordRealtimeCost(shopDomain, {
        costType: 'order_cogs',
        costCategory: this.costCategories.COGS,
        amount: totalCOGS,
        orderId,
        description: `COGS for order ${orderId}`
      });

      await this.recordRealtimeCost(shopDomain, {
        costType: 'payment_processing',
        costCategory: this.costCategories.PAYMENT_PROCESSING,
        amount: paymentFee,
        orderId,
        description: `Payment processing fee for order ${orderId}`
      });

      if (shippingCost > 0) {
        await this.recordRealtimeCost(shopDomain, {
          costType: 'shipping',
          costCategory: this.costCategories.SHIPPING,
          amount: shippingCost,
          orderId,
          description: `Shipping cost for order ${orderId}`
        });
      }

      // Calculate immediate P&L metrics
      const grossProfit = totalRevenue - totalCOGS;
      const grossMargin = (grossProfit / totalRevenue) * 100;
      
      // Get recent ad spend for this customer/order attribution
      const attributedAdSpend = await this.getAttributedAdSpend(shopDomain, orderId);
      
      const contributionProfit = grossProfit - paymentFee - shippingCost - attributedAdSpend;
      const contributionMargin = (contributionProfit / totalRevenue) * 100;

      // Update product-level P&L
      await this.updateProductPL(shopDomain, productPLData, attributedAdSpend, orderTimestamp);

      // Real-time P&L update
      const plUpdate = {
        orderId,
        timestamp: orderTimestamp,
        revenue: totalRevenue,
        cogs: totalCOGS,
        grossProfit,
        grossMargin,
        paymentFee,
        shippingCost,
        attributedAdSpend,
        contributionProfit,
        contributionMargin,
        customerId
      };

      // Emit real-time update to connected clients
      this.emitPLUpdate(shopDomain, plUpdate);
      
      // Trigger P&L snapshot update
      await this.updateRealtimeSnapshot(shopDomain);

      return plUpdate;

    } catch (error) {
      log.error('Error processing order P&L', error, { shopDomain, orderId: orderData.orderId });
      throw error;
    }
  }

  /**
   * Get product cost (COGS)
   */
  async getProductCost(shopDomain, productId, variantId = null) {
    const db = getDB();
    
    const stmt = db.prepare(`
      SELECT cost_of_goods, supplier_cost, manufacturing_cost, 
             packaging_cost, labor_cost_per_unit, overhead_allocation
      FROM product_costs 
      WHERE shop_domain = ? AND product_id = ? 
        AND (variant_id = ? OR variant_id IS NULL)
      ORDER BY variant_id DESC NULLS LAST
      LIMIT 1
    `);
    
    const result = stmt.get([shopDomain, productId, variantId]);
    
    if (result) {
      return result.cost_of_goods + 
             (result.supplier_cost || 0) + 
             (result.manufacturing_cost || 0) +
             (result.packaging_cost || 0) + 
             (result.labor_cost_per_unit || 0) + 
             (result.overhead_allocation || 0);
    }
    
    // Default cost if not found (should prompt user to set up costs)
    log.warn(`Product cost not found for ${productId}, using default`, { shopDomain, productId, variantId });
    return 0;
  }

  /**
   * Calculate payment processing fees
   */
  calculatePaymentFee(revenue, gateway) {
    const feeStructures = {
      'shopify_payments': { rate: 0.029, fixed: 0.30 },
      'stripe': { rate: 0.029, fixed: 0.30 },
      'paypal': { rate: 0.0319, fixed: 0.30 },
      'square': { rate: 0.0265, fixed: 0.10 },
      'default': { rate: 0.029, fixed: 0.30 }
    };
    
    const fees = feeStructures[gateway] || feeStructures.default;
    return (revenue * fees.rate) + fees.fixed;
  }

  /**
   * Get attributed ad spend for an order
   */
  async getAttributedAdSpend(shopDomain, orderId) {
    const db = getDB();
    
    // Get attribution data for this order
    const stmt = db.prepare(`
      SELECT channel_attribution 
      FROM attribution_results 
      WHERE shop_domain = ? AND order_id = ? 
        AND model_type = 'ai_enhanced'
      LIMIT 1
    `);
    
    const result = stmt.get([shopDomain, orderId]);
    
    if (result) {
      try {
        const attribution = JSON.parse(result.channel_attribution);
        let totalAdSpend = 0;
        
        // Sum up ad spend from paid channels
        const paidChannels = ['paid_search', 'social_paid', 'display', 'shopping'];
        
        Object.keys(attribution).forEach(channel => {
          if (paidChannels.some(paid => channel.includes(paid))) {
            // Get recent ad spend for this channel
            // This would need integration with your ad spend tracking
            totalAdSpend += attribution[channel].revenue * 0.2; // Rough estimate
          }
        });
        
        return totalAdSpend;
      } catch (error) {
        log.error('Error parsing attribution data', error);
      }
    }
    
    return 0;
  }

  /**
   * Record real-time cost
   */
  async recordRealtimeCost(shopDomain, costData) {
    const db = getDB();
    
    const stmt = db.prepare(`
      INSERT INTO realtime_costs (
        shop_domain, cost_type, cost_category, amount, currency,
        order_id, product_id, campaign_id, description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run([
      shopDomain,
      costData.costType,
      costData.costCategory,
      costData.amount,
      costData.currency || 'USD',
      costData.orderId || null,
      costData.productId || null,
      costData.campaignId || null,
      costData.description
    ]);
  }

  /**
   * Update product-level P&L
   */
  async updateProductPL(shopDomain, productPLData, totalAttributedAdSpend, orderTimestamp) {
    const db = getDB();
    const date = orderTimestamp.split('T')[0];
    
    for (const product of productPLData) {
      // Allocate ad spend proportionally by revenue
      const adSpendAllocation = productPLData.length > 1 
        ? (product.revenue / productPLData.reduce((sum, p) => sum + p.revenue, 0)) * totalAttributedAdSpend
        : totalAttributedAdSpend;
      
      const grossProfit = product.revenue - product.cogs;
      const contributionProfit = grossProfit - adSpendAllocation;
      const grossMargin = (grossProfit / product.revenue) * 100;
      const contributionMargin = (contributionProfit / product.revenue) * 100;

      const stmt = db.prepare(`
        INSERT OR IGNORE INTO product_pl (
          shop_domain, product_id, date, units_sold, total_revenue, total_cogs,
          allocated_ad_spend, allocated_shipping, allocated_fees, gross_profit,
          contribution_profit, gross_margin_percent, contribution_margin_percent
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run([
        shopDomain, product.productId, date, product.quantity, product.revenue,
        product.cogs, adSpendAllocation, 0, 0, grossProfit, contributionProfit,
        grossMargin, contributionMargin
      ]);

      // Update if exists
      const updateStmt = db.prepare(`
        UPDATE product_pl SET
          units_sold = units_sold + ?,
          total_revenue = total_revenue + ?,
          total_cogs = total_cogs + ?,
          allocated_ad_spend = allocated_ad_spend + ?,
          gross_profit = total_revenue - total_cogs,
          contribution_profit = gross_profit - allocated_ad_spend,
          gross_margin_percent = (gross_profit / total_revenue) * 100,
          contribution_margin_percent = (contribution_profit / total_revenue) * 100
        WHERE shop_domain = ? AND product_id = ? AND date = ?
      `);

      updateStmt.run([
        product.quantity, product.revenue, product.cogs, adSpendAllocation,
        shopDomain, product.productId, date
      ]);
    }
  }

  /**
   * Update real-time P&L snapshot
   */
  async updateRealtimeSnapshot(shopDomain) {
    const db = getDB();
    const now = new Date();
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    // Get recent orders and costs
    const recentMetrics = await this.calculateRecentMetrics(shopDomain, hourAgo, now);
    
    // Calculate current day metrics
    const todayStart = new Date(now.toISOString().split('T')[0] + 'T00:00:00Z');
    const todayMetrics = await this.calculatePeriodMetrics(shopDomain, todayStart, now);
    
    // Store snapshot
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO pl_snapshots (
        shop_domain, snapshot_time, period_start, period_end, total_revenue,
        total_cogs, gross_profit, gross_margin_percent, total_advertising_cost,
        total_shipping_cost, total_payment_fees, total_fixed_costs,
        contribution_margin, contribution_margin_percent, net_profit,
        net_margin_percent, order_count, avg_order_value, customer_acquisition_cost,
        break_even_orders
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const {
      revenue, cogs, grossProfit, grossMargin, adSpend, shippingCost,
      paymentFees, fixedCosts, contributionMargin, contributionMarginPercent,
      netProfit, netMargin, orderCount, avgOrderValue, cac, breakEvenOrders
    } = todayMetrics;
    
    stmt.run([
      shopDomain, now.toISOString(), todayStart.toISOString(), now.toISOString(),
      revenue, cogs, grossProfit, grossMargin, adSpend, shippingCost,
      paymentFees, fixedCosts, contributionMargin, contributionMarginPercent,
      netProfit, netMargin, orderCount, avgOrderValue, cac, breakEvenOrders
    ]);
  }

  /**
   * Calculate metrics for a period
   */
  async calculatePeriodMetrics(shopDomain, startDate, endDate) {
    const db = getDB();
    
    // Get revenue from metric_snapshots
    const revenueResult = db.prepare(`
      SELECT COALESCE(SUM(value), 0) as total_revenue, COUNT(*) as order_count
      FROM metric_snapshots 
      WHERE shop_domain = ? AND source = 'shopify' AND metric = 'sales'
        AND date BETWEEN ? AND ?
    `).get([shopDomain, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]);
    
    const revenue = revenueResult.total_revenue || 0;
    const orderCount = revenueResult.order_count || 0;
    
    // Get costs from realtime_costs
    const costsResult = db.prepare(`
      SELECT 
        cost_category,
        COALESCE(SUM(amount), 0) as total_cost
      FROM realtime_costs 
      WHERE shop_domain = ? 
        AND timestamp BETWEEN ? AND ?
      GROUP BY cost_category
    `).all([shopDomain, startDate.toISOString(), endDate.toISOString()]);
    
    const costs = {
      cogs: 0,
      advertising: 0,
      shipping: 0,
      payment_processing: 0,
      fixed_costs: 0,
      other: 0
    };
    
    costsResult.forEach(cost => {
      switch (cost.cost_category) {
        case this.costCategories.COGS:
          costs.cogs += cost.total_cost;
          break;
        case this.costCategories.ADVERTISING:
          costs.advertising += cost.total_cost;
          break;
        case this.costCategories.SHIPPING:
          costs.shipping += cost.total_cost;
          break;
        case this.costCategories.PAYMENT_PROCESSING:
          costs.payment_processing += cost.total_cost;
          break;
        case this.costCategories.FIXED_COSTS:
          costs.fixed_costs += cost.total_cost;
          break;
        default:
          costs.other += cost.total_cost;
      }
    });
    
    // Calculate metrics
    const grossProfit = revenue - costs.cogs;
    const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
    
    const variableCosts = costs.cogs + costs.advertising + costs.shipping + costs.payment_processing;
    const contributionMargin = revenue - variableCosts;
    const contributionMarginPercent = revenue > 0 ? (contributionMargin / revenue) * 100 : 0;
    
    const totalCosts = Object.values(costs).reduce((sum, cost) => sum + cost, 0);
    const netProfit = revenue - totalCosts;
    const netMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
    
    const avgOrderValue = orderCount > 0 ? revenue / orderCount : 0;
    const cac = orderCount > 0 ? costs.advertising / orderCount : 0;
    const breakEvenOrders = avgOrderValue > 0 ? Math.ceil(costs.fixed_costs / (avgOrderValue - variableCosts / Math.max(1, orderCount))) : 0;
    
    return {
      revenue,
      cogs: costs.cogs,
      grossProfit,
      grossMargin,
      adSpend: costs.advertising,
      shippingCost: costs.shipping,
      paymentFees: costs.payment_processing,
      fixedCosts: costs.fixed_costs,
      contributionMargin,
      contributionMarginPercent,
      netProfit,
      netMargin,
      orderCount,
      avgOrderValue,
      cac,
      breakEvenOrders
    };
  }

  /**
   * Get real-time P&L dashboard
   */
  async getRealtimePL(shopDomain, timeframe = '24h') {
    const db = getDB();
    const now = new Date();
    
    let startDate;
    switch (timeframe) {
      case '1h':
        startDate = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '6h':
        startDate = new Date(now.getTime() - 6 * 60 * 60 * 1000);
        break;
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
    
    const metrics = await this.calculatePeriodMetrics(shopDomain, startDate, now);
    
    // Get top performing products
    const topProducts = db.prepare(`
      SELECT 
        product_id,
        SUM(total_revenue) as revenue,
        SUM(gross_profit) as gross_profit,
        SUM(contribution_profit) as contribution_profit,
        AVG(gross_margin_percent) as gross_margin,
        AVG(contribution_margin_percent) as contribution_margin
      FROM product_pl 
      WHERE shop_domain = ? 
        AND date >= ?
      GROUP BY product_id 
      ORDER BY revenue DESC 
      LIMIT 10
    `).all([shopDomain, startDate.toISOString().split('T')[0]]);
    
    // Get recent P&L trends
    const trends = db.prepare(`
      SELECT 
        snapshot_time,
        total_revenue,
        gross_profit,
        contribution_margin,
        net_profit,
        gross_margin_percent,
        net_margin_percent
      FROM pl_snapshots 
      WHERE shop_domain = ? 
        AND snapshot_time >= ?
      ORDER BY snapshot_time ASC
    `).all([shopDomain, startDate.toISOString()]);
    
    return {
      timeframe,
      period: {
        start: startDate.toISOString(),
        end: now.toISOString()
      },
      current: metrics,
      topProducts,
      trends,
      alerts: await this.generatePLAlerts(shopDomain, metrics)
    };
  }

  /**
   * Generate P&L alerts
   */
  async generatePLAlerts(shopDomain, metrics) {
    const alerts = [];
    
    if (metrics.grossMargin < 20) {
      alerts.push({
        type: 'warning',
        message: `Gross margin is low at ${metrics.grossMargin.toFixed(1)}%`,
        action: 'Review product costs and pricing'
      });
    }
    
    if (metrics.netMargin < 5) {
      alerts.push({
        type: 'danger',
        message: `Net margin is very low at ${metrics.netMargin.toFixed(1)}%`,
        action: 'Urgent cost optimization needed'
      });
    }
    
    if (metrics.cac > metrics.avgOrderValue * 0.3) {
      alerts.push({
        type: 'warning',
        message: 'Customer acquisition cost is high relative to AOV',
        action: 'Optimize ad campaigns or increase AOV'
      });
    }
    
    return alerts;
  }

  /**
   * Emit real-time P&L updates via WebSocket
   */
  emitPLUpdate(shopDomain, plUpdate) {
    if (io) {
      io.to(`shop_${shopDomain}`).emit('pl_update', plUpdate);
    }
  }

  /**
   * Set product costs
   */
  async setProductCost(shopDomain, productId, costData) {
    const db = getDB();
    
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO product_costs (
        shop_domain, product_id, variant_id, cost_of_goods, supplier_cost,
        manufacturing_cost, packaging_cost, labor_cost_per_unit, overhead_allocation
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run([
      shopDomain,
      productId,
      costData.variantId || null,
      costData.costOfGoods || 0,
      costData.supplierCost || 0,
      costData.manufacturingCost || 0,
      costData.packagingCost || 0,
      costData.laborCostPerUnit || 0,
      costData.overheadAllocation || 0
    ]);
    
    return { success: true };
  }
}

export default new RealTimePL();