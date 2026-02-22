import { getDB } from '../db/database.js';
import { log } from '../utils/logger.js';
import crypto from 'crypto';

class CustomMetricsService {
  constructor() {
    this.initializeTables();
  }

  initializeTables() {
    const db = getDB();

    // Custom metrics definition table
    db.run(`
      CREATE TABLE IF NOT EXISTS custom_metrics (
        id TEXT PRIMARY KEY,
        shop_domain TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        formula TEXT NOT NULL,
        data_sources TEXT NOT NULL,
        dimensions TEXT,
        aggregation_type TEXT NOT NULL,
        calculation_window TEXT DEFAULT 'daily',
        alert_thresholds TEXT,
        visualization_config TEXT,
        goal_settings TEXT,
        is_active BOOLEAN DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Custom metric values/history table
    db.run(`
      CREATE TABLE IF NOT EXISTS custom_metric_values (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        shop_domain TEXT NOT NULL,
        metric_id TEXT NOT NULL,
        value REAL NOT NULL,
        date TEXT NOT NULL,
        dimensions TEXT,
        metadata TEXT,
        calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (metric_id) REFERENCES custom_metrics (id) ON DELETE CASCADE
      )
    `);

    // Custom metric alerts table
    db.run(`
      CREATE TABLE IF NOT EXISTS custom_metric_alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        shop_domain TEXT NOT NULL,
        metric_id TEXT NOT NULL,
        alert_type TEXT NOT NULL,
        threshold_value REAL NOT NULL,
        current_value REAL NOT NULL,
        triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        acknowledged BOOLEAN DEFAULT 0,
        FOREIGN KEY (metric_id) REFERENCES custom_metrics (id) ON DELETE CASCADE
      )
    `);

    // Create indexes for performance
    db.run(`CREATE INDEX IF NOT EXISTS idx_custom_metrics_shop ON custom_metrics(shop_domain)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_custom_metric_values_shop_metric ON custom_metric_values(shop_domain, metric_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_custom_metric_values_date ON custom_metric_values(date)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_custom_metric_alerts_shop ON custom_metric_alerts(shop_domain)`);

    log.info('Custom metrics tables initialized');
  }

  async createCustomMetric(metricData) {
    const db = getDB();
    const metricId = crypto.randomUUID();

    const stmt = db.prepare(`
      INSERT INTO custom_metrics (
        id, shop_domain, name, description, formula, data_sources,
        dimensions, aggregation_type, calculation_window, alert_thresholds,
        visualization_config, goal_settings, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run([
      metricId,
      metricData.shop_domain,
      metricData.name,
      metricData.description || null,
      metricData.formula,
      metricData.data_sources,
      metricData.dimensions || '[]',
      metricData.aggregation_type,
      metricData.calculation_window || 'daily',
      metricData.alert_thresholds || '{}',
      metricData.visualization_config || '{}',
      metricData.goal_settings || '{}',
      metricData.is_active ? 1 : 0
    ]);

    stmt.free();
    
    log.info('Custom metric created', { metricId, shopDomain: metricData.shop_domain });
    return metricId;
  }

  async getCustomMetrics(shopDomain) {
    const db = getDB();
    
    const stmt = db.prepare(`
      SELECT * FROM custom_metrics 
      WHERE shop_domain = ? AND is_active = 1
      ORDER BY created_at DESC
    `);
    
    const results = stmt.all([shopDomain]);
    stmt.free();

    return results.map(metric => ({
      ...metric,
      data_sources: JSON.parse(metric.data_sources),
      dimensions: JSON.parse(metric.dimensions),
      alert_thresholds: JSON.parse(metric.alert_thresholds),
      visualization_config: JSON.parse(metric.visualization_config),
      goal_settings: JSON.parse(metric.goal_settings)
    }));
  }

  async getCustomMetric(shopDomain, metricId) {
    const db = getDB();
    
    const stmt = db.prepare(`
      SELECT * FROM custom_metrics 
      WHERE shop_domain = ? AND id = ? AND is_active = 1
    `);
    
    const result = stmt.get([shopDomain, metricId]);
    stmt.free();

    if (!result) return null;

    return {
      ...result,
      data_sources: JSON.parse(result.data_sources),
      dimensions: JSON.parse(result.dimensions),
      alert_thresholds: JSON.parse(result.alert_thresholds),
      visualization_config: JSON.parse(result.visualization_config),
      goal_settings: JSON.parse(result.goal_settings)
    };
  }

  async updateCustomMetric(shopDomain, metricId, updates) {
    const db = getDB();
    
    const allowedFields = [
      'name', 'description', 'formula', 'data_sources', 'dimensions',
      'aggregation_type', 'calculation_window', 'alert_thresholds',
      'visualization_config', 'goal_settings', 'is_active'
    ];

    const updateFields = [];
    const values = [];

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = ?`);
        if (typeof updates[key] === 'object') {
          values.push(JSON.stringify(updates[key]));
        } else {
          values.push(updates[key]);
        }
      }
    });

    if (updateFields.length === 0) {
      return false;
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(shopDomain, metricId);

    const stmt = db.prepare(`
      UPDATE custom_metrics 
      SET ${updateFields.join(', ')}
      WHERE shop_domain = ? AND id = ?
    `);

    const result = stmt.run(values);
    stmt.free();

    return result.changes > 0;
  }

  async deleteCustomMetric(shopDomain, metricId) {
    const db = getDB();
    
    const stmt = db.prepare(`
      UPDATE custom_metrics 
      SET is_active = 0, updated_at = CURRENT_TIMESTAMP
      WHERE shop_domain = ? AND id = ?
    `);

    const result = stmt.run([shopDomain, metricId]);
    stmt.free();

    if (result.changes > 0) {
      // Also delete associated values and alerts
      await this.deleteMetricValues(shopDomain, metricId);
      await this.deleteMetricAlerts(shopDomain, metricId);
      
      log.info('Custom metric deleted', { metricId, shopDomain });
      return true;
    }

    return false;
  }

  async trackMetricValue(valueData) {
    const db = getDB();

    const stmt = db.prepare(`
      INSERT INTO custom_metric_values (
        shop_domain, metric_id, value, date, dimensions, metadata
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run([
      valueData.shop_domain,
      valueData.metric_id,
      valueData.value,
      valueData.date,
      valueData.dimensions || '{}',
      valueData.metadata || '{}'
    ]);

    stmt.free();
  }

  async getMetricHistory(shopDomain, metricId, days = 30) {
    const db = getDB();
    
    const stmt = db.prepare(`
      SELECT * FROM custom_metric_values
      WHERE shop_domain = ? AND metric_id = ?
      AND date >= date('now', '-${days} days')
      ORDER BY date DESC
    `);

    const results = stmt.all([shopDomain, metricId]);
    stmt.free();

    return results.map(value => ({
      ...value,
      dimensions: JSON.parse(value.dimensions),
      metadata: JSON.parse(value.metadata)
    }));
  }

  async checkAlertThresholds(shopDomain, metricId, currentValue) {
    // Get metric alert thresholds
    const metric = await this.getCustomMetric(shopDomain, metricId);
    if (!metric || !metric.alert_thresholds) {
      return [];
    }

    const thresholds = metric.alert_thresholds;
    const alerts = [];

    // Check various threshold types
    if (thresholds.max && currentValue > thresholds.max) {
      alerts.push({
        type: 'max_exceeded',
        threshold: thresholds.max,
        current_value: currentValue,
        message: `${metric.name} exceeded maximum threshold of ${thresholds.max}`
      });
    }

    if (thresholds.min && currentValue < thresholds.min) {
      alerts.push({
        type: 'min_exceeded',
        threshold: thresholds.min,
        current_value: currentValue,
        message: `${metric.name} fell below minimum threshold of ${thresholds.min}`
      });
    }

    if (thresholds.target_percentage) {
      const goalValue = metric.goal_settings?.target_value;
      if (goalValue) {
        const percentageAchieved = (currentValue / goalValue) * 100;
        if (percentageAchieved >= thresholds.target_percentage) {
          alerts.push({
            type: 'target_achieved',
            threshold: thresholds.target_percentage,
            percentage_achieved: percentageAchieved,
            message: `${metric.name} achieved ${percentageAchieved.toFixed(1)}% of target`
          });
        }
      }
    }

    // Store triggered alerts
    for (const alert of alerts) {
      await this.storeAlert(shopDomain, metricId, alert, currentValue);
    }

    return alerts;
  }

  async storeAlert(shopDomain, metricId, alert, currentValue) {
    const db = getDB();

    const stmt = db.prepare(`
      INSERT INTO custom_metric_alerts (
        shop_domain, metric_id, alert_type, threshold_value, current_value
      ) VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run([
      shopDomain,
      metricId,
      alert.type,
      alert.threshold || alert.percentage_achieved || 0,
      currentValue
    ]);

    stmt.free();
  }

  async getAvailableDataSources(shopDomain) {
    const db = getDB();
    
    // Get available data from existing tables
    const dataSources = {
      shopify_orders: {
        name: 'Shopify Orders',
        table: 'metric_snapshots',
        fields: [
          { name: 'total_sales', type: 'number', description: 'Total order value' },
          { name: 'order_count', type: 'number', description: 'Number of orders' },
          { name: 'avg_order_value', type: 'number', description: 'Average order value' },
          { name: 'refunded_amount', type: 'number', description: 'Total refunds' }
        ],
        available_dimensions: ['date', 'product_type', 'customer_type', 'channel']
      },
      shopify_products: {
        name: 'Shopify Products',
        table: 'metric_snapshots',
        fields: [
          { name: 'inventory_quantity', type: 'number', description: 'Current inventory' },
          { name: 'price', type: 'number', description: 'Product price' },
          { name: 'cost_per_item', type: 'number', description: 'Product cost' },
          { name: 'profit_margin', type: 'number', description: 'Profit margin' }
        ],
        available_dimensions: ['product_id', 'product_type', 'vendor', 'tags']
      },
      marketing_spend: {
        name: 'Marketing Spend',
        table: 'metric_snapshots',
        fields: [
          { name: 'ad_spend', type: 'number', description: 'Total advertising spend' },
          { name: 'impressions', type: 'number', description: 'Ad impressions' },
          { name: 'clicks', type: 'number', description: 'Ad clicks' },
          { name: 'conversions', type: 'number', description: 'Conversions' },
          { name: 'roas', type: 'number', description: 'Return on ad spend' }
        ],
        available_dimensions: ['channel', 'campaign', 'ad_set', 'creative']
      },
      customer_data: {
        name: 'Customer Analytics',
        table: 'metric_snapshots', 
        fields: [
          { name: 'ltv', type: 'number', description: 'Customer lifetime value' },
          { name: 'clv', type: 'number', description: 'Customer lifetime value' },
          { name: 'retention_rate', type: 'number', description: 'Customer retention rate' },
          { name: 'churn_rate', type: 'number', description: 'Customer churn rate' },
          { name: 'acquisition_cost', type: 'number', description: 'Customer acquisition cost' }
        ],
        available_dimensions: ['customer_segment', 'acquisition_channel', 'cohort']
      },
      financial_data: {
        name: 'Financial Metrics',
        table: 'fixed_costs',
        fields: [
          { name: 'revenue', type: 'number', description: 'Total revenue' },
          { name: 'profit', type: 'number', description: 'Net profit' },
          { name: 'gross_margin', type: 'number', description: 'Gross profit margin' },
          { name: 'operating_expenses', type: 'number', description: 'Operating expenses' },
          { name: 'fixed_costs', type: 'number', description: 'Fixed costs' }
        ],
        available_dimensions: ['category', 'period']
      }
    };

    // Check which platforms are connected for this shop
    const connectedPlatforms = db.prepare(`
      SELECT DISTINCT platform FROM platform_connections 
      WHERE shop_domain = ? AND status = 'active'
    `).all([shopDomain]).map(row => row.platform);

    // Add platform-specific data sources
    if (connectedPlatforms.includes('meta')) {
      dataSources.facebook_ads = {
        name: 'Facebook/Instagram Ads',
        table: 'metric_snapshots',
        fields: [
          { name: 'spend', type: 'number', description: 'Ad spend' },
          { name: 'impressions', type: 'number', description: 'Impressions' },
          { name: 'clicks', type: 'number', description: 'Clicks' },
          { name: 'purchases', type: 'number', description: 'Purchase conversions' },
          { name: 'purchase_value', type: 'number', description: 'Purchase conversion value' }
        ],
        available_dimensions: ['campaign_name', 'ad_set_name', 'creative_name']
      };
    }

    if (connectedPlatforms.includes('google_ads')) {
      dataSources.google_ads = {
        name: 'Google Ads',
        table: 'metric_snapshots',
        fields: [
          { name: 'cost', type: 'number', description: 'Ad cost' },
          { name: 'impressions', type: 'number', description: 'Impressions' },
          { name: 'clicks', type: 'number', description: 'Clicks' },
          { name: 'conversions', type: 'number', description: 'Conversions' },
          { name: 'conversion_value', type: 'number', description: 'Conversion value' }
        ],
        available_dimensions: ['campaign', 'ad_group', 'keyword']
      };
    }

    if (connectedPlatforms.includes('klaviyo')) {
      dataSources.email_marketing = {
        name: 'Email Marketing',
        table: 'metric_snapshots',
        fields: [
          { name: 'emails_sent', type: 'number', description: 'Emails sent' },
          { name: 'opens', type: 'number', description: 'Email opens' },
          { name: 'clicks', type: 'number', description: 'Email clicks' },
          { name: 'revenue', type: 'number', description: 'Email revenue attribution' }
        ],
        available_dimensions: ['campaign_name', 'flow_name', 'template_id']
      };
    }

    return dataSources;
  }

  async exportMetricData({ shopDomain, metricId, format = 'json', dateRange }) {
    const db = getDB();
    
    let whereClause = 'WHERE shop_domain = ? AND metric_id = ?';
    const params = [shopDomain, metricId];

    if (dateRange) {
      const { start_date, end_date } = dateRange;
      if (start_date) {
        whereClause += ' AND date >= ?';
        params.push(start_date);
      }
      if (end_date) {
        whereClause += ' AND date <= ?';
        params.push(end_date);
      }
    }

    const stmt = db.prepare(`
      SELECT cmv.*, cm.name, cm.formula, cm.aggregation_type
      FROM custom_metric_values cmv
      JOIN custom_metrics cm ON cmv.metric_id = cm.id
      ${whereClause}
      ORDER BY cmv.date DESC
    `);

    const results = stmt.all(params);
    stmt.free();

    if (format === 'csv') {
      const headers = ['Date', 'Metric Name', 'Value', 'Formula', 'Aggregation Type', 'Dimensions'];
      const csvRows = [headers.join(',')];
      
      results.forEach(row => {
        csvRows.push([
          row.date,
          `"${row.name}"`,
          row.value,
          `"${row.formula}"`,
          row.aggregation_type,
          `"${row.dimensions}"`
        ].join(','));
      });

      return csvRows.join('\n');
    }

    return results.map(row => ({
      ...row,
      dimensions: JSON.parse(row.dimensions || '{}'),
      metadata: JSON.parse(row.metadata || '{}')
    }));
  }

  async deleteMetricValues(shopDomain, metricId) {
    const db = getDB();
    
    const stmt = db.prepare(`
      DELETE FROM custom_metric_values 
      WHERE shop_domain = ? AND metric_id = ?
    `);

    stmt.run([shopDomain, metricId]);
    stmt.free();
  }

  async deleteMetricAlerts(shopDomain, metricId) {
    const db = getDB();
    
    const stmt = db.prepare(`
      DELETE FROM custom_metric_alerts 
      WHERE shop_domain = ? AND metric_id = ?
    `);

    stmt.run([shopDomain, metricId]);
    stmt.free();
  }
}

export default new CustomMetricsService();