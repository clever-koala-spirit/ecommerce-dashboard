/**
 * Advanced Data Processing Pipeline
 * Competitor-beating data processing with real-time ETL
 */

import { getDB } from '../db/database.js';
import { log } from '../utils/logger.js';
import attributionEngine from './attributionEngine.js';
import realTimePL from './realTimePL.js';
import customerJourney from './customerJourney.js';
import revenueAnalytics from './revenueAnalytics.js';

class DataProcessor {
  constructor() {
    this.processingQueues = {
      HIGH_PRIORITY: 'high_priority',
      NORMAL_PRIORITY: 'normal_priority',
      LOW_PRIORITY: 'low_priority'
    };
    
    this.dataTypes = {
      ORDER: 'order',
      CUSTOMER: 'customer',
      PRODUCT: 'product',
      MARKETING: 'marketing',
      INTERACTION: 'interaction'
    };
    
    this.processingStatus = {
      PENDING: 'pending',
      PROCESSING: 'processing',
      COMPLETED: 'completed',
      FAILED: 'failed',
      RETRYING: 'retrying'
    };

    this.isProcessing = false;
    this.processingInterval = null;
  }

  /**
   * Initialize data processing tables
   */
  initializeTables() {
    const db = getDB();
    
    // Processing queue for all data
    db.run(`
      CREATE TABLE IF NOT EXISTS data_processing_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        shop_domain TEXT NOT NULL,
        data_type TEXT NOT NULL,
        priority TEXT NOT NULL,
        data_payload TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        retry_count INTEGER DEFAULT 0,
        max_retries INTEGER DEFAULT 3,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        processed_at TIMESTAMP,
        INDEX(shop_domain, status, priority),
        INDEX(created_at)
      );
    `);

    // Processing metrics and performance
    db.run(`
      CREATE TABLE IF NOT EXISTS processing_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        shop_domain TEXT NOT NULL,
        date DATE NOT NULL,
        data_type TEXT NOT NULL,
        records_processed INTEGER NOT NULL,
        avg_processing_time_ms REAL NOT NULL,
        success_rate REAL NOT NULL,
        error_count INTEGER NOT NULL,
        throughput_per_hour REAL NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX(shop_domain, date),
        UNIQUE(shop_domain, date, data_type)
      );
    `);

    // Data quality metrics
    db.run(`
      CREATE TABLE IF NOT EXISTS data_quality_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        shop_domain TEXT NOT NULL,
        data_source TEXT NOT NULL,
        date DATE NOT NULL,
        completeness_score REAL NOT NULL,
        accuracy_score REAL NOT NULL,
        consistency_score REAL NOT NULL,
        timeliness_score REAL NOT NULL,
        validity_score REAL NOT NULL,
        overall_quality_score REAL NOT NULL,
        records_analyzed INTEGER NOT NULL,
        anomalies_detected INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX(shop_domain, date),
        UNIQUE(shop_domain, data_source, date)
      );
    `);

    // Real-time data synchronization status
    db.run(`
      CREATE TABLE IF NOT EXISTS sync_status (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        shop_domain TEXT NOT NULL,
        data_source TEXT NOT NULL,
        last_sync_timestamp DATETIME NOT NULL,
        sync_status TEXT NOT NULL,
        records_synced INTEGER DEFAULT 0,
        sync_duration_ms INTEGER,
        next_sync_due DATETIME,
        sync_frequency_minutes INTEGER DEFAULT 60,
        is_real_time BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX(shop_domain, data_source),
        UNIQUE(shop_domain, data_source)
      );
    `);

    log.info('Data processing pipeline tables initialized');
  }

  /**
   * Start the processing pipeline
   */
  startProcessing() {
    if (this.isProcessing) {
      log.warn('Data processing pipeline already running');
      return;
    }

    this.isProcessing = true;
    log.info('Starting data processing pipeline');

    // Process queue every 10 seconds
    this.processingInterval = setInterval(() => {
      this.processQueue().catch(error => {
        log.error('Queue processing error', error);
      });
    }, 10000);

    // Update metrics every minute
    setInterval(() => {
      this.updateProcessingMetrics().catch(error => {
        log.error('Metrics update error', error);
      });
    }, 60000);

    // Data quality analysis every hour
    setInterval(() => {
      this.analyzeDataQuality().catch(error => {
        log.error('Data quality analysis error', error);
      });
    }, 3600000);
  }

  /**
   * Stop the processing pipeline
   */
  stopProcessing() {
    if (!this.isProcessing) return;

    this.isProcessing = false;
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    log.info('Data processing pipeline stopped');
  }

