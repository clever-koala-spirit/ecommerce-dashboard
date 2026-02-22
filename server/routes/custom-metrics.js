import express from 'express';
import { getDB } from '../db/database.js';
import { log } from '../utils/logger.js';
import customMetricsService from '../services/customMetricsService.js';
import customMetricsCalculator from '../services/customMetricsCalculator.js';

const router = express.Router();

// Custom metric builder endpoint
router.post('/builder', async (req, res) => {
  try {
    const shopDomain = req.shopDomain;
    if (!shopDomain) {
      return res.status(401).json({ error: 'Shop authentication required' });
    }

    const {
      name,
      description,
      formula,
      data_sources,
      dimensions,
      aggregation_type,
      calculation_window,
      alert_thresholds,
      visualization_config,
      goal_settings
    } = req.body;

    // Validate required fields
    if (!name || !formula || !data_sources || !aggregation_type) {
      return res.status(400).json({
        error: 'Missing required fields: name, formula, data_sources, aggregation_type'
      });
    }

    // Validate formula syntax
    const formulaValidation = await customMetricsCalculator.validateFormula(formula, data_sources);
    if (!formulaValidation.valid) {
      return res.status(400).json({
        error: 'Invalid formula',
        details: formulaValidation.errors
      });
    }

    const metricId = await customMetricsService.createCustomMetric({
      shop_domain: shopDomain,
      name,
      description,
      formula,
      data_sources: JSON.stringify(data_sources),
      dimensions: JSON.stringify(dimensions || []),
      aggregation_type,
      calculation_window: calculation_window || 'daily',
      alert_thresholds: JSON.stringify(alert_thresholds || {}),
      visualization_config: JSON.stringify(visualization_config || {}),
      goal_settings: JSON.stringify(goal_settings || {}),
      is_active: true
    });

    // Calculate initial value for the metric
    const initialValue = await customMetricsCalculator.calculateMetric(shopDomain, metricId);

    res.json({
      success: true,
      metric_id: metricId,
      name,
      description,
      formula,
      initial_value: initialValue,
      message: 'Custom metric created successfully'
    });
  } catch (error) {
    log.error('Error creating custom metric', error, { shopDomain: req.shopDomain });
    res.status(500).json({
      error: 'Failed to create custom metric',
      details: error.message
    });
  }
});

// Get all custom metrics for a shop
router.get('/list', async (req, res) => {
  try {
    const shopDomain = req.shopDomain;
    if (!shopDomain) {
      return res.status(401).json({ error: 'Shop authentication required' });
    }

    const metrics = await customMetricsService.getCustomMetrics(shopDomain);
    
    // Calculate current values for each metric
    const metricsWithValues = await Promise.all(
      metrics.map(async (metric) => {
        try {
          const currentValue = await customMetricsCalculator.calculateMetric(shopDomain, metric.id);
          const historicalData = await customMetricsService.getMetricHistory(
            shopDomain,
            metric.id,
            30 // last 30 days
          );
          
          return {
            ...metric,
            current_value: currentValue,
            historical_data: historicalData,
            trend: customMetricsCalculator.calculateTrend(historicalData)
          };
        } catch (error) {
          log.error(`Error calculating metric ${metric.id}`, error);
          return {
            ...metric,
            current_value: null,
            error: 'Calculation failed'
          };
        }
      })
    );

    res.json({
      success: true,
      metrics: metricsWithValues,
      total_count: metricsWithValues.length
    });
  } catch (error) {
    log.error('Error fetching custom metrics', error, { shopDomain: req.shopDomain });
    res.status(500).json({
      error: 'Failed to fetch custom metrics',
      details: error.message
    });
  }
});

// Calculate metric value
router.post('/calculate', async (req, res) => {
  try {
    const shopDomain = req.shopDomain;
    if (!shopDomain) {
      return res.status(401).json({ error: 'Shop authentication required' });
    }

    const { metric_id, date_range, filters } = req.body;

    if (!metric_id) {
      return res.status(400).json({ error: 'metric_id is required' });
    }

    const result = await customMetricsCalculator.calculateMetricWithOptions({
      shopDomain,
      metricId: metric_id,
      dateRange: date_range,
      filters: filters || {}
    });

    res.json({
      success: true,
      metric_id,
      value: result.value,
      breakdown: result.breakdown,
      metadata: {
        calculation_time: result.calculationTime,
        data_points_used: result.dataPointsUsed,
        last_updated: new Date().toISOString()
      }
    });
  } catch (error) {
    log.error('Error calculating custom metric', error, { 
      shopDomain: req.shopDomain,
      metricId: req.body.metric_id 
    });
    res.status(500).json({
      error: 'Failed to calculate metric',
      details: error.message
    });
  }
});

// Track metric value (store calculated values)
router.post('/track', async (req, res) => {
  try {
    const shopDomain = req.shopDomain;
    if (!shopDomain) {
      return res.status(401).json({ error: 'Shop authentication required' });
    }

    const { metric_id, value, date, dimensions, metadata } = req.body;

    if (!metric_id || value === undefined) {
      return res.status(400).json({ error: 'metric_id and value are required' });
    }

    await customMetricsService.trackMetricValue({
      shop_domain: shopDomain,
      metric_id,
      value,
      date: date || new Date().toISOString().split('T')[0],
      dimensions: JSON.stringify(dimensions || {}),
      metadata: JSON.stringify(metadata || {})
    });

    // Check alert thresholds
    const alerts = await customMetricsService.checkAlertThresholds(shopDomain, metric_id, value);
    
    res.json({
      success: true,
      metric_id,
      value,
      alerts_triggered: alerts.length,
      alerts
    });
  } catch (error) {
    log.error('Error tracking metric value', error, { 
      shopDomain: req.shopDomain,
      metricId: req.body.metric_id 
    });
    res.status(500).json({
      error: 'Failed to track metric value',
      details: error.message
    });
  }
});

