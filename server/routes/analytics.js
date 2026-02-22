/**
 * Advanced Analytics API Routes
 * Competitor-beating analytics endpoints
 */

import express from 'express';
import { log } from '../utils/logger.js';
import attributionEngine from '../services/attributionEngine.js';
import realTimePL from '../services/realTimePL.js';
import customerJourney from '../services/customerJourney.js';
import revenueAnalytics from '../services/revenueAnalytics.js';
import customerSegmentation from '../services/customerSegmentation.js';

const router = express.Router();

// --- Attribution Analytics ---

/**
 * GET /api/analytics/attribution
 * Get multi-touch attribution analytics
 */
router.get('/attribution', async (req, res) => {
  try {
    const { startDate, endDate, modelType } = req.query;
    const shopDomain = req.shopDomain;

    if (!shopDomain) {
      return res.status(401).json({ error: 'Shop authentication required' });
    }

    const analytics = await attributionEngine.getAttributionAnalytics(shopDomain, {
      startDate,
      endDate,
      modelType
    });

    res.json(analytics);
  } catch (error) {
    log.error('Attribution analytics error', error);
    res.status(500).json({ error: 'Failed to get attribution analytics' });
  }
});

/**
 * POST /api/analytics/attribution/touchpoint
 * Track a customer touchpoint for attribution
 */
router.post('/attribution/touchpoint', async (req, res) => {
  try {
    const shopDomain = req.shopDomain;
    const touchpointData = req.body;

    if (!shopDomain) {
      return res.status(401).json({ error: 'Shop authentication required' });
    }

    const result = await attributionEngine.trackTouchpoint(shopDomain, touchpointData);
    res.json(result);
  } catch (error) {
    log.error('Track touchpoint error', error);
    res.status(500).json({ error: 'Failed to track touchpoint' });
  }
});

// --- Real-Time P&L ---

/**
 * GET /api/analytics/pl/realtime
 * Get real-time P&L dashboard
 */
router.get('/pl/realtime', async (req, res) => {
  try {
    const { timeframe = '24h' } = req.query;
    const shopDomain = req.shopDomain;

    if (!shopDomain) {
      return res.status(401).json({ error: 'Shop authentication required' });
    }

    const plData = await realTimePL.getRealtimePL(shopDomain, timeframe);
    res.json(plData);
  } catch (error) {
    log.error('Real-time P&L error', error);
    res.status(500).json({ error: 'Failed to get P&L data' });
  }
});

/**
 * POST /api/analytics/pl/order
 * Process order for real-time P&L calculation
 */
router.post('/pl/order', async (req, res) => {
  try {
    const shopDomain = req.shopDomain;
    const orderData = req.body;

    if (!shopDomain) {
      return res.status(401).json({ error: 'Shop authentication required' });
    }

    const plUpdate = await realTimePL.processOrderPL(shopDomain, orderData);
    res.json(plUpdate);
  } catch (error) {
    log.error('Process order P&L error', error);
    res.status(500).json({ error: 'Failed to process order P&L' });
  }
});

/**
 * POST /api/analytics/pl/costs/product
 * Set product costs for P&L calculations
 */
router.post('/pl/costs/product', async (req, res) => {
  try {
    const shopDomain = req.shopDomain;
    const { productId, costData } = req.body;

    if (!shopDomain) {
      return res.status(401).json({ error: 'Shop authentication required' });
    }

    const result = await realTimePL.setProductCost(shopDomain, productId, costData);
    res.json(result);
  } catch (error) {
    log.error('Set product cost error', error);
    res.status(500).json({ error: 'Failed to set product cost' });
  }
});

// --- Customer Journey ---

/**
 * GET /api/analytics/journey
 * Get customer journey analytics
 */
router.get('/journey', async (req, res) => {
  try {
    const { startDate, endDate, segment } = req.query;
    const shopDomain = req.shopDomain;

    if (!shopDomain) {
      return res.status(401).json({ error: 'Shop authentication required' });
    }

    const analytics = await customerJourney.getJourneyAnalytics(shopDomain, {
      startDate,
      endDate,
      segment
    });

    res.json(analytics);
  } catch (error) {
    log.error('Customer journey analytics error', error);
    res.status(500).json({ error: 'Failed to get journey analytics' });
  }
});

