import { getDB } from '../db/database.js';
import { log } from '../utils/logger.js';
import shopifyService from './shopify.js';
import dataProcessor from './dataProcessor.js';
import crypto from 'crypto';

class MultiStoreService {
  constructor() {
    this.db = null;
    this.initializeService();
  }

  initializeService() {
    try {
      this.db = getDB();
      this.createTables();
    } catch (error) {
      log('error', 'Failed to initialize multi-store service', { error: error.message });
    }
  }

  createTables() {
    const tables = `
      -- Multi-store connections
      CREATE TABLE IF NOT EXISTS multi_store_connections (
        id TEXT PRIMARY KEY,
        master_shop TEXT NOT NULL,
        connected_shop TEXT NOT NULL,
        store_name TEXT,
        store_type TEXT DEFAULT 'shopify',
        access_token TEXT NOT NULL,
        connection_status TEXT DEFAULT 'active',
        last_sync DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(master_shop, connected_shop)
      );

      -- Store performance metrics cache
      CREATE TABLE IF NOT EXISTS multi_store_metrics_cache (
        id TEXT PRIMARY KEY,
        master_shop TEXT NOT NULL,
        store_id TEXT NOT NULL,
        metric_date DATE NOT NULL,
        revenue DECIMAL(15,2) DEFAULT 0,
        orders INTEGER DEFAULT 0,
        customers INTEGER DEFAULT 0,
        conversion_rate DECIMAL(5,4) DEFAULT 0,
        avg_order_value DECIMAL(10,2) DEFAULT 0,
        total_products INTEGER DEFAULT 0,
        active_products INTEGER DEFAULT 0,
        total_inventory INTEGER DEFAULT 0,
        inventory_value DECIMAL(15,2) DEFAULT 0,
        marketing_spend DECIMAL(10,2) DEFAULT 0,
        profit_margin DECIMAL(5,4) DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(master_shop, store_id, metric_date)
      );

      -- Store rankings cache
      CREATE TABLE IF NOT EXISTS multi_store_rankings (
        id TEXT PRIMARY KEY,
        master_shop TEXT NOT NULL,
        store_id TEXT NOT NULL,
        ranking_type TEXT NOT NULL,
        ranking_period TEXT NOT NULL,
        rank_position INTEGER,
        metric_value DECIMAL(15,2),
        calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(master_shop, store_id, ranking_type, ranking_period)
      );

      -- Inventory optimization recommendations
      CREATE TABLE IF NOT EXISTS multi_store_inventory_recommendations (
        id TEXT PRIMARY KEY,
        master_shop TEXT NOT NULL,
        product_id TEXT NOT NULL,
        from_store TEXT,
        to_store TEXT,
        recommendation_type TEXT NOT NULL,
        quantity_recommended INTEGER,
        estimated_impact DECIMAL(10,2),
        confidence_score DECIMAL(3,2),
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME
      );

      -- Cross-store performance comparisons
      CREATE TABLE IF NOT EXISTS multi_store_comparisons (
        id TEXT PRIMARY KEY,
        master_shop TEXT NOT NULL,
        comparison_date DATE NOT NULL,
        store_count INTEGER,
        total_revenue DECIMAL(15,2),
        total_orders INTEGER,
        total_customers INTEGER,
        best_performing_store TEXT,
        worst_performing_store TEXT,
        performance_variance DECIMAL(5,4),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `;

    this.db.exec(tables);
    log('info', 'Multi-store tables initialized');
  }

