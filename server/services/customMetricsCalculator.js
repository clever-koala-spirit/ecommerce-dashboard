import { getDB } from '../db/database.js';
import { log } from '../utils/logger.js';
import customMetricsService from './customMetricsService.js';

class CustomMetricsCalculator {
  constructor() {
    // Supported functions in formulas
    this.supportedFunctions = {
      'SUM': this.calculateSum.bind(this),
      'AVG': this.calculateAverage.bind(this),
      'COUNT': this.calculateCount.bind(this),
      'MIN': this.calculateMin.bind(this),
      'MAX': this.calculateMax.bind(this),
      'RATIO': this.calculateRatio.bind(this),
      'GROWTH_RATE': this.calculateGrowthRate.bind(this),
      'MOVING_AVERAGE': this.calculateMovingAverage.bind(this),
      'YEAR_OVER_YEAR': this.calculateYearOverYear.bind(this),
      'PERCENTAGE_CHANGE': this.calculatePercentageChange.bind(this),
      'CUMULATIVE': this.calculateCumulative.bind(this)
    };

    // Mathematical operations
    this.mathOperations = {
      '+': (a, b) => a + b,
      '-': (a, b) => a - b,
      '*': (a, b) => a * b,
      '/': (a, b) => b !== 0 ? a / b : 0,
      '^': (a, b) => Math.pow(a, b),
      '%': (a, b) => b !== 0 ? a % b : 0
    };
  }

  async validateFormula(formula, dataSources) {
    try {
      const errors = [];
      
      // Basic syntax validation
      if (!formula || typeof formula !== 'string') {
        errors.push('Formula must be a non-empty string');
        return { valid: false, errors };
      }

      // Check for balanced parentheses
      let parenthesesBalance = 0;
      for (const char of formula) {
        if (char === '(') parenthesesBalance++;
        if (char === ')') parenthesesBalance--;
        if (parenthesesBalance < 0) {
          errors.push('Unmatched closing parenthesis');
          break;
        }
      }
      if (parenthesesBalance !== 0) {
        errors.push('Unbalanced parentheses');
      }

      // Extract function calls and validate they exist
      const functionPattern = /([A-Z_]+)\s*\(/g;
      let match;
      while ((match = functionPattern.exec(formula)) !== null) {
        const functionName = match[1];
        if (!this.supportedFunctions[functionName]) {
          errors.push(`Unsupported function: ${functionName}`);
        }
      }

      // Validate data source references
      if (dataSources && Array.isArray(dataSources)) {
        const sourcePattern = /([a-zA-Z_][a-zA-Z0-9_]*\.[a-zA-Z_][a-zA-Z0-9_]*)/g;
        while ((match = sourcePattern.exec(formula)) !== null) {
          const [source, field] = match[1].split('.');
          const sourceExists = dataSources.some(ds => ds.source === source);
          if (!sourceExists) {
            errors.push(`Unknown data source: ${source}`);
          }
        }
      }

      // Check for invalid characters
      const allowedPattern = /^[a-zA-Z0-9_+\-*/^%().,\s'"=<>!]+$/;
      if (!allowedPattern.test(formula)) {
        errors.push('Formula contains invalid characters');
      }

      return {
        valid: errors.length === 0,
        errors: errors.length > 0 ? errors : null
      };
    } catch (error) {
      log.error('Formula validation error', error);
      return {
        valid: false,
        errors: ['Formula validation failed: ' + error.message]
      };
    }
  }

  async calculateMetric(shopDomain, metricId, options = {}) {
    try {
      const metric = await customMetricsService.getCustomMetric(shopDomain, metricId);
      if (!metric) {
        throw new Error('Metric not found');
      }

      return await this.calculateMetricWithOptions({
        shopDomain,
        metricId,
        metric,
        ...options
      });
    } catch (error) {
      log.error('Error calculating metric', error, { shopDomain, metricId });
      throw error;
    }
  }

  async calculateMetricWithOptions({ 
    shopDomain, 
    metricId, 
    metric, 
    dateRange,
    filters = {} 
  }) {
    const startTime = Date.now();
    
    try {
      if (!metric) {
        metric = await customMetricsService.getCustomMetric(shopDomain, metricId);
      }

      // Get data from all required sources
      const data = await this.fetchDataForCalculation(shopDomain, metric, dateRange, filters);
      
      // Parse and evaluate the formula
      const result = await this.evaluateFormula(metric.formula, data, metric);
      
      const calculationTime = Date.now() - startTime;

      return {
        value: result.value,
        breakdown: result.breakdown,
        calculationTime,
        dataPointsUsed: result.dataPointsUsed,
        lastCalculated: new Date().toISOString()
      };
    } catch (error) {
      log.error('Metric calculation failed', error, { shopDomain, metricId });
      throw error;
    }
  }

  async fetchDataForCalculation(shopDomain, metric, dateRange, filters) {
    const db = getDB();
    const data = {};

    // Default date range if not specified
    if (!dateRange) {
      const today = new Date().toISOString().split('T')[0];
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      dateRange = { start_date: thirtyDaysAgo, end_date: today };
    }

    // Fetch data from each data source
    for (const sourceConfig of metric.data_sources) {
      const { source, fields, table = 'metric_snapshots' } = sourceConfig;
      
      let whereClause = 'WHERE shop_domain = ? AND source = ?';
      const params = [shopDomain, source];

      // Add date range filters
      if (dateRange.start_date) {
        whereClause += ' AND date >= ?';
        params.push(dateRange.start_date);
      }
      if (dateRange.end_date) {
        whereClause += ' AND date <= ?';
        params.push(dateRange.end_date);
      }

      // Add custom filters
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          whereClause += ` AND ${key} = ?`;
          params.push(filters[key]);
        }
      });

      try {
        const stmt = db.prepare(`
          SELECT date, metric, value, dimensions
          FROM ${table}
          ${whereClause}
          ORDER BY date ASC
        `);

        const results = stmt.all(params);
        stmt.free();

        // Organize data by field
        data[source] = {};
        
        for (const field of fields) {
          data[source][field] = results
            .filter(row => row.metric === field)
            .map(row => ({
              date: row.date,
              value: row.value,
              dimensions: row.dimensions ? JSON.parse(row.dimensions) : {}
            }));
        }
      } catch (error) {
        log.error(`Error fetching data from ${source}`, error);
        data[source] = {};
      }
    }