/**
 * GET /api/analytics/journey/customer/:customerId
 * Get detailed customer journey
 */
router.get('/journey/customer/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    const shopDomain = req.shopDomain;

    if (!shopDomain) {
      return res.status(401).json({ error: 'Shop authentication required' });
    }

    const customerDetail = await customerJourney.getCustomerDetail(shopDomain, customerId);
    res.json(customerDetail);
  } catch (error) {
    log.error('Customer detail error', error);
    res.status(500).json({ error: 'Failed to get customer detail' });
  }
});

/**
 * POST /api/analytics/journey/interaction
 * Track customer interaction
 */
router.post('/journey/interaction', async (req, res) => {
  try {
    const shopDomain = req.shopDomain;
    const interactionData = req.body;

    if (!shopDomain) {
      return res.status(401).json({ error: 'Shop authentication required' });
    }

    const result = await customerJourney.trackInteraction(shopDomain, interactionData);
    res.json(result);
  } catch (error) {
    log.error('Track interaction error', error);
    res.status(500).json({ error: 'Failed to track interaction' });
  }
});

/**
 * POST /api/analytics/journey/segment
 * Create behavioral segment
 */
router.post('/journey/segment', async (req, res) => {
  try {
    const shopDomain = req.shopDomain;
    const segmentData = req.body;

    if (!shopDomain) {
      return res.status(401).json({ error: 'Shop authentication required' });
    }

    const result = await customerJourney.createBehavioralSegment(shopDomain, segmentData);
    res.json(result);
  } catch (error) {
    log.error('Create segment error', error);
    res.status(500).json({ error: 'Failed to create segment' });
  }
});

/**
 * POST /api/analytics/journey/purchase
 * Process purchase for journey tracking
 */
router.post('/journey/purchase', async (req, res) => {
  try {
    const shopDomain = req.shopDomain;
    const orderData = req.body;

    if (!shopDomain) {
      return res.status(401).json({ error: 'Shop authentication required' });
    }

    const result = await customerJourney.processPurchase(shopDomain, orderData);
    res.json(result);
  } catch (error) {
    log.error('Process purchase error', error);
    res.status(500).json({ error: 'Failed to process purchase' });
  }
});

// --- Revenue Analytics ---

/**
 * GET /api/analytics/revenue
 * Get comprehensive revenue analytics
 */
router.get('/revenue', async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      includeForecasts = 'true', 
      includeCohorts = 'true' 
    } = req.query;
    const shopDomain = req.shopDomain;

    if (!shopDomain) {
      return res.status(401).json({ error: 'Shop authentication required' });
    }

    const analytics = await revenueAnalytics.calculateRevenueAnalytics(shopDomain, {
      startDate,
      endDate,
      includeForecasts: includeForecasts === 'true',
      includeCohorts: includeCohorts === 'true'
    });

    res.json(analytics);
  } catch (error) {
    log.error('Revenue analytics error', error);
    res.status(500).json({ error: 'Failed to get revenue analytics' });
  }
});

/**
 * GET /api/analytics/revenue/forecasts
 * Get revenue forecasts
 */
router.get('/revenue/forecasts', async (req, res) => {
  try {
    const { daysAhead = 30 } = req.query;
    const shopDomain = req.shopDomain;

    if (!shopDomain) {
      return res.status(401).json({ error: 'Shop authentication required' });
    }

    const forecasts = await revenueAnalytics.generateRevenueForecasts(
      shopDomain, 
      parseInt(daysAhead)
    );

    res.json(forecasts);
  } catch (error) {
    log.error('Revenue forecasts error', error);
    res.status(500).json({ error: 'Failed to get revenue forecasts' });
  }
});

/**
 * GET /api/analytics/revenue/insights
 * Get revenue optimization insights
 */