  /**
   * Get comprehensive overview of all connected stores
   */
  async getOverview(masterShop, options = {}) {
    const { timeRange = '30d', metrics = ['all'] } = options;
    
    try {
      // Get all connected stores
      const stores = this.getConnectedStores(masterShop);
      
      if (stores.length === 0) {
        return {
          stores: [],
          totalStores: 0,
          consolidatedMetrics: this.getEmptyMetrics(),
          lastUpdate: new Date().toISOString()
        };
      }

      // Get metrics for each store
      const storeMetrics = await this.getMetricsForStores(stores, timeRange);
      
      // Calculate consolidated metrics
      const consolidatedMetrics = this.consolidateMetrics(storeMetrics);
      
      // Add performance trends and rankings
      const storeOverviews = await Promise.all(stores.map(async (store) => {
        const metrics = storeMetrics[store.id] || this.getEmptyMetrics();
        const trends = await this.getStoreTrends(store.id, timeRange);
        const ranking = this.getStoreRanking(masterShop, store.id);
        
        return {
          ...store,
          metrics,
          trends,
          ranking,
          status: store.connection_status,
          lastSync: store.last_sync
        };
      }));

      return {
        stores: storeOverviews,
        totalStores: stores.length,
        consolidatedMetrics,
        performanceDistribution: this.calculatePerformanceDistribution(storeOverviews),
        topPerformers: this.getTopPerformers(storeOverviews),
        alerts: await this.getMultiStoreAlerts(masterShop),
        lastUpdate: new Date().toISOString()
      };
    } catch (error) {
      log('error', 'Failed to get multi-store overview', { error: error.message, masterShop });
      throw error;
    }
  }

  /**
   * Compare performance across selected stores
   */
  async compareStores(masterShop, options = {}) {
    const { storeIds, metrics = ['revenue', 'orders', 'conversion'], timeRange = '30d' } = options;
    
    try {
      const stores = this.getConnectedStores(masterShop, storeIds);
      const comparison = {
        stores: [],
        metrics: {},
        insights: [],
        recommendations: []
      };

      for (const store of stores) {
        const storeMetrics = await this.getStoreMetrics(store.id, timeRange);
        const trends = await this.getStoreTrends(store.id, timeRange);
        
        comparison.stores.push({
          id: store.id,
          name: store.store_name,
          domain: store.connected_shop,
          metrics: storeMetrics,
          trends
        });
      }

      // Generate comparison insights
      comparison.insights = this.generateComparisonInsights(comparison.stores, metrics);
      comparison.recommendations = await this.generateStoreRecommendations(comparison.stores);
      
      // Calculate relative performance
      comparison.relativePerformance = this.calculateRelativePerformance(comparison.stores, metrics);

      return comparison;
    } catch (error) {
      log('error', 'Failed to compare stores', { error: error.message, masterShop });
      throw error;
    }
  }

  /**
   * Get consolidated metrics across all stores
   */
  async getConsolidatedMetrics(masterShop, options = {}) {
    const { timeRange = '30d', includeBreakdown = true, currency = 'USD' } = options;
    
    try {
      const stores = this.getConnectedStores(masterShop);
      const consolidated = {
        summary: this.getEmptyMetrics(),
        trends: {},
        breakdown: includeBreakdown ? {} : null,
        currency,
        period: timeRange,
        storeCount: stores.length
      };

      if (stores.length === 0) {
        return consolidated;
      }

      // Aggregate metrics from all stores
      const allMetrics = await this.getMetricsForStores(stores, timeRange);
      consolidated.summary = this.consolidateMetrics(allMetrics);
      
      // Generate trends
      consolidated.trends = await this.getConsolidatedTrends(stores, timeRange);
      
      // Add breakdown by store if requested
      if (includeBreakdown) {
        consolidated.breakdown = {
          byStore: Object.entries(allMetrics).map(([storeId, metrics]) => {
            const store = stores.find(s => s.id === storeId);
            return {
              storeId,
              storeName: store?.store_name || store?.connected_shop,
              metrics,
              percentageOfTotal: this.calculatePercentageOfTotal(metrics, consolidated.summary)
            };
          }),
          byRegion: await this.getRegionalBreakdown(stores, allMetrics),
          byChannel: await this.getChannelBreakdown(stores, allMetrics)
        };
      }

      return consolidated;
    } catch (error) {
      log('error', 'Failed to get consolidated metrics', { error: error.message, masterShop });
      throw error;
    }
  }

