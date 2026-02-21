/**
 * Advanced Customer Journey Tracking
 * Competitor-beating customer analytics with behavioral insights
 */

import { getDB } from '../db/database.js';
import { log } from '../utils/logger.js';
import attributionEngine from './attributionEngine.js';

class CustomerJourney {
  constructor() {
    this.journeyStages = {
      AWARENESS: 'awareness',
      CONSIDERATION: 'consideration', 
      PURCHASE: 'purchase',
      RETENTION: 'retention',
      ADVOCACY: 'advocacy'
    };
    
    this.touchpointTypes = {
      AD_VIEW: 'ad_view',
      AD_CLICK: 'ad_click',
      WEBSITE_VISIT: 'website_visit',
      PRODUCT_VIEW: 'product_view',
      CART_ADD: 'cart_add',
      CART_ABANDON: 'cart_abandon',
      CHECKOUT_START: 'checkout_start',
      PURCHASE: 'purchase',
      EMAIL_OPEN: 'email_open',
      EMAIL_CLICK: 'email_click',
      SOCIAL_ENGAGEMENT: 'social_engagement',
      REVIEW_VIEW: 'review_view',
      SUPPORT_CONTACT: 'support_contact'
    };
    
    this.segments = {
      NEW_VISITOR: 'new_visitor',
      RETURNING_VISITOR: 'returning_visitor',
      FIRST_TIME_BUYER: 'first_time_buyer',
      REPEAT_CUSTOMER: 'repeat_customer',
      VIP_CUSTOMER: 'vip_customer',
      AT_RISK: 'at_risk',
      CHURNED: 'churned'
    };
  }

  /**
   * Initialize customer journey tables
   */
  initializeTables() {
    const db = getDB();
    
    // Customer profiles with journey data
    db.run(`
      CREATE TABLE IF NOT EXISTS customer_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        shop_domain TEXT NOT NULL,
        customer_id TEXT NOT NULL,
        email TEXT,
        first_name TEXT,
        last_name TEXT,
        phone TEXT,
        first_seen_at DATETIME NOT NULL,
        last_seen_at DATETIME NOT NULL,
        total_orders INTEGER DEFAULT 0,
        total_spent REAL DEFAULT 0,
        avg_order_value REAL DEFAULT 0,
        lifetime_value REAL DEFAULT 0,
        acquisition_channel TEXT,
        acquisition_campaign TEXT,
        acquisition_cost REAL,
        customer_segment TEXT,
        journey_stage TEXT,
        days_since_last_order INTEGER,
        predicted_ltv REAL,
        churn_probability REAL,
        engagement_score REAL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX(shop_domain, customer_id),
        INDEX(customer_segment),
        INDEX(journey_stage),
        UNIQUE(shop_domain, customer_id)
      );
    `);

    // Detailed customer interactions
    db.run(`
      CREATE TABLE IF NOT EXISTS customer_interactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        shop_domain TEXT NOT NULL,
        customer_id TEXT NOT NULL,
        session_id TEXT NOT NULL,
        interaction_type TEXT NOT NULL,
        page_url TEXT,
        product_id TEXT,
        campaign_id TEXT,
        channel TEXT,
        source TEXT,
        medium TEXT,
        device_type TEXT,
        browser TEXT,
        location_country TEXT,
        location_city TEXT,
        duration_seconds INTEGER,
        scroll_depth REAL,
        interaction_data TEXT,
        conversion_value REAL DEFAULT 0,
        timestamp DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX(shop_domain, customer_id, timestamp),
        INDEX(interaction_type),
        INDEX(session_id)
      );
    `);

    // Customer journey maps
    db.run(`
      CREATE TABLE IF NOT EXISTS customer_journey_maps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        shop_domain TEXT NOT NULL,
        customer_id TEXT NOT NULL,
        journey_id TEXT NOT NULL,
        journey_start DATETIME NOT NULL,
        journey_end DATETIME,
        total_touchpoints INTEGER NOT NULL,
        conversion_value REAL,
        journey_duration_hours REAL,
        channels_used TEXT,
        devices_used TEXT,
        pages_visited TEXT,
        products_viewed TEXT,
        journey_stage_progression TEXT,
        conversion_path TEXT,
        drop_off_points TEXT,
        is_converted BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX(shop_domain, customer_id),
        INDEX(journey_start),
        UNIQUE(shop_domain, journey_id)
      );
    `);

    // Behavioral segments
    db.run(`
      CREATE TABLE IF NOT EXISTS behavioral_segments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        shop_domain TEXT NOT NULL,
        segment_name TEXT NOT NULL,
        segment_type TEXT NOT NULL,
        criteria TEXT NOT NULL,
        customer_count INTEGER DEFAULT 0,
        avg_ltv REAL,
        avg_order_frequency REAL,
        conversion_rate REAL,
        is_active BOOLEAN DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(shop_domain, segment_name)
      );
    `);

    // Journey analytics cache
    db.run(`
      CREATE TABLE IF NOT EXISTS journey_analytics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        shop_domain TEXT NOT NULL,
        date DATE NOT NULL,
        metric_name TEXT NOT NULL,
        segment TEXT,
        value REAL NOT NULL,
        metadata TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX(shop_domain, date),
        INDEX(metric_name),
        UNIQUE(shop_domain, date, metric_name, segment)
      );
    `);

    log.info('Customer journey tables initialized');
  }