router.get('/revenue/insights', async (req, res) => {
  try {
    const shopDomain = req.shopDomain;

    if (!shopDomain) {
      return res.status(401).json({ error: 'Shop authentication required' });
    }

    // Get recent analytics to generate fresh insights
    const analytics = await revenueAnalytics.calculateRevenueAnalytics(shopDomain, {
      includeForecasts: false,
      includeCohorts: false
    });

    const insights = await revenueAnalytics.generateRevenueInsights(shopDomain, analytics);
    res.json({ insights });
  } catch (error) {
    log.error('Revenue insights error', error);
    res.status(500).json({ error: 'Failed to get revenue insights' });
  }
});

// --- Combined Dashboard Endpoints ---

/**
 * GET /api/analytics/dashboard/executive
 * Get executive dashboard with key metrics from all systems
 */
router.get('/dashboard/executive', async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;
    const shopDomain = req.shopDomain;

    if (!shopDomain) {
      return res.status(401).json({ error: 'Shop authentication required' });
    }

    // Calculate date range
    const endDate = new Date().toISOString().split('T')[0];
    let startDate;
    switch (timeframe) {
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    }

    // Get data from all systems
    const [
      revenueData,
      attributionData,
      plData,
      journeyData
    ] = await Promise.all([
      revenueAnalytics.calculateRevenueAnalytics(shopDomain, { 
        startDate, 
        endDate,
        includeForecasts: true,
        includeCohorts: false 
      }),
      attributionEngine.getAttributionAnalytics(shopDomain, { 
        startDate, 
        endDate 
      }),
      realTimePL.getRealtimePL(shopDomain, timeframe === '7d' ? '7d' : '30d'),
      customerJourney.getJourneyAnalytics(shopDomain, { 
        startDate, 
        endDate 
      })
    ]);

    // Combine into executive summary
    const dashboard = {
      timeframe: { startDate, endDate },
      revenue: {
        total: revenueData.overview.totalRevenue,
        growth: revenueData.overview.revenueGrowth,
        avgOrderValue: revenueData.overview.avgOrderValue,
        forecasts: revenueData.forecasts
      },
      profitability: {
        grossMargin: plData.current.grossMargin,
        netMargin: plData.current.netMargin,
        contributionMargin: plData.current.contributionMargin,
        trends: plData.trends
      },
      attribution: {
        topChannels: attributionData.analytics.slice(0, 5),
        summary: attributionData.summary
      },
      customers: {
        total: journeyData.summary.totalCustomers,
        avgEngagement: journeyData.summary.avgEngagement,
        segmentDistribution: journeyData.segmentDistribution,
        topPaths: journeyData.conversionPaths.slice(0, 3)
      },
      insights: revenueData.insights,
      alerts: plData.alerts || []
    };

    res.json(dashboard);
  } catch (error) {
    log.error('Executive dashboard error', error);
    res.status(500).json({ error: 'Failed to get executive dashboard' });
  }
});

/**
 * GET /api/analytics/dashboard/operational  
 * Get operational dashboard with detailed metrics
 */
router.get('/dashboard/operational', async (req, res) => {
  try {
    const { timeframe = '7d' } = req.query;
    const shopDomain = req.shopDomain;

    if (!shopDomain) {
      return res.status(401).json({ error: 'Shop authentication required' });
    }

    // Get real-time operational data
    const [
      plData,
      revenueData
    ] = await Promise.all([
      realTimePL.getRealtimePL(shopDomain, timeframe),
      revenueAnalytics.calculateRevenueAnalytics(shopDomain, {
        includeForecasts: false,
        includeCohorts: false
      })
    ]);

    const dashboard = {
      timeframe,
      realTime: {
        revenue: plData.current.revenue,
        orders: plData.current.orderCount,
        grossProfit: plData.current.grossProfit,
        margins: {
          gross: plData.current.grossMargin,
          contribution: plData.current.contributionMargin,
          net: plData.current.netMargin
        }
      },
      products: {
        topPerformers: revenueData.products.slice(0, 10),
        topByMargin: plData.topProducts.slice(0, 10)
      },
      costs: {
        breakdown: {
          cogs: plData.current.cogs,
          advertising: plData.current.adSpend,
          shipping: plData.current.shippingCost,
          processing: plData.current.paymentFees
        }
      },
      trends: plData.trends,
      alerts: plData.alerts
    };

    res.json(dashboard);
  } catch (error) {
    log.error('Operational dashboard error', error);
    res.status(500).json({ error: 'Failed to get operational dashboard' });
  }
});