  /**
   * Queue data for processing
   */
  async queueData(shopDomain, dataType, data, priority = this.processingQueues.NORMAL_PRIORITY) {
    const db = getDB();
    
    try {
      const stmt = db.prepare(`
        INSERT INTO data_processing_queue (
          shop_domain, data_type, priority, data_payload
        ) VALUES (?, ?, ?, ?)
      `);
      
      const result = stmt.run([
        shopDomain,
        dataType,
        priority,
        JSON.stringify(data)
      ]);

      log.info('Data queued for processing', { 
        id: result.lastInsertRowid,
        shopDomain, 
        dataType, 
        priority 
      });

      return { success: true, queueId: result.lastInsertRowid };
    } catch (error) {
      log.error('Failed to queue data', error);
      throw error;
    }
  }

  /**
   * Process the queue
   */
  async processQueue() {
    const db = getDB();
    
    // Get pending items ordered by priority and creation time
    const pendingItems = db.prepare(`
      SELECT * FROM data_processing_queue 
      WHERE status IN ('pending', 'retrying')
        AND retry_count < max_retries
      ORDER BY 
        CASE priority 
          WHEN 'high_priority' THEN 1 
          WHEN 'normal_priority' THEN 2 
          WHEN 'low_priority' THEN 3 
        END,
        created_at ASC
      LIMIT 50
    `).all();

    if (pendingItems.length === 0) return;

    log.info(`Processing ${pendingItems.length} queued items`);

    for (const item of pendingItems) {
      await this.processQueueItem(item);
    }
  }