  /**
   * Track customer interaction
   */
  async trackInteraction(shopDomain, interactionData) {
    const db = getDB();
    
    try {
      const {
        customerId,
        sessionId,
        interactionType,
        pageUrl,
        productId,
        campaignId,
        channel,
        source,
        medium,
        deviceType,
        browser,
        locationCountry,
        locationCity,
        durationSeconds = 0,
        scrollDepth = 0,
        metadata = {},
        conversionValue = 0
      } = interactionData;

      // Track the interaction
      const stmt = db.prepare(`
        INSERT INTO customer_interactions (
          shop_domain, customer_id, session_id, interaction_type, page_url,
          product_id, campaign_id, channel, source, medium, device_type,
          browser, location_country, location_city, duration_seconds,
          scroll_depth, interaction_data, conversion_value, timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run([
        shopDomain, customerId, sessionId, interactionType, pageUrl,
        productId, campaignId, channel, source, medium, deviceType,
        browser, locationCountry, locationCity, durationSeconds,
        scrollDepth, JSON.stringify(metadata), conversionValue,
        new Date().toISOString()
      ]);

      // Update customer profile
      await this.updateCustomerProfile(shopDomain, customerId, interactionData);

      // Track attribution touchpoint if relevant
      if (channel && (interactionType === this.touchpointTypes.AD_CLICK || 
                     interactionType === this.touchpointTypes.WEBSITE_VISIT)) {
        await attributionEngine.trackTouchpoint(shopDomain, {
          customerId,
          sessionId,
          channel,
          campaign: campaignId,
          source,
          medium,
          platform: this.getPlatformFromChannel(channel),
          deviceType,
          pageUrl,
          conversionValue,
          conversionType: conversionValue > 0 ? 'purchase' : null,
          orderId: conversionValue > 0 ? `order_${Date.now()}` : null
        });
      }

      // Update journey mapping
      await this.updateJourneyMap(shopDomain, customerId, sessionId, interactionData);

      return { success: true };

    } catch (error) {
      log.error('Error tracking customer interaction', error);
      throw error;
    }
  }

  /**
   * Update customer profile
   */
  async updateCustomerProfile(shopDomain, customerId, interactionData) {
    const db = getDB();
    
    // Check if customer exists
    let customer = db.prepare(`
      SELECT * FROM customer_profiles 
      WHERE shop_domain = ? AND customer_id = ?
    `).get([shopDomain, customerId]);

    const now = new Date().toISOString();
    
    if (!customer) {
      // Create new customer profile
      const stmt = db.prepare(`
        INSERT INTO customer_profiles (
          shop_domain, customer_id, first_seen_at, last_seen_at,
          acquisition_channel, customer_segment, journey_stage
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run([
        shopDomain, customerId, now, now,
        interactionData.channel, this.segments.NEW_VISITOR, this.journeyStages.AWARENESS
      ]);
    } else {
      // Update existing profile
      const stmt = db.prepare(`
        UPDATE customer_profiles SET
          last_seen_at = ?,
          customer_segment = ?,
          journey_stage = ?,
          updated_at = ?
        WHERE shop_domain = ? AND customer_id = ?
      `);
      
      const newSegment = await this.calculateCustomerSegment(shopDomain, customerId);
      const newStage = await this.calculateJourneyStage(shopDomain, customerId);
      
      stmt.run([now, newSegment, newStage, now, shopDomain, customerId]);
    }

    // Update engagement score
    await this.updateEngagementScore(shopDomain, customerId);
  }

  /**
   * Calculate customer segment
   */
  async calculateCustomerSegment(shopDomain, customerId) {
    const db = getDB();
    
    const profile = db.prepare(`
      SELECT total_orders, total_spent, first_seen_at, last_seen_at
      FROM customer_profiles
      WHERE shop_domain = ? AND customer_id = ?
    `).get([shopDomain, customerId]);

    if (!profile) return this.segments.NEW_VISITOR;

    const daysSinceFirst = (Date.now() - new Date(profile.first_seen_at).getTime()) / (1000 * 60 * 60 * 24);
    const daysSinceLast = (Date.now() - new Date(profile.last_seen_at).getTime()) / (1000 * 60 * 60 * 24);

    // Segment logic
    if (profile.total_orders === 0) {
      return daysSinceFirst > 30 ? this.segments.AT_RISK : this.segments.NEW_VISITOR;
    } else if (profile.total_orders === 1) {
      return this.segments.FIRST_TIME_BUYER;
    } else if (profile.total_spent > 1000) {
      return this.segments.VIP_CUSTOMER;
    } else if (daysSinceLast > 90) {
      return this.segments.CHURNED;
    } else if (daysSinceLast > 60) {
      return this.segments.AT_RISK;
    } else {
      return this.segments.REPEAT_CUSTOMER;
    }
  }

  /**
   * Calculate journey stage
   */
  async calculateJourneyStage(shopDomain, customerId) {
    const db = getDB();
    
    // Get recent interactions
    const recentInteractions = db.prepare(`
      SELECT interaction_type, COUNT(*) as count
      FROM customer_interactions
      WHERE shop_domain = ? AND customer_id = ?
        AND timestamp > datetime('now', '-30 days')
      GROUP BY interaction_type
    `).all([shopDomain, customerId]);

    const interactionCounts = {};
    recentInteractions.forEach(i => {
      interactionCounts[i.interaction_type] = i.count;
    });

    // Get customer orders
    const profile = db.prepare(`
      SELECT total_orders FROM customer_profiles
      WHERE shop_domain = ? AND customer_id = ?
    `).get([shopDomain, customerId]);

    const totalOrders = profile?.total_orders || 0;

    // Determine stage
    if (totalOrders > 0) {
      if (totalOrders >= 3) {
        return this.journeyStages.ADVOCACY;
      } else {
        return this.journeyStages.RETENTION;
      }
    } else if (interactionCounts[this.touchpointTypes.CHECKOUT_START] > 0) {
      return this.journeyStages.PURCHASE;
    } else if (interactionCounts[this.touchpointTypes.PRODUCT_VIEW] > 2 || 
               interactionCounts[this.touchpointTypes.CART_ADD] > 0) {
      return this.journeyStages.CONSIDERATION;
    } else {
      return this.journeyStages.AWARENESS;
    }
  }

  /**
   * Update customer engagement score
   */
  async updateEngagementScore(shopDomain, customerId) {
    const db = getDB();
    
    // Get interaction data for last 30 days
    const interactions = db.prepare(`
      SELECT 
        interaction_type,
        COUNT(*) as count,
        AVG(duration_seconds) as avg_duration,
        AVG(scroll_depth) as avg_scroll
      FROM customer_interactions
      WHERE shop_domain = ? AND customer_id = ?
        AND timestamp > datetime('now', '-30 days')
      GROUP BY interaction_type
    `).all([shopDomain, customerId]);

    let engagementScore = 0;

    // Score different interaction types
    const interactionWeights = {
      [this.touchpointTypes.WEBSITE_VISIT]: 1,
      [this.touchpointTypes.PRODUCT_VIEW]: 2,
      [this.touchpointTypes.CART_ADD]: 5,
      [this.touchpointTypes.CHECKOUT_START]: 8,
      [this.touchpointTypes.PURCHASE]: 10,
      [this.touchpointTypes.EMAIL_OPEN]: 1,
      [this.touchpointTypes.EMAIL_CLICK]: 3,
      [this.touchpointTypes.SOCIAL_ENGAGEMENT]: 2
    };

    interactions.forEach(interaction => {
      const weight = interactionWeights[interaction.interaction_type] || 1;
      const frequency = Math.min(interaction.count, 10); // Cap at 10 for scoring
      const duration = Math.min(interaction.avg_duration / 60, 10); // Minutes, capped at 10
      const engagement = Math.min(interaction.avg_scroll / 100, 1); // Scroll depth as percentage
      
      engagementScore += weight * frequency * (1 + duration * 0.1 + engagement * 0.2);
    });

    // Normalize score (0-100)
    engagementScore = Math.min(100, engagementScore / 2);

    // Update profile
    db.prepare(`
      UPDATE customer_profiles SET 
        engagement_score = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE shop_domain = ? AND customer_id = ?
    `).run([engagementScore, shopDomain, customerId]);
  }

  /**
   * Update journey map
   */
  async updateJourneyMap(shopDomain, customerId, sessionId, interactionData) {
    const db = getDB();
    
    // Check if journey exists for this session
    let journey = db.prepare(`
      SELECT * FROM customer_journey_maps
      WHERE shop_domain = ? AND customer_id = ? AND journey_id = ?
    `).get([shopDomain, customerId, sessionId]);

    if (!journey) {
      // Create new journey
      const stmt = db.prepare(`
        INSERT INTO customer_journey_maps (
          shop_domain, customer_id, journey_id, journey_start,
          total_touchpoints, channels_used, devices_used, pages_visited
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run([
        shopDomain, customerId, sessionId, new Date().toISOString(),
        1, JSON.stringify([interactionData.channel]), 
        JSON.stringify([interactionData.deviceType]),
        JSON.stringify([interactionData.pageUrl])
      ]);
    } else {
      // Update existing journey
      const channels = JSON.parse(journey.channels_used || '[]');
      const devices = JSON.parse(journey.devices_used || '[]');
      const pages = JSON.parse(journey.pages_visited || '[]');

      if (interactionData.channel && !channels.includes(interactionData.channel)) {
        channels.push(interactionData.channel);
      }
      if (interactionData.deviceType && !devices.includes(interactionData.deviceType)) {
        devices.push(interactionData.deviceType);
      }
      if (interactionData.pageUrl && !pages.includes(interactionData.pageUrl)) {
        pages.push(interactionData.pageUrl);
      }

      const stmt = db.prepare(`
        UPDATE customer_journey_maps SET
          total_touchpoints = total_touchpoints + 1,
          channels_used = ?,
          devices_used = ?,
          pages_visited = ?,
          journey_end = ?,
          conversion_value = COALESCE(conversion_value, 0) + ?,
          is_converted = CASE WHEN ? > 0 THEN 1 ELSE is_converted END
        WHERE shop_domain = ? AND journey_id = ?
      `);
      
      stmt.run([
        JSON.stringify(channels),
        JSON.stringify(devices), 
        JSON.stringify(pages),
        new Date().toISOString(),
        interactionData.conversionValue || 0,
        interactionData.conversionValue || 0,
        shopDomain, sessionId
      ]);
    }
  }

  /**
   * Get customer journey analytics
   */
  async getJourneyAnalytics(shopDomain, options = {}) {
    const db = getDB();
    const {
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate = new Date().toISOString().split('T')[0],
      segment = null
    } = options;

    // Customer segment distribution
    const segmentDistribution = db.prepare(`
      SELECT 
        customer_segment,
        COUNT(*) as customer_count,
        AVG(total_spent) as avg_spent,
        AVG(engagement_score) as avg_engagement
      FROM customer_profiles
      WHERE shop_domain = ?
        AND updated_at BETWEEN ? AND ?
        ${segment ? 'AND customer_segment = ?' : ''}
      GROUP BY customer_segment
    `).all(segment ? [shopDomain, startDate, endDate, segment] : [shopDomain, startDate, endDate]);

    // Journey stage funnel
    const stageFunnel = db.prepare(`
      SELECT 
        journey_stage,
        COUNT(*) as customer_count,
        AVG(engagement_score) as avg_engagement
      FROM customer_profiles
      WHERE shop_domain = ?
        AND updated_at BETWEEN ? AND ?
      GROUP BY journey_stage
    `).all([shopDomain, startDate, endDate]);

    // Top conversion paths
    const conversionPaths = db.prepare(`
      SELECT 
        channels_used,
        COUNT(*) as journey_count,
        AVG(conversion_value) as avg_conversion_value,
        AVG(total_touchpoints) as avg_touchpoints,
        AVG(journey_duration_hours) as avg_duration
      FROM customer_journey_maps
      WHERE shop_domain = ?
        AND journey_start BETWEEN ? AND ?
        AND is_converted = 1
      GROUP BY channels_used
      ORDER BY journey_count DESC
      LIMIT 10
    `).all([shopDomain, startDate, endDate]);

    // Interaction heatmap
    const interactionHeatmap = db.prepare(`
      SELECT 
        interaction_type,
        DATE(timestamp) as date,
        COUNT(*) as interaction_count,
        COUNT(DISTINCT customer_id) as unique_customers
      FROM customer_interactions
      WHERE shop_domain = ?
        AND timestamp BETWEEN ? AND ?
      GROUP BY interaction_type, DATE(timestamp)
      ORDER BY date DESC, interaction_count DESC
    `).all([shopDomain, startDate, endDate]);

    // Channel performance
    const channelPerformance = db.prepare(`
      SELECT 
        channel,
        COUNT(DISTINCT customer_id) as unique_customers,
        COUNT(*) as total_interactions,
        SUM(conversion_value) as total_revenue,
        AVG(duration_seconds) as avg_duration
      FROM customer_interactions
      WHERE shop_domain = ?
        AND timestamp BETWEEN ? AND ?
        AND channel IS NOT NULL
      GROUP BY channel
      ORDER BY total_revenue DESC
    `).all([shopDomain, startDate, endDate]);

    return {
      timeframe: { startDate, endDate },
      segmentDistribution,
      stageFunnel,
      conversionPaths: conversionPaths.map(path => ({
        ...path,
        channels: JSON.parse(path.channels_used)
      })),
      interactionHeatmap,
      channelPerformance,
      summary: {
        totalCustomers: segmentDistribution.reduce((sum, seg) => sum + seg.customer_count, 0),
        avgEngagement: segmentDistribution.reduce((sum, seg) => sum + seg.avg_engagement, 0) / Math.max(1, segmentDistribution.length),
        totalInteractions: interactionHeatmap.reduce((sum, heat) => sum + heat.interaction_count, 0)
      }
    };
  }

  /**
   * Get customer detail view
   */
  async getCustomerDetail(shopDomain, customerId) {
    const db = getDB();
    
    // Customer profile
    const profile = db.prepare(`
      SELECT * FROM customer_profiles
      WHERE shop_domain = ? AND customer_id = ?
    `).get([shopDomain, customerId]);

    if (!profile) {
      throw new Error('Customer not found');
    }

    // Journey timeline
    const timeline = db.prepare(`
      SELECT 
        interaction_type,
        page_url,
        product_id,
        channel,
        source,
        device_type,
        duration_seconds,
        conversion_value,
        timestamp
      FROM customer_interactions
      WHERE shop_domain = ? AND customer_id = ?
      ORDER BY timestamp DESC
      LIMIT 100
    `).all([shopDomain, customerId]);

    // Journey maps
    const journeys = db.prepare(`
      SELECT * FROM customer_journey_maps
      WHERE shop_domain = ? AND customer_id = ?
      ORDER BY journey_start DESC
      LIMIT 10
    `).all([shopDomain, customerId]);

    // Attribution analysis
    const attribution = db.prepare(`
      SELECT 
        model_type,
        channel_attribution,
        total_revenue
      FROM attribution_results ar
      JOIN customer_touchpoints ct ON ar.order_id = ct.order_id
      WHERE ar.shop_domain = ? AND ct.customer_id = ?
      ORDER BY ar.created_at DESC
      LIMIT 5
    `).all([shopDomain, customerId]);

    return {
      profile,
      timeline,
      journeys: journeys.map(j => ({
        ...j,
        channels_used: JSON.parse(j.channels_used || '[]'),
        devices_used: JSON.parse(j.devices_used || '[]'),
        pages_visited: JSON.parse(j.pages_visited || '[]')
      })),
      attribution: attribution.map(a => ({
        ...a,
        channel_attribution: JSON.parse(a.channel_attribution)
      }))
    };
  }

  /**
   * Create behavioral segment
   */
  async createBehavioralSegment(shopDomain, segmentData) {
    const db = getDB();
    
    const {
      segmentName,
      segmentType,
      criteria
    } = segmentData;

    const stmt = db.prepare(`
      INSERT INTO behavioral_segments (
        shop_domain, segment_name, segment_type, criteria
      ) VALUES (?, ?, ?, ?)
    `);
    
    stmt.run([
      shopDomain, segmentName, segmentType, JSON.stringify(criteria)
    ]);

    // Calculate initial metrics
    await this.updateSegmentMetrics(shopDomain, segmentName);
    
    return { success: true, segmentName };
  }

  /**
   * Update segment metrics
   */
  async updateSegmentMetrics(shopDomain, segmentName) {
    const db = getDB();
    
    const segment = db.prepare(`
      SELECT * FROM behavioral_segments
      WHERE shop_domain = ? AND segment_name = ?
    `).get([shopDomain, segmentName]);

    if (!segment) return;

    const criteria = JSON.parse(segment.criteria);
    
    // This would need more sophisticated query building based on criteria
    // For now, basic implementation
    const customerCount = db.prepare(`
      SELECT COUNT(*) as count FROM customer_profiles
      WHERE shop_domain = ? AND customer_segment = ?
    `).get([shopDomain, segmentName]);

    db.prepare(`
      UPDATE behavioral_segments SET
        customer_count = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE shop_domain = ? AND segment_name = ?
    `).run([customerCount?.count || 0, shopDomain, segmentName]);
  }

  /**
   * Get platform from channel
   */
  getPlatformFromChannel(channel) {
    const platformMap = {
      'paid_search': 'google',
      'organic_search': 'google',
      'social_paid': 'facebook',
      'social_organic': 'facebook',
      'email': 'email',
      'direct': 'direct',
      'referral': 'referral',
      'display': 'display'
    };
    
    return platformMap[channel] || 'unknown';
  }

  /**
   * Process purchase for journey tracking
   */
  async processPurchase(shopDomain, orderData) {
    const { customerId, orderId, totalRevenue, lineItems } = orderData;
    
    // Update customer profile with purchase
    const db = getDB();
    
    db.prepare(`
      UPDATE customer_profiles SET
        total_orders = total_orders + 1,
        total_spent = total_spent + ?,
        avg_order_value = total_spent / total_orders,
        journey_stage = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE shop_domain = ? AND customer_id = ?
    `).run([totalRevenue, this.journeyStages.RETENTION, shopDomain, customerId]);

    // Track purchase interaction
    await this.trackInteraction(shopDomain, {
      customerId,
      sessionId: `purchase_${orderId}`,
      interactionType: this.touchpointTypes.PURCHASE,
      conversionValue: totalRevenue,
      metadata: {
        orderId,
        lineItems
      }
    });

    return { success: true };
  }
}

export default new CustomerJourney();