// --- Customer Segmentation Analytics (NEW vs RETURNING) ---

/**
 * GET /api/analytics/customer-segments
 * Get comprehensive customer segmentation P&L analysis
 * Features that make Triple Whale weep: 
 * - Real-time customer segmentation with ML
 * - Cohort analysis with predictive LTV modeling
 * - Acquisition cost attribution with channel breakdown
 */
router.get('/customer-segments', async (req, res) => {
  try {
    const { 
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate = new Date().toISOString().split('T')[0],
      currency = 'USD'
    } = req.query;
    
    const shopDomain = req.shopDomain;

    if (!shopDomain) {
      return res.status(401).json({ error: 'Shop authentication required' });
    }

    const segmentationData = await customerSegmentation.getCustomerSegmentation(shopDomain, {
      startDate,
      endDate,
      currency
    });

    res.json({
      success: true,
      message: 'Customer segmentation analysis complete',
      ...segmentationData,
      metadata: {
        competitiveAdvantage: 'Triple Whale could never',
        features: [
          'Real-time P&L by customer segment',
          'Advanced cohort analysis with retention prediction',
          'Acquisition funnel optimization insights',
          'Customer lifecycle profitability tracking'
        ]
      }
    });
  } catch (error) {
    log.error('Customer segmentation error', error);
    res.status(500).json({ 
      error: 'Failed to get customer segmentation analysis',
      details: error.message 
    });
  }
});

/**
 * GET /api/analytics/new-vs-returning
 * Get time-based trends for new vs returning customer performance
 * Advanced insights that competitors wish they had
 */
router.get('/new-vs-returning', async (req, res) => {
  try {
    const {
      startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate = new Date().toISOString().split('T')[0],
      granularity = 'daily' // daily, weekly, monthly
    } = req.query;
    
    const shopDomain = req.shopDomain;

    if (!shopDomain) {
      return res.status(401).json({ error: 'Shop authentication required' });
    }

    const trendsData = await customerSegmentation.getNewVsReturningTrends(shopDomain, {
      startDate,
      endDate,
      granularity
    });

    res.json({
      success: true,
      message: 'New vs returning customer trends analysis complete',
      ...trendsData,
      metadata: {
        granularity,
        dateRange: { startDate, endDate },
        competitiveEdge: 'Time-based customer profitability insights that Triple Whale can only dream of'
      }
    });
  } catch (error) {
    log.error('New vs returning trends error', error);
    res.status(500).json({ 
      error: 'Failed to get new vs returning trends',
      details: error.message 
    });
  }
});

// --- Initialization Endpoint ---

/**
 * POST /api/analytics/initialize
 * Initialize all analytics tables for a shop
 */
router.post('/initialize', async (req, res) => {
  try {
    const shopDomain = req.shopDomain;

    if (!shopDomain) {
      return res.status(401).json({ error: 'Shop authentication required' });
    }

    // Initialize all analytics services
    attributionEngine.initializeTables();
    realTimePL.initializeTables();
    customerJourney.initializeTables();
    revenueAnalytics.initializeTables();
    // Customer segmentation doesn't need table initialization - uses existing orders/customers tables

    res.json({ 
      success: true, 
      message: 'Analytics tables initialized successfully',
      shopDomain,
      features: [
        'Multi-touch Attribution Engine',
        'Real-time P&L Calculations',
        'Advanced Customer Journey Tracking',
        'Predictive Revenue Analytics',
        'Customer Segmentation P&L Analysis (NEW vs RETURNING)',
        'Advanced Cohort Analysis with LTV Prediction'
      ]
    });
  } catch (error) {
    log.error('Analytics initialization error', error);
    res.status(500).json({ error: 'Failed to initialize analytics' });
  }
});

export default router;