  /**
   * Process individual queue item
   */
  async processQueueItem(item) {
    const db = getDB();
    const startTime = Date.now();

    try {
      // Mark as processing
      db.prepare(`
        UPDATE data_processing_queue 
        SET status = 'processing' 
        WHERE id = ?
      `).run([item.id]);

      const data = JSON.parse(item.data_payload);
      let result;

      // Process based on data type
      switch (item.data_type) {
        case this.dataTypes.ORDER:
          result = await this.processOrderData(item.shop_domain, data);
          break;
        case this.dataTypes.CUSTOMER:
          result = await this.processCustomerData(item.shop_domain, data);
          break;
        case this.dataTypes.PRODUCT:
          result = await this.processProductData(item.shop_domain, data);
          break;
        case this.dataTypes.MARKETING:
          result = await this.processMarketingData(item.shop_domain, data);
          break;
        case this.dataTypes.INTERACTION:
          result = await this.processInteractionData(item.shop_domain, data);
          break;
        default:
          throw new Error(`Unknown data type: ${item.data_type}`);
      }

      // Mark as completed
      db.prepare(`
        UPDATE data_processing_queue 
        SET status = 'completed', processed_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run([item.id]);

      const processingTime = Date.now() - startTime;
      log.info(`Successfully processed queue item ${item.id}`, { 
        dataType: item.data_type,
        processingTime,
        result 
      });

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      // Increment retry count
      const newRetryCount = item.retry_count + 1;
      const status = newRetryCount >= item.max_retries ? 'failed' : 'retrying';
      
      db.prepare(`
        UPDATE data_processing_queue 
        SET status = ?, retry_count = ?, error_message = ?
        WHERE id = ?
      `).run([status, newRetryCount, error.message, item.id]);

      log.error(`Failed to process queue item ${item.id}`, error, {
        dataType: item.data_type,
        retryCount: newRetryCount,
        processingTime
      });
    }
  }

  /**
   * Process order data through all systems
   */
  async processOrderData(shopDomain, orderData) {
    const results = {};

    try {
      // Process through P&L system
      results.pl = await realTimePL.processOrderPL(shopDomain, orderData);
      
      // Process through customer journey
      if (orderData.customerId) {
        results.journey = await customerJourney.processPurchase(shopDomain, {
          customerId: orderData.customerId,
          orderId: orderData.orderId,
          totalRevenue: orderData.totalRevenue,
          lineItems: orderData.lineItems
        });
      }

      // Attribution processing happens automatically in trackTouchpoint
      
      return results;
    } catch (error) {
      log.error('Order data processing error', error);
      throw error;
    }
  }

  /**
   * Process customer data
   */
  async processCustomerData(shopDomain, customerData) {
    try {
      // Update customer profile
      const db = getDB();
      
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO customer_profiles (
          shop_domain, customer_id, email, first_name, last_name, phone,
          first_seen_at, last_seen_at, total_orders, total_spent
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run([
        shopDomain,
        customerData.customerId,
        customerData.email,
        customerData.firstName,
        customerData.lastName,
        customerData.phone,
        customerData.firstSeenAt || new Date().toISOString(),
        customerData.lastSeenAt || new Date().toISOString(),
        customerData.totalOrders || 0,
        customerData.totalSpent || 0
      ]);

      return { success: true };
    } catch (error) {
      log.error('Customer data processing error', error);
      throw error;
    }
  }

  /**
   * Process product data
   */
  async processProductData(shopDomain, productData) {
    try {
      const db = getDB();
      
      // Update product costs if provided
      if (productData.costData) {
        await realTimePL.setProductCost(shopDomain, productData.productId, productData.costData);
      }

      // Update product revenue analytics
      if (productData.revenueData) {
        const stmt = db.prepare(`
          INSERT OR REPLACE INTO product_revenue_analytics (
            shop_domain, product_id, product_title, category, date,
            units_sold, revenue, net_revenue, avg_selling_price
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        stmt.run([
          shopDomain,
          productData.productId,
          productData.title,
          productData.category,
          new Date().toISOString().split('T')[0],
          productData.revenueData.unitsSold,
          productData.revenueData.revenue,
          productData.revenueData.revenue, // Assuming no refunds for now
          productData.revenueData.avgSellingPrice
        ]);
      }

      return { success: true };
    } catch (error) {
      log.error('Product data processing error', error);
      throw error;
    }
  }

  /**
   * Process marketing data
   */
  async processMarketingData(shopDomain, marketingData) {
    try {
      const db = getDB();
      
      // Store marketing campaign performance
      if (marketingData.campaignData) {
        const stmt = db.prepare(`
          INSERT OR REPLACE INTO campaign_pl (
            shop_domain, campaign_id, platform, campaign_name, date,
            ad_spend, revenue, orders, clicks, impressions
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        stmt.run([
          shopDomain,
          marketingData.campaignData.campaignId,
          marketingData.campaignData.platform,
          marketingData.campaignData.name,
          new Date().toISOString().split('T')[0],
          marketingData.campaignData.adSpend,
          marketingData.campaignData.revenue || 0,
          marketingData.campaignData.orders || 0,
          marketingData.campaignData.clicks || 0,
          marketingData.campaignData.impressions || 0
        ]);
      }

      return { success: true };
    } catch (error) {
      log.error('Marketing data processing error', error);
      throw error;
    }
  }

  /**
   * Process interaction data
   */
  async processInteractionData(shopDomain, interactionData) {
    try {
      // Process through customer journey tracking
      const result = await customerJourney.trackInteraction(shopDomain, interactionData);
      return result;
    } catch (error) {
      log.error('Interaction data processing error', error);
      throw error;
    }
  }

  /**
   * Update processing metrics
   */
  async updateProcessingMetrics() {
    const db = getDB();
    const today = new Date().toISOString().split('T')[0];

    // Get processing stats for each shop and data type
    const stats = db.prepare(`
      SELECT 
        shop_domain,
        data_type,
        COUNT(*) as total_processed,
        AVG(CASE WHEN processed_at IS NOT NULL 
            THEN julianday(processed_at) - julianday(created_at) 
            ELSE NULL END) * 86400000 as avg_processing_time_ms,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as success_rate,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as error_count
      FROM data_processing_queue
      WHERE DATE(created_at) = ?
      GROUP BY shop_domain, data_type
    `).all([today]);

    stats.forEach(stat => {
      const throughput = stat.total_processed / 24; // Per hour

      db.prepare(`
        INSERT OR REPLACE INTO processing_metrics (
          shop_domain, date, data_type, records_processed, 
          avg_processing_time_ms, success_rate, error_count, throughput_per_hour
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run([
        stat.shop_domain,
        today,
        stat.data_type,
        stat.total_processed,
        stat.avg_processing_time_ms || 0,
        stat.success_rate || 0,
        stat.error_count,
        throughput
      ]);
    });

    log.info('Processing metrics updated', { statsCount: stats.length });
  }

  /**
   * Analyze data quality
   */
  async analyzeDataQuality() {
    const db = getDB();
    const today = new Date().toISOString().split('T')[0];

    // Analyze different data sources
    const dataSources = ['shopify', 'google', 'facebook', 'klaviyo'];

    for (const source of dataSources) {
      const analysis = await this.analyzeSourceQuality(source, today);
      
      if (analysis.recordsAnalyzed > 0) {
        db.prepare(`
          INSERT OR REPLACE INTO data_quality_metrics (
            shop_domain, data_source, date, completeness_score, accuracy_score,
            consistency_score, timeliness_score, validity_score, 
            overall_quality_score, records_analyzed, anomalies_detected
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run([
          analysis.shopDomain,
          source,
          today,
          analysis.completeness,
          analysis.accuracy,
          analysis.consistency,
          analysis.timeliness,
          analysis.validity,
          analysis.overall,
          analysis.recordsAnalyzed,
          analysis.anomaliesDetected
        ]);
      }
    }

    log.info('Data quality analysis completed');
  }

  /**
   * Analyze quality for a specific data source
   */
  async analyzeSourceQuality(source, date) {
    const db = getDB();
    
    const records = db.prepare(`
      SELECT * FROM metric_snapshots 
      WHERE source = ? AND date = ?
      LIMIT 1000
    `).all([source, date]);

    if (records.length === 0) {
      return {
        shopDomain: 'global',
        recordsAnalyzed: 0,
        completeness: 0,
        accuracy: 0,
        consistency: 0,
        timeliness: 0,
        validity: 0,
        overall: 0,
        anomaliesDetected: 0
      };
    }

    // Analyze completeness (non-null values)
    const completeness = records.reduce((sum, record) => {
      const fields = [record.shop_domain, record.metric, record.value];
      const nonNullFields = fields.filter(field => field !== null && field !== undefined);
      return sum + (nonNullFields.length / fields.length);
    }, 0) / records.length * 100;

    // Analyze validity (reasonable values)
    let validRecords = 0;
    let anomalies = 0;
    
    records.forEach(record => {
      if (record.value >= 0 && record.value < 1000000) { // Basic sanity check
        validRecords++;
      } else {
        anomalies++;
      }
    });
    
    const validity = (validRecords / records.length) * 100;
    
    // Simple consistency check (variance not too high)
    const values = records.map(r => r.value).filter(v => v !== null);
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const consistencyScore = Math.max(0, 100 - (variance / mean * 10)); // Rough heuristic

    // Timeliness (data freshness)
    const now = new Date();
    const dataDate = new Date(date);
    const hoursDiff = (now - dataDate) / (1000 * 60 * 60);
    const timeliness = Math.max(0, 100 - hoursDiff * 2); // Penalty for older data

    const accuracy = 85; // Default accuracy score (would need ground truth for real analysis)
    const overall = (completeness + accuracy + consistencyScore + timeliness + validity) / 5;

    return {
      shopDomain: records[0]?.shop_domain || 'global',
      recordsAnalyzed: records.length,
      completeness,
      accuracy,
      consistency: consistencyScore,
      timeliness,
      validity,
      overall,
      anomaliesDetected: anomalies
    };
  }

  /**
   * Get processing status dashboard
   */
  async getProcessingStatus(shopDomain = null) {
    const db = getDB();
    
    const whereClause = shopDomain ? 'WHERE shop_domain = ?' : '';
    const params = shopDomain ? [shopDomain] : [];

    // Queue status
    const queueStatus = db.prepare(`
      SELECT 
        status,
        data_type,
        COUNT(*) as count,
        AVG(retry_count) as avg_retries
      FROM data_processing_queue 
      ${whereClause}
      GROUP BY status, data_type
    `).all(params);

    // Recent processing metrics
    const recentMetrics = db.prepare(`
      SELECT * FROM processing_metrics 
      ${whereClause}
      ORDER BY date DESC, throughput_per_hour DESC
      LIMIT 20
    `).all(params);

    // Data quality summary
    const qualityMetrics = db.prepare(`
      SELECT 
        data_source,
        AVG(overall_quality_score) as avg_quality,
        MAX(date) as latest_analysis
      FROM data_quality_metrics 
      ${whereClause}
      GROUP BY data_source
      ORDER BY avg_quality DESC
    `).all(params);

    return {
      isProcessing: this.isProcessing,
      queueStatus,
      recentMetrics,
      qualityMetrics,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Clean up old processed queue items
   */
  async cleanupQueue() {
    const db = getDB();
    
    // Remove completed items older than 7 days
    const result = db.prepare(`
      DELETE FROM data_processing_queue 
      WHERE status = 'completed' 
        AND created_at < datetime('now', '-7 days')
    `).run();

    log.info(`Cleaned up ${result.changes} old queue items`);
    return result.changes;
  }
}

export default new DataProcessor();