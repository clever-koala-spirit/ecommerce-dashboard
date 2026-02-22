/**
 * Multi-Touch Attribution Engine
 * Competitor-beating attribution analytics with AI-powered modeling
 */

import { getDB } from '../db/database.js';
import { log } from '../utils/logger.js';

class AttributionEngine {
  constructor() {
    this.models = {
      LINEAR: 'linear',
      TIME_DECAY: 'time_decay', 
      POSITION: 'position',
      AI_ENHANCED: 'ai_enhanced',
      SHAPLEY: 'shapley'
    };
  }

  /**
   * Initialize attribution tables
   */
  initializeTables() {
    const db = getDB();
    
    // Customer touchpoints tracking
    db.run(`
      CREATE TABLE IF NOT EXISTS customer_touchpoints (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        shop_domain TEXT NOT NULL,
        customer_id TEXT,
        session_id TEXT NOT NULL,
        timestamp DATETIME NOT NULL,
        channel TEXT NOT NULL,
        campaign TEXT,
        source TEXT,
        medium TEXT,
        content TEXT,
        term TEXT,
        platform TEXT,
        device_type TEXT,
        page_url TEXT,
        referrer TEXT,
        utm_params TEXT,
        conversion_value REAL DEFAULT 0,
        conversion_type TEXT,
        order_id TEXT,
        product_ids TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Attribution models and weights
    db.run(`
      CREATE TABLE IF NOT EXISTS attribution_models (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        shop_domain TEXT NOT NULL,
        model_name TEXT NOT NULL,
        model_type TEXT NOT NULL,
        parameters TEXT,
        is_active BOOLEAN DEFAULT 1,
        accuracy_score REAL,
        last_trained_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(shop_domain, model_name)
      );
    `);

    // Attribution results cache
    db.run(`
      CREATE TABLE IF NOT EXISTS attribution_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        shop_domain TEXT NOT NULL,
        order_id TEXT NOT NULL,
        model_type TEXT NOT NULL,
        channel_attribution TEXT,
        total_revenue REAL NOT NULL,
        attribution_date DATE NOT NULL,
        customer_journey TEXT,
        touchpoint_count INTEGER,
        conversion_time_hours REAL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(shop_domain, order_id, model_type)
      );
    `);

    // Create indexes for better performance
    db.run(`CREATE INDEX IF NOT EXISTS idx_touchpoints_shop_customer_time ON customer_touchpoints(shop_domain, customer_id, timestamp)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_touchpoints_shop_session ON customer_touchpoints(shop_domain, session_id)`); 
    db.run(`CREATE INDEX IF NOT EXISTS idx_touchpoints_conversion_type ON customer_touchpoints(conversion_type)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_attribution_shop_date ON attribution_results(shop_domain, attribution_date)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_attribution_order ON attribution_results(order_id)`);

    log.info('Attribution engine tables initialized');
  }

  /**
   * Track a customer touchpoint
   */
  async trackTouchpoint(shopDomain, touchpointData) {
    const db = getDB();
    
    const {
      customerId,
      sessionId,
      channel,
      campaign,
      source,
      medium,
      content,
      term,
      platform,
      deviceType,
      pageUrl,
      referrer,
      utmParams,
      conversionValue = 0,
      conversionType,
      orderId,
      productIds
    } = touchpointData;

    const stmt = db.prepare(`
      INSERT INTO customer_touchpoints (
        shop_domain, customer_id, session_id, timestamp, channel, campaign,
        source, medium, content, term, platform, device_type, page_url,
        referrer, utm_params, conversion_value, conversion_type, order_id, product_ids
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    try {
      stmt.run([
        shopDomain, customerId, sessionId, new Date().toISOString(),
        channel, campaign, source, medium, content, term, platform,
        deviceType, pageUrl, referrer, JSON.stringify(utmParams || {}),
        conversionValue, conversionType, orderId, JSON.stringify(productIds || [])
      ]);
      
      // Trigger real-time attribution analysis if this is a conversion
      if (conversionValue > 0 && orderId) {
        await this.processAttribution(shopDomain, orderId);
      }
      
      return { success: true };
    } catch (error) {
      log.error('Failed to track touchpoint', error);
      throw error;
    }
  }

  /**
   * Process attribution for a specific order
   */
  async processAttribution(shopDomain, orderId) {
    const db = getDB();
    
    // Get all touchpoints for this conversion
    const touchpoints = db.prepare(`
      SELECT * FROM customer_touchpoints 
      WHERE shop_domain = ? AND order_id = ?
      ORDER BY timestamp ASC
    `).all([shopDomain, orderId]);

    if (touchpoints.length === 0) return;

    const orderRevenue = touchpoints[0].conversion_value;
    
    // Apply multiple attribution models
    const models = [
      this.models.LINEAR,
      this.models.TIME_DECAY,
      this.models.POSITION,
      this.models.AI_ENHANCED
    ];

    for (const modelType of models) {
      const attribution = await this.calculateAttribution(touchpoints, modelType, orderRevenue);
      await this.saveAttributionResult(shopDomain, orderId, modelType, attribution, touchpoints);
    }
  }

  /**
   * Calculate attribution using specified model
   */
  async calculateAttribution(touchpoints, modelType, totalRevenue) {
    const channelAttribution = {};
    
    switch (modelType) {
      case this.models.LINEAR:
        return this.calculateLinearAttribution(touchpoints, totalRevenue);
        
      case this.models.TIME_DECAY:
        return this.calculateTimeDecayAttribution(touchpoints, totalRevenue);
        
      case this.models.POSITION:
        return this.calculatePositionBasedAttribution(touchpoints, totalRevenue);
        
      case this.models.AI_ENHANCED:
        return this.calculateAIEnhancedAttribution(touchpoints, totalRevenue);
        
      case this.models.SHAPLEY:
        return this.calculateShapleyAttribution(touchpoints, totalRevenue);
        
      default:
        return this.calculateLinearAttribution(touchpoints, totalRevenue);
    }
  }

  /**
   * Linear attribution - equal weight to all touchpoints
   */
  calculateLinearAttribution(touchpoints, totalRevenue) {
    const attribution = {};
    const weight = 1 / touchpoints.length;
    
    touchpoints.forEach(tp => {
      const channel = tp.channel;
      if (!attribution[channel]) {
        attribution[channel] = { revenue: 0, touchpoints: 0, weight: 0 };
      }
      attribution[channel].revenue += totalRevenue * weight;
      attribution[channel].touchpoints += 1;
      attribution[channel].weight += weight;
    });
    
    return attribution;
  }

  /**
   * Time-decay attribution - more recent touchpoints get higher weight
   */
  calculateTimeDecayAttribution(touchpoints, totalRevenue) {
    const attribution = {};
    const decayRate = 0.7; // 30% decay per step back
    
    // Calculate weights with time decay
    let totalWeight = 0;
    const weights = touchpoints.map((tp, index) => {
      const stepsFromEnd = touchpoints.length - 1 - index;
      const weight = Math.pow(decayRate, stepsFromEnd);
      totalWeight += weight;
      return { ...tp, weight };
    });
    
    // Normalize weights and calculate attribution
    weights.forEach(tp => {
      const normalizedWeight = tp.weight / totalWeight;
      const channel = tp.channel;
      
      if (!attribution[channel]) {
        attribution[channel] = { revenue: 0, touchpoints: 0, weight: 0 };
      }
      attribution[channel].revenue += totalRevenue * normalizedWeight;
      attribution[channel].touchpoints += 1;
      attribution[channel].weight += normalizedWeight;
    });
    
    return attribution;
  }

  /**
   * Position-based attribution - 40% first, 40% last, 20% middle
   */
  calculatePositionBasedAttribution(touchpoints, totalRevenue) {
    const attribution = {};
    
    if (touchpoints.length === 1) {
      // Single touchpoint gets 100%
      const channel = touchpoints[0].channel;
      attribution[channel] = { revenue: totalRevenue, touchpoints: 1, weight: 1.0 };
    } else if (touchpoints.length === 2) {
      // First and last get 50% each
      [touchpoints[0], touchpoints[touchpoints.length - 1]].forEach(tp => {
        const channel = tp.channel;
        if (!attribution[channel]) {
          attribution[channel] = { revenue: 0, touchpoints: 0, weight: 0 };
        }
        attribution[channel].revenue += totalRevenue * 0.5;
        attribution[channel].touchpoints += 1;
        attribution[channel].weight += 0.5;
      });
    } else {
      // First: 40%, Last: 40%, Middle: 20% split equally
      const middleWeight = 0.2 / (touchpoints.length - 2);
      
      touchpoints.forEach((tp, index) => {
        let weight;
        if (index === 0) weight = 0.4; // First
        else if (index === touchpoints.length - 1) weight = 0.4; // Last  
        else weight = middleWeight; // Middle
        
        const channel = tp.channel;
        if (!attribution[channel]) {
          attribution[channel] = { revenue: 0, touchpoints: 0, weight: 0 };
        }
        attribution[channel].revenue += totalRevenue * weight;
        attribution[channel].touchpoints += 1;
        attribution[channel].weight += weight;
      });
    }
    
    return attribution;
  }

  /**
   * AI-Enhanced attribution using machine learning patterns
   */
  async calculateAIEnhancedAttribution(touchpoints, totalRevenue) {
    // This would integrate with your ML model
    // For now, implement a smart heuristic-based approach
    
    const attribution = {};
    const channelWeights = {
      'organic_search': 1.2,
      'paid_search': 1.1, 
      'social_paid': 1.0,
      'email': 0.9,
      'direct': 0.8,
      'referral': 0.7,
      'display': 0.6
    };
    
    // Calculate smart weights based on channel performance and position
    let totalWeight = 0;
    const smartWeights = touchpoints.map((tp, index) => {
      const channelWeight = channelWeights[tp.channel] || 1.0;
      const positionMultiplier = index === 0 ? 1.3 : 
                                index === touchpoints.length - 1 ? 1.4 : 1.0;
      const timeDecay = Math.pow(0.8, touchpoints.length - 1 - index);
      
      const weight = channelWeight * positionMultiplier * timeDecay;
      totalWeight += weight;
      return { ...tp, weight };
    });
    
    // Normalize and calculate attribution
    smartWeights.forEach(tp => {
      const normalizedWeight = tp.weight / totalWeight;
      const channel = tp.channel;
      
      if (!attribution[channel]) {
        attribution[channel] = { revenue: 0, touchpoints: 0, weight: 0 };
      }
      attribution[channel].revenue += totalRevenue * normalizedWeight;
      attribution[channel].touchpoints += 1;
      attribution[channel].weight += normalizedWeight;
    });
    
    return attribution;
  }

  /**
   * Shapley value attribution (game theory based)
   */
  calculateShapleyAttribution(touchpoints, totalRevenue) {
    // Simplified Shapley value calculation
    const attribution = {};
    const channels = [...new Set(touchpoints.map(tp => tp.channel))];
    
    // For each channel, calculate its marginal contribution
    channels.forEach(channel => {
      let shapleyValue = 0;
      const channelTouchpoints = touchpoints.filter(tp => tp.channel === channel);
      
      // Simplified: weight by unique contribution and frequency
      const uniqueness = 1 / channels.length;
      const frequency = channelTouchpoints.length / touchpoints.length;
      const positioning = this.calculatePositionalValue(touchpoints, channel);
      
      shapleyValue = uniqueness * 0.4 + frequency * 0.3 + positioning * 0.3;
      
      attribution[channel] = {
        revenue: totalRevenue * shapleyValue,
        touchpoints: channelTouchpoints.length,
        weight: shapleyValue
      };
    });
    
    return attribution;
  }

  calculatePositionalValue(touchpoints, channel) {
    const positions = touchpoints
      .map((tp, index) => tp.channel === channel ? index : -1)
      .filter(pos => pos !== -1);
    
    if (positions.length === 0) return 0;
    
    // Higher value for first and last positions
    const positionValues = positions.map(pos => {
      if (pos === 0) return 0.4; // First
      if (pos === touchpoints.length - 1) return 0.4; // Last
      return 0.2 / Math.max(1, touchpoints.length - 2); // Middle
    });
    
    return positionValues.reduce((sum, val) => sum + val, 0);
  }

  /**
   * Save attribution results to database
   */
  async saveAttributionResult(shopDomain, orderId, modelType, attribution, touchpoints) {
    const db = getDB();
    
    const customerJourney = touchpoints.map(tp => ({
      timestamp: tp.timestamp,
      channel: tp.channel,
      source: tp.source,
      campaign: tp.campaign
    }));
    
    const conversionTimeHours = touchpoints.length > 1 
      ? (new Date(touchpoints[touchpoints.length - 1].timestamp) - 
         new Date(touchpoints[0].timestamp)) / (1000 * 60 * 60)
      : 0;
    
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO attribution_results (
        shop_domain, order_id, model_type, channel_attribution, total_revenue,
        attribution_date, customer_journey, touchpoint_count, conversion_time_hours
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run([
      shopDomain, orderId, modelType, JSON.stringify(attribution),
      touchpoints[0].conversion_value, new Date().toISOString().split('T')[0],
      JSON.stringify(customerJourney), touchpoints.length, conversionTimeHours
    ]);
  }

  /**
   * Get attribution analytics for a shop
   */
  async getAttributionAnalytics(shopDomain, options = {}) {
    const db = getDB();
    const { 
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate = new Date().toISOString().split('T')[0],
      modelType = this.models.AI_ENHANCED
    } = options;
    
    // Channel performance by attribution model
    const channelPerformance = db.prepare(`
      SELECT 
        model_type,
        json_extract(channel_attribution, '$') as attribution_data,
        COUNT(*) as order_count,
        SUM(total_revenue) as total_revenue,
        AVG(touchpoint_count) as avg_touchpoints,
        AVG(conversion_time_hours) as avg_conversion_time
      FROM attribution_results 
      WHERE shop_domain = ? 
        AND attribution_date BETWEEN ? AND ?
        AND model_type = ?
      GROUP BY model_type
    `).all([shopDomain, startDate, endDate, modelType]);
    
    // Process attribution data
    const analytics = this.processAttributionAnalytics(channelPerformance);
    
    return {
      timeframe: { startDate, endDate },
      model: modelType,
      analytics,
      summary: {
        totalOrders: analytics.reduce((sum, ch) => sum + ch.orderCount, 0),
        totalRevenue: analytics.reduce((sum, ch) => sum + ch.revenue, 0),
        averageTouchpoints: analytics.reduce((sum, ch) => sum + ch.avgTouchpoints, 0) / Math.max(1, analytics.length),
        averageConversionTime: analytics.reduce((sum, ch) => sum + ch.avgConversionTime, 0) / Math.max(1, analytics.length)
      }
    };
  }

  processAttributionAnalytics(rawData) {
    const channelMap = {};
    
    rawData.forEach(row => {
      try {
        const attribution = JSON.parse(row.attribution_data);
        Object.keys(attribution).forEach(channel => {
          if (!channelMap[channel]) {
            channelMap[channel] = {
              channel,
              revenue: 0,
              orderCount: 0,
              avgTouchpoints: 0,
              avgConversionTime: 0
            };
          }
          
          const channelData = attribution[channel];
          channelMap[channel].revenue += channelData.revenue;
          channelMap[channel].orderCount += channelData.touchpoints;
          channelMap[channel].avgTouchpoints = row.avg_touchpoints;
          channelMap[channel].avgConversionTime = row.avg_conversion_time;
        });
      } catch (error) {
        log.error('Error processing attribution data', error);
      }
    });
    
    return Object.values(channelMap)
      .sort((a, b) => b.revenue - a.revenue);
  }
}

export default new AttributionEngine();