    return data;
  }

  async evaluateFormula(formula, data, metric) {
    try {
      // Replace data source references with actual values
      let processedFormula = formula;
      let dataPointsUsed = 0;
      const breakdown = {};

      // Handle function calls first
      const functionPattern = /([A-Z_]+)\s*\(([^)]+)\)/g;
      let match;
      
      while ((match = functionPattern.exec(formula)) !== null) {
        const [fullMatch, functionName, args] = match;
        
        if (this.supportedFunctions[functionName]) {
          const result = await this.supportedFunctions[functionName](args, data, metric);
          processedFormula = processedFormula.replace(fullMatch, result.value);
          dataPointsUsed += result.dataPoints || 0;
          breakdown[functionName] = result.breakdown;
        }
      }

      // Handle simple data source references (e.g., shopify_orders.total_sales)
      const sourcePattern = /([a-zA-Z_][a-zA-Z0-9_]*\.[a-zA-Z_][a-zA-Z0-9_]*)/g;
      while ((match = sourcePattern.exec(processedFormula)) !== null) {
        const [source, field] = match[1].split('.');
        
        if (data[source] && data[source][field]) {
          const values = data[source][field].map(item => item.value);
          const aggregatedValue = values.reduce((sum, val) => sum + val, 0);
          processedFormula = processedFormula.replace(match[1], aggregatedValue);
          dataPointsUsed += values.length;
          breakdown[match[1]] = { total: aggregatedValue, count: values.length };
        } else {
          processedFormula = processedFormula.replace(match[1], '0');
        }
      }

      // Safely evaluate the mathematical expression
      const finalValue = this.evaluateMathExpression(processedFormula);

      return {
        value: finalValue,
        breakdown,
        dataPointsUsed
      };
    } catch (error) {
      log.error('Formula evaluation error', error);
      throw new Error('Formula evaluation failed: ' + error.message);
    }
  }

  evaluateMathExpression(expression) {
    try {
      // Remove whitespace
      expression = expression.replace(/\s+/g, '');
      
      // Basic safety check - only allow numbers, operators, and parentheses
      if (!/^[0-9+\-*/^%().]+$/.test(expression)) {
        throw new Error('Invalid characters in expression');
      }

      // Use Function constructor for safer evaluation than eval
      const result = new Function('return (' + expression + ')')();
      
      if (isNaN(result) || !isFinite(result)) {
        return 0;
      }
      
      return Number(result.toFixed(6));
    } catch (error) {
      log.error('Math expression evaluation error', error);
      return 0;
    }
  }

  // Aggregation function implementations
  async calculateSum(args, data, metric) {
    const { source, field } = this.parseArgs(args);
    const values = this.getFieldValues(data, source, field);
    const sum = values.reduce((acc, val) => acc + val, 0);
    
    return {
      value: sum,
      dataPoints: values.length,
      breakdown: { sum, count: values.length, average: values.length > 0 ? sum / values.length : 0 }
    };
  }

  async calculateAverage(args, data, metric) {
    const { source, field } = this.parseArgs(args);
    const values = this.getFieldValues(data, source, field);
    const average = values.length > 0 ? values.reduce((acc, val) => acc + val, 0) / values.length : 0;
    
    return {
      value: average,
      dataPoints: values.length,
      breakdown: { average, count: values.length }
    };
  }

  async calculateCount(args, data, metric) {
    const { source, field } = this.parseArgs(args);
    const values = this.getFieldValues(data, source, field);
    
    return {
      value: values.length,
      dataPoints: values.length,
      breakdown: { count: values.length }
    };
  }

  async calculateMin(args, data, metric) {
    const { source, field } = this.parseArgs(args);
    const values = this.getFieldValues(data, source, field);
    const min = values.length > 0 ? Math.min(...values) : 0;
    
    return {
      value: min,
      dataPoints: values.length,
      breakdown: { min, count: values.length }
    };
  }

  async calculateMax(args, data, metric) {
    const { source, field } = this.parseArgs(args);
    const values = this.getFieldValues(data, source, field);
    const max = values.length > 0 ? Math.max(...values) : 0;
    
    return {
      value: max,
      dataPoints: values.length,
      breakdown: { max, count: values.length }
    };
  }

  async calculateRatio(args, data, metric) {
    const parts = args.split(',').map(part => part.trim());
    if (parts.length !== 2) {
      throw new Error('RATIO function requires exactly 2 arguments');
    }

    const numerator = this.parseAndGetValue(parts[0], data);
    const denominator = this.parseAndGetValue(parts[1], data);
    
    const ratio = denominator !== 0 ? numerator / denominator : 0;
    
    return {
      value: ratio,
      dataPoints: 2,
      breakdown: { numerator, denominator, ratio }
    };
  }

  async calculateGrowthRate(args, data, metric) {
    const { source, field, period = 30 } = this.parseArgs(args);
    const fieldData = this.getFieldData(data, source, field);
    
    if (fieldData.length < 2) {
      return { value: 0, dataPoints: fieldData.length, breakdown: { growth_rate: 0 } };
    }

    // Sort by date
    fieldData.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const oldValue = fieldData[0].value;
    const newValue = fieldData[fieldData.length - 1].value;
    
    const growthRate = oldValue !== 0 ? ((newValue - oldValue) / oldValue) * 100 : 0;
    
    return {
      value: growthRate,
      dataPoints: fieldData.length,
      breakdown: { 
        growth_rate: growthRate,
        old_value: oldValue,
        new_value: newValue,
        period_days: period
      }
    };
  }

  async calculateMovingAverage(args, data, metric) {
    const { source, field, window = 7 } = this.parseArgs(args);
    const fieldData = this.getFieldData(data, source, field);
    
    if (fieldData.length < window) {
      const avg = fieldData.reduce((sum, item) => sum + item.value, 0) / fieldData.length;
      return { 
        value: avg || 0, 
        dataPoints: fieldData.length, 
        breakdown: { moving_average: avg, actual_window: fieldData.length } 
      };
    }

    // Sort by date and take last N values
    fieldData.sort((a, b) => new Date(a.date) - new Date(b.date));
    const recentValues = fieldData.slice(-window).map(item => item.value);
    const movingAverage = recentValues.reduce((sum, val) => sum + val, 0) / window;
    
    return {
      value: movingAverage,
      dataPoints: window,
      breakdown: { 
        moving_average: movingAverage,
        window_size: window,
        values_used: recentValues
      }
    };
  }

  async calculateYearOverYear(args, data, metric) {
    const { source, field } = this.parseArgs(args);
    const fieldData = this.getFieldData(data, source, field);
    
    // Group data by date
    const dataByDate = {};
    fieldData.forEach(item => {
      dataByDate[item.date] = item.value;
    });

    // Calculate YoY change
    const today = new Date();
    const lastYear = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    
    const todayStr = today.toISOString().split('T')[0];
    const lastYearStr = lastYear.toISOString().split('T')[0];
    
    const currentValue = dataByDate[todayStr] || 0;
    const lastYearValue = dataByDate[lastYearStr] || 0;
    
    const yoyChange = lastYearValue !== 0 ? ((currentValue - lastYearValue) / lastYearValue) * 100 : 0;
    
    return {
      value: yoyChange,
      dataPoints: fieldData.length,
      breakdown: {
        year_over_year_change: yoyChange,
        current_value: currentValue,
        last_year_value: lastYearValue
      }
    };
  }

  async calculatePercentageChange(args, data, metric) {
    const parts = args.split(',').map(part => part.trim());
    if (parts.length !== 2) {
      throw new Error('PERCENTAGE_CHANGE function requires exactly 2 arguments');
    }

    const oldValue = this.parseAndGetValue(parts[0], data);
    const newValue = this.parseAndGetValue(parts[1], data);
    
    const percentageChange = oldValue !== 0 ? ((newValue - oldValue) / oldValue) * 100 : 0;
    
    return {
      value: percentageChange,
      dataPoints: 2,
      breakdown: { percentage_change: percentageChange, old_value: oldValue, new_value: newValue }
    };
  }

  async calculateCumulative(args, data, metric) {
    const { source, field } = this.parseArgs(args);
    const fieldData = this.getFieldData(data, source, field);
    
    fieldData.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    let cumulative = 0;
    const cumulativeValues = fieldData.map(item => {
      cumulative += item.value;
      return cumulative;
    });
    
    const finalCumulative = cumulativeValues[cumulativeValues.length - 1] || 0;
    
    return {
      value: finalCumulative,
      dataPoints: fieldData.length,
      breakdown: { 
        cumulative_total: finalCumulative,
        daily_values: cumulativeValues
      }
    };
  }

  // Helper methods
  parseArgs(args) {
    const parts = args.split(',').map(part => part.trim());
    const [sourceField, ...options] = parts;
    
    const [source, field] = sourceField.split('.');
    
    const parsedOptions = {};
    options.forEach(option => {
      const [key, value] = option.split('=').map(s => s.trim());
      parsedOptions[key] = isNaN(value) ? value : Number(value);
    });

    return { source, field, ...parsedOptions };
  }

  parseAndGetValue(expression, data) {
    if (expression.includes('.')) {
      const [source, field] = expression.split('.');
      const values = this.getFieldValues(data, source, field);
      return values.reduce((sum, val) => sum + val, 0);
    } else {
      return Number(expression) || 0;
    }
  }

  getFieldValues(data, source, field) {
    if (!data[source] || !data[source][field]) {
      return [];
    }
    return data[source][field].map(item => item.value || 0);
  }

  getFieldData(data, source, field) {
    if (!data[source] || !data[source][field]) {
      return [];
    }
    return data[source][field];
  }

  calculateTrend(historicalData) {
    if (historicalData.length < 2) {
      return { direction: 'stable', percentage: 0 };
    }

    const sortedData = historicalData.sort((a, b) => new Date(a.date) - new Date(b.date));
    const firstValue = sortedData[0].value;
    const lastValue = sortedData[sortedData.length - 1].value;
    
    const change = ((lastValue - firstValue) / firstValue) * 100;
    
    let direction = 'stable';
    if (Math.abs(change) > 1) {
      direction = change > 0 ? 'up' : 'down';
    }

    return {
      direction,
      percentage: Math.abs(change),
      raw_change: change
    };
  }

  generatePerformanceSummary(historicalData) {
    if (historicalData.length === 0) {
      return {
        average: 0,
        min: 0,
        max: 0,
        volatility: 0,
        data_points: 0
      };
    }

    const values = historicalData.map(item => item.value);
    const sum = values.reduce((acc, val) => acc + val, 0);
    const average = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    // Calculate volatility (standard deviation)
    const variance = values.reduce((acc, val) => acc + Math.pow(val - average, 2), 0) / values.length;
    const volatility = Math.sqrt(variance);

    return {
      average: Number(average.toFixed(2)),
      min,
      max,
      volatility: Number(volatility.toFixed(2)),
      data_points: values.length,
      total: sum
    };
  }
}

export default new CustomMetricsCalculator();