// Get metric details
router.get('/:metric_id', async (req, res) => {
  try {
    const shopDomain = req.shopDomain;
    const metricId = req.params.metric_id;

    if (!shopDomain) {
      return res.status(401).json({ error: 'Shop authentication required' });
    }

    const metric = await customMetricsService.getCustomMetric(shopDomain, metricId);
    if (!metric) {
      return res.status(404).json({ error: 'Metric not found' });
    }

    const currentValue = await customMetricsCalculator.calculateMetric(shopDomain, metricId);
    const historicalData = await customMetricsService.getMetricHistory(shopDomain, metricId, 90);
    const trend = customMetricsCalculator.calculateTrend(historicalData);

    res.json({
      success: true,
      metric: {
        ...metric,
        current_value: currentValue,
        historical_data: historicalData,
        trend,
        performance_summary: customMetricsCalculator.generatePerformanceSummary(historicalData)
      }
    });
  } catch (error) {
    log.error('Error fetching metric details', error, { 
      shopDomain: req.shopDomain,
      metricId: req.params.metric_id 
    });
    res.status(500).json({
      error: 'Failed to fetch metric details',
      details: error.message
    });
  }
});

// Update custom metric
router.put('/:metric_id', async (req, res) => {
  try {
    const shopDomain = req.shopDomain;
    const metricId = req.params.metric_id;

    if (!shopDomain) {
      return res.status(401).json({ error: 'Shop authentication required' });
    }

    const updates = { ...req.body };
    
    // Validate formula if being updated
    if (updates.formula && updates.data_sources) {
      const formulaValidation = await customMetricsCalculator.validateFormula(
        updates.formula,
        updates.data_sources
      );
      if (!formulaValidation.valid) {
        return res.status(400).json({
          error: 'Invalid formula',
          details: formulaValidation.errors
        });
      }
    }

    const success = await customMetricsService.updateCustomMetric(shopDomain, metricId, updates);
    if (!success) {
      return res.status(404).json({ error: 'Metric not found' });
    }

    // Recalculate metric after update
    const newValue = await customMetricsCalculator.calculateMetric(shopDomain, metricId);

    res.json({
      success: true,
      metric_id: metricId,
      updated_value: newValue,
      message: 'Metric updated successfully'
    });
  } catch (error) {
    log.error('Error updating custom metric', error, { 
      shopDomain: req.shopDomain,
      metricId: req.params.metric_id 
    });
    res.status(500).json({
      error: 'Failed to update metric',
      details: error.message
    });
  }
});

// Delete custom metric
router.delete('/:metric_id', async (req, res) => {
  try {
    const shopDomain = req.shopDomain;
    const metricId = req.params.metric_id;

    if (!shopDomain) {
      return res.status(401).json({ error: 'Shop authentication required' });
    }

    const success = await customMetricsService.deleteCustomMetric(shopDomain, metricId);
    if (!success) {
      return res.status(404).json({ error: 'Metric not found' });
    }

    res.json({
      success: true,
      metric_id: metricId,
      message: 'Metric deleted successfully'
    });
  } catch (error) {
    log.error('Error deleting custom metric', error, { 
      shopDomain: req.shopDomain,
      metricId: req.params.metric_id 
    });
    res.status(500).json({
      error: 'Failed to delete metric',
      details: error.message
    });
  }
});

// Get available data sources and fields for metric building
router.get('/builder/data-sources', async (req, res) => {
  try {
    const shopDomain = req.shopDomain;
    if (!shopDomain) {
      return res.status(401).json({ error: 'Shop authentication required' });
    }

    const dataSources = await customMetricsService.getAvailableDataSources(shopDomain);
    
    res.json({
      success: true,
      data_sources: dataSources,
      aggregation_functions: [
        'SUM',
        'AVG', 
        'COUNT',
        'MIN',
        'MAX',
        'RATIO',
        'GROWTH_RATE',
        'MOVING_AVERAGE',
        'YEAR_OVER_YEAR',
        'CUSTOM'
      ],
      calculation_windows: [
        'daily',
        'weekly',
        'monthly',
        'quarterly',
        'yearly',
        'rolling_7_days',
        'rolling_30_days',
        'rolling_90_days'
      ]
    });
  } catch (error) {
    log.error('Error fetching data sources', error, { shopDomain: req.shopDomain });
    res.status(500).json({
      error: 'Failed to fetch data sources',
      details: error.message
    });
  }
});

// Export metric data
router.get('/:metric_id/export', async (req, res) => {
  try {
    const shopDomain = req.shopDomain;
    const metricId = req.params.metric_id;
    const { format = 'json', date_range } = req.query;

    if (!shopDomain) {
      return res.status(401).json({ error: 'Shop authentication required' });
    }

    const exportData = await customMetricsService.exportMetricData({
      shopDomain,
      metricId,
      format,
      dateRange: date_range
    });

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="metric_${metricId}_data.csv"`);
      res.send(exportData);
    } else {
      res.json({
        success: true,
        metric_id: metricId,
        format,
        data: exportData
      });
    }
  } catch (error) {
    log.error('Error exporting metric data', error, { 
      shopDomain: req.shopDomain,
      metricId: req.params.metric_id 
    });
    res.status(500).json({
      error: 'Failed to export metric data',
      details: error.message
    });
  }
});

export default router;