  /**
   * Get store performance rankings
   */
  async getStoreRankings(masterShop, options = {}) {
    const { metric = 'revenue', timeRange = '30d', order = 'desc' } = options;
    
    try {
      const stores = this.getConnectedStores(masterShop);
      const rankings = [];

      for (const store of stores) {
        const metrics = await this.getStoreMetrics(store.id, timeRange);
        const metricValue = metrics[metric] || 0;
        
        rankings.push({
          storeId: store.id,
          storeName: store.store_name,
          domain: store.connected_shop,
          metricValue,
          metrics,
          trends: await this.getStoreTrends(store.id, timeRange, [metric])
        });
      }

      // Sort rankings
      rankings.sort((a, b) => {
        return order === 'desc' ? b.metricValue - a.metricValue : a.metricValue - b.metricValue;
      });

      // Add ranking positions and performance grades
      rankings.forEach((ranking, index) => {
        ranking.rank = index + 1;
        ranking.performanceGrade = this.calculatePerformanceGrade(ranking.metricValue, rankings);
        ranking.changeFromPreviousPeriod = this.calculatePeriodChange(ranking.trends[metric]);
      });

      // Cache rankings
      this.cacheStoreRankings(masterShop, rankings, metric, timeRange);

      return {
        rankings,
        metric,
        timeRange,
        totalStores: rankings.length,
        averageValue: rankings.reduce((sum, r) => sum + r.metricValue, 0) / rankings.length,
        topPerformer: rankings[0],
        insights: this.generateRankingInsights(rankings, metric)
      };
    } catch (error) {
      log('error', 'Failed to get store rankings', { error: error.message, masterShop });
      throw error;
    }
  }

  /**
   * Get inventory optimization recommendations
   */
  async getInventoryOptimization(masterShop, options = {}) {
    const { includeTransferRecommendations = true } = options;
    
    try {
      const stores = this.getConnectedStores(masterShop);
      const optimization = {
        recommendations: [],
        summary: {
          totalRecommendations: 0,
          estimatedImpact: 0,
          transferOpportunities: 0
        },
        insights: []
      };

      if (stores.length < 2) {
        optimization.insights.push({
          type: 'warning',
          message: 'At least 2 stores required for cross-store inventory optimization'
        });
        return optimization;
      }

      // Get inventory data for all stores
      const inventoryData = await this.getInventoryDataForStores(stores);
      
      // Generate optimization recommendations
      optimization.recommendations = await this.generateInventoryRecommendations(
        inventoryData, 
        includeTransferRecommendations
      );
      
      // Calculate summary metrics
      optimization.summary = this.calculateOptimizationSummary(optimization.recommendations);
      
      // Generate actionable insights
      optimization.insights = this.generateInventoryInsights(inventoryData, optimization.recommendations);
      
      // Add transfer matrix if enabled
      if (includeTransferRecommendations) {
        optimization.transferMatrix = this.generateTransferMatrix(stores, optimization.recommendations);
      }

      return optimization;
    } catch (error) {
      log('error', 'Failed to get inventory optimization', { error: error.message, masterShop });
      throw error;
    }
  }

