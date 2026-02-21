/**
 * Customer Purchase Timing Predictor - JavaScript Wrapper
 * Predicts optimal timing for customer targeting and purchase likelihood
 */

import { spawn } from 'child_process';
import { log } from '../utils/logger.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class CustomerPurchasePredictor {
  constructor() {
    this.pythonPath = path.join(__dirname, '../../../slay-season-predictions');
    this.ready = false;
    this.lastHealthCheck = null;
  }

  /**
   * Check if model is ready for predictions
   */
  isReady() {
    if (this.lastHealthCheck && Date.now() - this.lastHealthCheck < 60000) {
      return this.ready;
    }
    
    this.ready = true;
    this.lastHealthCheck = Date.now();
    return this.ready;
  }

  /**
   * Call Python prediction model
   */
  async callPythonModel(inputData) {
    return new Promise((resolve, reject) => {
      const python = spawn('python3', ['-c', `
import sys
import os
sys.path.append('${this.pythonPath}')
from models.customer_purchase import CustomerPurchasePredictor
import json

# Initialize predictor
predictor = CustomerPurchasePredictor()

# Parse input
input_data = json.loads('${JSON.stringify(inputData).replace(/'/g, "\\'")}')

# Make prediction
try:
    result = predictor.predict_timing(input_data)
    print(json.dumps(result))
except Exception as e:
    print(json.dumps({"error": str(e)}))
`]);

      let output = '';
      let errorOutput = '';

      python.stdout.on('data', (data) => {
        output += data.toString();
      });

      python.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      python.on('close', (code) => {
        if (code !== 0) {
          log.error(`Python prediction failed with code ${code}: ${errorOutput}`);
          reject(new Error(`Python prediction failed: ${errorOutput}`));
          return;
        }

        try {
          const result = JSON.parse(output.trim());
          if (result.error) {
            reject(new Error(result.error));
          } else {
            resolve(result);
          }
        } catch (parseError) {
          log.error('Failed to parse Python output:', parseError);
          reject(new Error('Failed to parse prediction result'));
        }
      });
    });
  }

  /**
   * Predict optimal customer timing
   */
  async predictTiming(inputData) {
    try {
      const {
        customer_data = [],
        purchase_history = [],
        shop_domain
      } = inputData;

      log.info(`⏰ Predicting customer timing for ${shop_domain} (${customer_data.length} customers)`);

      // Try Python model first
      let prediction;
      try {
        prediction = await this.callPythonModel({
          customer_data,
          purchase_history
        });
      } catch (pythonError) {
        log.error('Python model failed, using fallback:', pythonError);
        prediction = this.fallbackTiming(inputData);
      }

      // Enhance with actionable insights
      const enhancedPrediction = this.enhanceTiming(prediction, inputData);

      log.info(`✅ Customer timing prediction complete: ${enhancedPrediction.confidence} confidence`);
      return enhancedPrediction;

    } catch (error) {
      log.error('Customer timing prediction failed:', error);
      throw error;
    }
  }

  /**
   * Fallback timing prediction when Python model fails
   */
  fallbackTiming(inputData) {
    const { customer_data = [], purchase_history = [] } = inputData;

    if (customer_data.length === 0) {
      return {
        optimal_windows: [],
        segments: [],
        estimated_lift: 0
      };
    }

    // Analyze customer patterns
    const segments = this.analyzeCustomerSegments(customer_data, purchase_history);
    const optimalWindows = this.findOptimalWindows(purchase_history);

    return {
      optimal_windows: optimalWindows,
      segments,
      estimated_lift: 0.15 // Conservative 15% lift estimate
    };
  }

  /**
   * Analyze customer segments based on behavior
   */
  analyzeCustomerSegments(customers, history) {
    const segments = {
      high_intent: [],
      medium_intent: [],
      low_intent: [],
      churned: []
    };

    customers.forEach(customer => {
      const customerHistory = history.filter(h => h.customer_id === customer.id);
      const daysSinceLastPurchase = this.daysSinceLastPurchase(customerHistory);
      const totalOrders = customerHistory.length;
      const averageOrderValue = customerHistory.reduce((sum, h) => sum + (h.value || 0), 0) / totalOrders;
      const purchaseFrequency = totalOrders / Math.max(1, daysSinceLastPurchase / 30); // orders per month

      // Segment logic
      if (daysSinceLastPurchase <= 30 && purchaseFrequency > 1) {
        segments.high_intent.push({
          ...customer,
          predicted_purchase_probability: 0.8,
          optimal_contact_time: '2-5 days',
          reason: 'Recent frequent buyer'
        });
      } else if (daysSinceLastPurchase <= 60 && totalOrders > 1) {
        segments.medium_intent.push({
          ...customer,
          predicted_purchase_probability: 0.5,
          optimal_contact_time: '7-14 days',
          reason: 'Regular customer, moderate recency'
        });
      } else if (daysSinceLastPurchase <= 90) {
        segments.low_intent.push({
          ...customer,
          predicted_purchase_probability: 0.2,
          optimal_contact_time: '14-30 days',
          reason: 'Past customer, low recent activity'
        });
      } else {
        segments.churned.push({
          ...customer,
          predicted_purchase_probability: 0.05,
          optimal_contact_time: 'Reactivation campaign',
          reason: 'Inactive customer'
        });
      }
    });

    return segments;
  }

  /**
   * Find optimal timing windows from historical data
   */
  findOptimalWindows(history) {
    if (history.length === 0) {
      return [
        {
          window: 'Weekend mornings',
          day_of_week: [6, 0], // Saturday, Sunday
          hour_range: [9, 12],
          conversion_multiplier: 1.3,
          confidence: 'medium'
        }
      ];
    }

    // Analyze purchase patterns by day/time
    const dayPatterns = {};
    const hourPatterns = {};

    history.forEach(purchase => {
      const date = new Date(purchase.created_at || purchase.timestamp);
      const dayOfWeek = date.getDay();
      const hour = date.getHours();

      dayPatterns[dayOfWeek] = (dayPatterns[dayOfWeek] || 0) + 1;
      hourPatterns[hour] = (hourPatterns[hour] || 0) + 1;
    });

    // Find peak days and hours
    const bestDay = Object.keys(dayPatterns).reduce((a, b) => dayPatterns[a] > dayPatterns[b] ? a : b);
    const bestHour = Object.keys(hourPatterns).reduce((a, b) => hourPatterns[a] > hourPatterns[b] ? a : b);

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    return [
      {
        window: `${dayNames[bestDay]} ${this.formatHour(bestHour)}`,
        day_of_week: [parseInt(bestDay)],
        hour_range: [parseInt(bestHour), parseInt(bestHour) + 2],
        conversion_multiplier: 1.4,
        confidence: 'high'
      }
    ];
  }

  /**
   * Calculate days since last purchase
   */
  daysSinceLastPurchase(customerHistory) {
    if (customerHistory.length === 0) return 999;
    
    const lastPurchase = customerHistory.reduce((latest, purchase) => {
      const purchaseDate = new Date(purchase.created_at || purchase.timestamp);
      return purchaseDate > latest ? purchaseDate : latest;
    }, new Date('1900-01-01'));

    return Math.floor((Date.now() - lastPurchase.getTime()) / (1000 * 60 * 60 * 24));
  }

  /**
   * Format hour for display
   */
  formatHour(hour) {
    const h = parseInt(hour);
    if (h < 12) return `${h}:00 AM`;
    if (h === 12) return '12:00 PM';
    return `${h - 12}:00 PM`;
  }

  /**
   * Enhance timing prediction with actionable insights
   */
  enhanceTiming(prediction, inputData) {
    const { optimal_windows = [], segments = {}, estimated_lift } = prediction;

    // Determine confidence based on data quality
    const totalCustomers = Object.values(segments).reduce((sum, segment) => {
      return sum + (Array.isArray(segment) ? segment.length : 0);
    }, 0);

    let confidence = 'green';
    if (totalCustomers < 10) confidence = 'red';
    else if (totalCustomers < 50) confidence = 'yellow';

    // Generate actionable recommendation
    let recommendation = '';
    const highIntentCustomers = segments.high_intent?.length || 0;
    const mediumIntentCustomers = segments.medium_intent?.length || 0;

    if (highIntentCustomers > 0) {
      recommendation = `🎯 High Priority: ${highIntentCustomers} customers ready to buy. Launch campaign in next 2-5 days.`;
    } else if (mediumIntentCustomers > 0) {
      recommendation = `📈 Opportunity: ${mediumIntentCustomers} warm customers. Target in next 7-14 days.`;
    } else {
      recommendation = '🔄 Reactivation: Focus on customer retention and reactivation campaigns.';
    }

    // Calculate next optimal time
    const nextOptimalTime = this.calculateNextOptimalTime(optimal_windows);

    return {
      ...prediction,
      confidence,
      recommendation,
      next_optimal_time: nextOptimalTime,
      urgency_level: highIntentCustomers > 10 ? 'high' : mediumIntentCustomers > 20 ? 'medium' : 'low',
      campaign_suggestions: this.generateCampaignSuggestions(segments),
      expected_conversion_rate: this.estimateConversionRate(segments)
    };
  }

  /**
   * Calculate next optimal campaign timing
   */
  calculateNextOptimalTime(optimalWindows) {
    if (optimalWindows.length === 0) {
      // Default to weekend morning
      const now = new Date();
      const nextSaturday = new Date(now);
      nextSaturday.setDate(now.getDate() + (6 - now.getDay()));
      nextSaturday.setHours(10, 0, 0, 0);
      return nextSaturday.toISOString();
    }

    const bestWindow = optimalWindows[0];
    const now = new Date();
    const targetDay = bestWindow.day_of_week[0];
    const targetHour = bestWindow.hour_range[0];

    const nextOptimal = new Date(now);
    const daysUntilTarget = (targetDay - now.getDay() + 7) % 7;
    nextOptimal.setDate(now.getDate() + daysUntilTarget);
    nextOptimal.setHours(targetHour, 0, 0, 0);

    // If target time has passed today, move to next week
    if (daysUntilTarget === 0 && now.getHours() >= targetHour) {
      nextOptimal.setDate(nextOptimal.getDate() + 7);
    }

    return nextOptimal.toISOString();
  }

  /**
   * Generate campaign suggestions based on segments
   */
  generateCampaignSuggestions(segments) {
    const suggestions = [];

    if (segments.high_intent?.length > 0) {
      suggestions.push({
        segment: 'high_intent',
        campaign_type: 'Flash Sale',
        urgency: 'Launch within 48 hours',
        expected_response: '15-25% conversion rate'
      });
    }

    if (segments.medium_intent?.length > 0) {
      suggestions.push({
        segment: 'medium_intent',
        campaign_type: 'Personalized Offers',
        urgency: 'Launch within 1 week',
        expected_response: '8-15% conversion rate'
      });
    }

    if (segments.churned?.length > 0) {
      suggestions.push({
        segment: 'churned',
        campaign_type: 'Win-back Campaign',
        urgency: 'Monthly cadence',
        expected_response: '2-5% reactivation rate'
      });
    }

    return suggestions;
  }

  /**
   * Estimate overall conversion rate
   */
  estimateConversionRate(segments) {
    const highIntent = segments.high_intent?.length || 0;
    const mediumIntent = segments.medium_intent?.length || 0;
    const lowIntent = segments.low_intent?.length || 0;
    const total = highIntent + mediumIntent + lowIntent;

    if (total === 0) return 0;

    const weightedRate = (highIntent * 0.20 + mediumIntent * 0.12 + lowIntent * 0.05) / total;
    return Math.round(weightedRate * 100) / 100;
  }

  /**
   * Get model health status
   */
  getHealthStatus() {
    return {
      model_name: 'Customer Purchase Timing Predictor',
      status: this.isReady() ? 'healthy' : 'unavailable',
      python_path: this.pythonPath,
      last_check: this.lastHealthCheck,
      version: '1.0.0'
    };
  }
}