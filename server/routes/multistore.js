import express from 'express';
import { getDB } from '../db/database.js';
import { requireShopAuth } from '../middleware/security.js';
import { log } from '../utils/logger.js';
import multiStoreService from '../services/multiStoreService.js';

const router = express.Router();

// All routes require shop authentication
router.use(requireShopAuth);

/**
 * GET /api/multi-store/overview
 * Returns overview of all stores managed by the current user/organization
 */
router.get('/overview', async (req, res) => {
  try {
    const { timeRange = '30d', metrics = 'all' } = req.query;
    const overview = await multiStoreService.getOverview(req.shopDomain, {
      timeRange,
      metrics: metrics.split(',')
    });
    
    res.json({
      success: true,
      data: overview,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    log('error', 'Multi-store overview error', { error: error.message, shop: req.shopDomain });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch multi-store overview',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/multi-store/compare
 * Compare performance across stores
 */
router.get('/compare', async (req, res) => {
  try {
    const { stores, metrics = 'revenue,orders,conversion', timeRange = '30d' } = req.query;
    
    if (!stores) {
      return res.status(400).json({
        success: false,
        error: 'Store IDs required for comparison'
      });
    }

    const comparison = await multiStoreService.compareStores(req.shopDomain, {
      storeIds: stores.split(','),
      metrics: metrics.split(','),
      timeRange
    });
    
    res.json({
      success: true,
      data: comparison,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    log('error', 'Multi-store comparison error', { error: error.message, shop: req.shopDomain });
    res.status(500).json({
      success: false,
      error: 'Failed to compare stores',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/multi-store/consolidated
 * Get consolidated metrics across all stores
 */
router.get('/consolidated', async (req, res) => {
  try {
    const { timeRange = '30d', includeBreakdown = true, currency = 'USD' } = req.query;
    
    const consolidated = await multiStoreService.getConsolidatedMetrics(req.shopDomain, {
      timeRange,
      includeBreakdown: includeBreakdown === 'true',
      currency
    });
    
    res.json({
      success: true,
      data: consolidated,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    log('error', 'Consolidated metrics error', { error: error.message, shop: req.shopDomain });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch consolidated metrics',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/multi-store/rankings
 * Get store performance rankings
 */
router.get('/rankings', async (req, res) => {
  try {
    const { metric = 'revenue', timeRange = '30d', order = 'desc' } = req.query;
    
    const rankings = await multiStoreService.getStoreRankings(req.shopDomain, {
      metric,
      timeRange,
      order
    });
    
    res.json({
      success: true,
      data: rankings,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    log('error', 'Store rankings error', { error: error.message, shop: req.shopDomain });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch store rankings',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/multi-store/inventory-optimization
 * Get inventory optimization recommendations across stores
 */
router.get('/inventory-optimization', async (req, res) => {
  try {
    const { includeTransferRecommendations = true } = req.query;
    
    const optimization = await multiStoreService.getInventoryOptimization(req.shopDomain, {
      includeTransferRecommendations: includeTransferRecommendations === 'true'
    });
    
    res.json({
      success: true,
      data: optimization,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    log('error', 'Inventory optimization error', { error: error.message, shop: req.shopDomain });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch inventory optimization data',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/multi-store/connect
 * Connect a new store to the multi-store management system
 */
router.post('/connect', async (req, res) => {
  try {
    const { shopDomain, accessToken, storeName, storeType = 'shopify' } = req.body;
    
    if (!shopDomain || !accessToken) {
      return res.status(400).json({
        success: false,
        error: 'Shop domain and access token are required'
      });
    }

    const connection = await multiStoreService.connectStore(req.shopDomain, {
      shopDomain,
      accessToken,
      storeName,
      storeType
    });
    
    res.json({
      success: true,
      data: connection,
      message: 'Store connected successfully'
    });
  } catch (error) {
    log('error', 'Store connection error', { error: error.message, shop: req.shopDomain });
    res.status(500).json({
      success: false,
      error: 'Failed to connect store',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * DELETE /api/multi-store/disconnect/:storeId
 * Disconnect a store from multi-store management
 */
router.delete('/disconnect/:storeId', async (req, res) => {
  try {
    const { storeId } = req.params;
    
    await multiStoreService.disconnectStore(req.shopDomain, storeId);
    
    res.json({
      success: true,
      message: 'Store disconnected successfully'
    });
  } catch (error) {
    log('error', 'Store disconnection error', { error: error.message, shop: req.shopDomain });
    res.status(500).json({
      success: false,
      error: 'Failed to disconnect store',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/multi-store/analytics/:storeId
 * Get detailed analytics for a specific store
 */
router.get('/analytics/:storeId', async (req, res) => {
  try {
    const { storeId } = req.params;
    const { timeRange = '30d', metrics = 'all' } = req.query;
    
    const analytics = await multiStoreService.getStoreAnalytics(req.shopDomain, storeId, {
      timeRange,
      metrics: metrics.split(',')
    });
    
    res.json({
      success: true,
      data: analytics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    log('error', 'Store analytics error', { error: error.message, shop: req.shopDomain, storeId: req.params.storeId });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch store analytics',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/multi-store/export
 * Export multi-store data in various formats
 */
router.get('/export', async (req, res) => {
  try {
    const { format = 'csv', timeRange = '30d', includeStores = 'all' } = req.query;
    
    const exportData = await multiStoreService.exportData(req.shopDomain, {
      format,
      timeRange,
      includeStores: includeStores === 'all' ? null : includeStores.split(',')
    });
    
    // Set appropriate headers for file download
    res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="multi-store-report-${new Date().toISOString().split('T')[0]}.${format}"`);
    
    if (format === 'csv') {
      res.send(exportData);
    } else {
      res.json({
        success: true,
        data: exportData,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    log('error', 'Export error', { error: error.message, shop: req.shopDomain });
    res.status(500).json({
      success: false,
      error: 'Failed to export data',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;