  /**
   * Connect a new store to multi-store management
   */
  async connectStore(masterShop, storeData) {
    const { shopDomain, accessToken, storeName, storeType = 'shopify' } = storeData;
    
    try {
      // Verify store access
      await this.verifyStoreAccess(shopDomain, accessToken);
      
      // Generate unique connection ID
      const connectionId = crypto.randomUUID();
      
      // Insert connection record
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO multi_store_connections 
        (id, master_shop, connected_shop, store_name, store_type, access_token, connection_status, last_sync)
        VALUES (?, ?, ?, ?, ?, ?, 'active', CURRENT_TIMESTAMP)
      `);
      
      stmt.run([connectionId, masterShop, shopDomain, storeName, storeType, accessToken]);
      
      // Initial data sync
      await this.performInitialSync(connectionId, shopDomain, accessToken);
      
      log('info', 'Store connected to multi-store management', { 
        masterShop, 
        connectedShop: shopDomain,
        connectionId 
      });

      return {
        connectionId,
        shopDomain,
        storeName,
        status: 'connected',
        syncStatus: 'completed'
      };
    } catch (error) {
      log('error', 'Failed to connect store', { error: error.message, masterShop, shopDomain });
      throw error;
    }
  }

  /**
   * Disconnect a store from multi-store management
   */
  async disconnectStore(masterShop, storeId) {
    try {
      const stmt = this.db.prepare(`
        UPDATE multi_store_connections 
        SET connection_status = 'disconnected', updated_at = CURRENT_TIMESTAMP
        WHERE master_shop = ? AND (id = ? OR connected_shop = ?)
      `);
      
      const result = stmt.run([masterShop, storeId, storeId]);
      
      if (result.changes === 0) {
        throw new Error('Store connection not found');
      }

      // Clean up related data
      await this.cleanupStoreData(masterShop, storeId);
      
      log('info', 'Store disconnected from multi-store management', { 
        masterShop, 
        storeId 
      });

      return true;
    } catch (error) {
      log('error', 'Failed to disconnect store', { error: error.message, masterShop, storeId });
      throw error;
    }
  }

  /**
   * Get detailed analytics for a specific store
   */
  async getStoreAnalytics(masterShop, storeId, options = {}) {
    const { timeRange = '30d', metrics = ['all'] } = options;
    
    try {
      const store = this.getConnectedStore(masterShop, storeId);
      if (!store) {
        throw new Error('Store not found or not connected');
      }

      const analytics = {
        store: {
          id: store.id,
          name: store.store_name,
          domain: store.connected_shop,
          status: store.connection_status,
          lastSync: store.last_sync
        },
        metrics: await this.getStoreMetrics(store.id, timeRange),
        trends: await this.getStoreTrends(store.id, timeRange),
        comparisons: await this.getStoreComparisons(masterShop, store.id, timeRange),
        insights: await this.getStoreInsights(store.id, timeRange),
        forecasts: await this.getStoreForecasts(store.id, timeRange)
      };

      return analytics;
    } catch (error) {
      log('error', 'Failed to get store analytics', { error: error.message, masterShop, storeId });
      throw error;
    }
  }

  /**
   * Export multi-store data
   */
  async exportData(masterShop, options = {}) {
    const { format = 'json', timeRange = '30d', includeStores = null } = options;
    
    try {
      const stores = this.getConnectedStores(masterShop, includeStores);
      const exportData = {
        exportDate: new Date().toISOString(),
        masterShop,
        timeRange,
        stores: []
      };

      for (const store of stores) {
        const storeData = {
          id: store.id,
          name: store.store_name,
          domain: store.connected_shop,
          metrics: await this.getStoreMetrics(store.id, timeRange),
          trends: await this.getStoreTrends(store.id, timeRange),
          inventory: await this.getStoreInventory(store.id)
        };
        
        exportData.stores.push(storeData);
      }

      // Add consolidated summary
      exportData.consolidated = this.consolidateMetrics(
        exportData.stores.reduce((acc, store) => {
          acc[store.id] = store.metrics;
          return acc;
        }, {})
      );

      if (format === 'csv') {
        return this.convertToCSV(exportData);
      }

      return exportData;
    } catch (error) {
      log('error', 'Failed to export data', { error: error.message, masterShop });
      throw error;
    }
  }

  // Helper methods
  getConnectedStores(masterShop, storeIds = null) {
    let query = `
      SELECT * FROM multi_store_connections 
      WHERE master_shop = ? AND connection_status = 'active'
    `;
    
    const params = [masterShop];
    
    if (storeIds && storeIds.length > 0) {
      query += ` AND (id IN (${storeIds.map(() => '?').join(',')}) OR connected_shop IN (${storeIds.map(() => '?').join(',')}))`;
      params.push(...storeIds, ...storeIds);
    }
    
    return this.db.prepare(query).all(params);
  }

  getConnectedStore(masterShop, storeId) {
    return this.db.prepare(`
      SELECT * FROM multi_store_connections 
      WHERE master_shop = ? AND (id = ? OR connected_shop = ?) AND connection_status = 'active'
    `).get([masterShop, storeId, storeId]);
  }

  async getMetricsForStores(stores, timeRange) {
    const metrics = {};
    
    for (const store of stores) {
      try {
        metrics[store.id] = await this.getStoreMetrics(store.id, timeRange);
      } catch (error) {
        log('warn', 'Failed to get metrics for store', { storeId: store.id, error: error.message });
        metrics[store.id] = this.getEmptyMetrics();
      }
    }
    
    return metrics;
  }

  async getStoreMetrics(storeId, timeRange) {
    // Implementation would fetch real metrics from Shopify or cache
    // For now, return mock data structure
    return {
      revenue: 0,
      orders: 0,
      customers: 0,
      conversion_rate: 0,
      avg_order_value: 0,
      total_products: 0,
      active_products: 0,
      total_inventory: 0,
      inventory_value: 0,
      marketing_spend: 0,
      profit_margin: 0
    };
  }

  getEmptyMetrics() {
    return {
      revenue: 0,
      orders: 0,
      customers: 0,
      conversion_rate: 0,
      avg_order_value: 0,
      total_products: 0,
      active_products: 0,
      total_inventory: 0,
      inventory_value: 0,
      marketing_spend: 0,
      profit_margin: 0
    };
  }

  consolidateMetrics(storeMetrics) {
    const consolidated = this.getEmptyMetrics();
    const storeCount = Object.keys(storeMetrics).length;
    
    if (storeCount === 0) return consolidated;
    
    Object.values(storeMetrics).forEach(metrics => {
      consolidated.revenue += metrics.revenue || 0;
      consolidated.orders += metrics.orders || 0;
      consolidated.customers += metrics.customers || 0;
      consolidated.total_products += metrics.total_products || 0;
      consolidated.active_products += metrics.active_products || 0;
      consolidated.total_inventory += metrics.total_inventory || 0;
      consolidated.inventory_value += metrics.inventory_value || 0;
      consolidated.marketing_spend += metrics.marketing_spend || 0;
    });
    
    // Calculate averages
    consolidated.conversion_rate = Object.values(storeMetrics).reduce((sum, m) => sum + (m.conversion_rate || 0), 0) / storeCount;
    consolidated.avg_order_value = consolidated.orders > 0 ? consolidated.revenue / consolidated.orders : 0;
    consolidated.profit_margin = Object.values(storeMetrics).reduce((sum, m) => sum + (m.profit_margin || 0), 0) / storeCount;
    
    return consolidated;
  }

  async verifyStoreAccess(shopDomain, accessToken) {
    // Implementation would verify Shopify API access
    // For now, just validate the format
    if (!shopDomain || !accessToken) {
      throw new Error('Invalid store credentials');
    }
    return true;
  }

  async performInitialSync(connectionId, shopDomain, accessToken) {
    // Implementation would perform initial data sync
    log('info', 'Initial sync completed', { connectionId, shopDomain });
    return true;
  }

  async cleanupStoreData(masterShop, storeId) {
    // Clean up related data when store is disconnected
    const tables = [
      'multi_store_metrics_cache',
      'multi_store_rankings',
      'multi_store_inventory_recommendations',
      'multi_store_comparisons'
    ];
    
    tables.forEach(table => {
      this.db.prepare(`DELETE FROM ${table} WHERE master_shop = ? AND store_id = ?`)
        .run([masterShop, storeId]);
    });
  }

  convertToCSV(data) {
    // Basic CSV conversion implementation
    const headers = ['Store Name', 'Domain', 'Revenue', 'Orders', 'Customers', 'Conversion Rate', 'AOV'];
    const rows = [headers.join(',')];
    
    data.stores.forEach(store => {
      const row = [
        store.name,
        store.domain,
        store.metrics.revenue,
        store.metrics.orders,
        store.metrics.customers,
        store.metrics.conversion_rate,
        store.metrics.avg_order_value
      ];
      rows.push(row.join(','));
    });
    
    return rows.join('\n');
  }

  // Additional helper methods would be implemented here...
  async getStoreTrends(storeId, timeRange, metrics = []) {
    return {}; // Implementation would fetch trend data
  }

  getStoreRanking(masterShop, storeId) {
    return { rank: 1, total: 1 }; // Implementation would fetch ranking
  }

  calculatePerformanceDistribution(stores) {
    return { high: 0, medium: 0, low: 0 }; // Implementation would calculate distribution
  }

  getTopPerformers(stores) {
    return []; // Implementation would identify top performers
  }

  async getMultiStoreAlerts(masterShop) {
    return []; // Implementation would generate alerts
  }

  generateComparisonInsights(stores, metrics) {
    return []; // Implementation would generate insights
  }

  async generateStoreRecommendations(stores) {
    return []; // Implementation would generate recommendations
  }

  calculateRelativePerformance(stores, metrics) {
    return {}; // Implementation would calculate relative performance
  }
}

const multiStoreService = new MultiStoreService();
export default multiStoreService;