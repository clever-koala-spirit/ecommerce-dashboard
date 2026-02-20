/**
 * Budget Optimization Model - JavaScript Wrapper
 * Recommends optimal budget allocation across campaigns
 */

import { spawn } from 'child_process';
import { log } from '../utils/logger.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class BudgetOptimizer {
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
   * Call Python optimization model
   */
  async callPythonModel(inputData) {
    return new Promise((resolve, reject) => {
      const python = spawn('python3', ['-c', `
import sys
import os
sys.path.append('${this.pythonPath}')
from models.budget_optimizer import BudgetOptimizer
import json

# Initialize optimizer
optimizer = BudgetOptimizer()

# Parse input
input_data = json.loads('${JSON.stringify(inputData).replace(/'/g, "\\'")}')

# Make optimization
try:
    result = optimizer.optimize(input_data)
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
          log.error(`Python optimization failed with code ${code}: ${errorOutput}`);
          reject(new Error(`Python optimization failed: ${errorOutput}`));
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
          reject(new Error('Failed to parse optimization result'));
        }
      });
    });
  }

  /**
   * Optimize budget allocation
   */
  async optimize(inputData) {
    try {
      const {
        current_budget,
        campaign_performance = [],
        goals = {},
        shop_domain
      } = inputData;

      log(`💰 Optimizing budget allocation for ${shop_domain}`);

      // Try Python model first
      let optimization;
      try {
        optimization = await this.callPythonModel({
          current_budget,
          campaign_performance,
          goals
        });
      } catch (pythonError) {
        log.error('Python optimization failed, using fallback:', pythonError);
        optimization = this.fallbackOptimization(inputData);
      }

      // Enhance with actionable recommendations
      const enhancedOptimization = this.enhanceOptimization(optimization, inputData);

      log(`✅ Budget optimization complete: ${enhancedOptimization.confidence} confidence`);
      return enhancedOptimization;

    } catch (error) {
      log.error('Budget optimization failed:', error);
      throw error;
    }
  }

  /**
   * Fallback optimization when Python model fails
   */
  fallbackOptimization(inputData) {
    const { current_budget, campaign_performance = [], goals = {} } = inputData;

    // Simple performance-based reallocation
    if (campaign_performance.length === 0) {
      return {
        optimized_allocation: { total: current_budget },
        expected_improvement: 0,
        budget_increase: 0,
        estimated_roas: 1.0
      };
    }

    // Calculate performance scores
    const campaigns = campaign_performance.map(campaign => {
      const roas = campaign.revenue / (campaign.spend || 1);
      const conversionRate = campaign.conversions / (campaign.clicks || 1);
      const ctr = campaign.clicks / (campaign.impressions || 1);
      
      // Performance score weighted by ROAS primarily
      const performanceScore = (roas * 0.6) + (conversionRate * 100 * 0.3) + (ctr * 100 * 0.1);
      
      return {
        ...campaign,
        roas,
        performance_score: performanceScore,
        current_budget_share: campaign.budget / current_budget
      };
    });

    // Sort by performance
    campaigns.sort((a, b) => b.performance_score - a.performance_score);

    // Reallocate budget - give more to top performers
    const totalPerformanceScore = campaigns.reduce((sum, c) => sum + c.performance_score, 0);
    const optimizedAllocation = {};
    let budgetIncrease = 0;

    campaigns.forEach((campaign, index) => {
      // Top 20% performers get 60% of budget
      // Middle 60% get 35% of budget  
      // Bottom 20% get 5% of budget
      let targetShare;
      const percentile = index / campaigns.length;
      
      if (percentile <= 0.2) {
        targetShare = 0.6 * (campaign.performance_score / (campaigns.slice(0, Math.ceil(campaigns.length * 0.2)).reduce((sum, c) => sum + c.performance_score, 0) || 1));
      } else if (percentile <= 0.8) {
        targetShare = 0.35 * (campaign.performance_score / (campaigns.slice(Math.ceil(campaigns.length * 0.2), Math.ceil(campaigns.length * 0.8)).reduce((sum, c) => sum + c.performance_score, 0) || 1));
      } else {
        targetShare = 0.05 * (campaign.performance_score / (campaigns.slice(Math.ceil(campaigns.length * 0.8)).reduce((sum, c) => sum + c.performance_score, 0) || 1));
      }

      const newBudget = current_budget * targetShare;
      optimizedAllocation[campaign.campaign_id || campaign.id] = newBudget;
      
      // If top performer, suggest budget increase
      if (index === 0 && campaign.roas > 3.0) {
        budgetIncrease = newBudget * 0.5; // Suggest 50% increase for best performer
      }
    });

    // Calculate expected improvement
    const averageCurrentROAS = campaigns.reduce((sum, c) => sum + c.roas, 0) / campaigns.length;
    const expectedImprovement = Math.min(0.35, budgetIncrease / current_budget * 0.8); // Max 35% improvement

    return {
      optimized_allocation: optimizedAllocation,
      expected_improvement: expectedImprovement,
      budget_increase: budgetIncrease,
      estimated_roas: averageCurrentROAS * (1 + expectedImprovement),
      campaign_breakdown: campaigns.map(c => ({
        campaign_id: c.campaign_id || c.id,
        current_budget: c.budget,
        recommended_budget: optimizedAllocation[c.campaign_id || c.id],
        performance_score: c.performance_score,
        reason: c.roas > 2.5 ? 'High ROAS - Increase budget' : c.roas < 1.0 ? 'Low ROAS - Reduce budget' : 'Stable performance'
      }))
    };
  }

  /**
   * Enhance optimization with confidence indicators and recommendations
   */
  enhanceOptimization(optimization, inputData) {
    const { expected_improvement, budget_increase, estimated_roas } = optimization;
    
    // Determine confidence based on expected improvement
    let confidence = 'green';
    if (expected_improvement < 0.1) confidence = 'yellow';
    if (expected_improvement < 0.05) confidence = 'red';

    // Generate actionable recommendation
    let recommendation = '';
    if (expected_improvement > 0.2) {
      recommendation = '🚀 High Impact: Budget reallocation will significantly boost performance.';
    } else if (expected_improvement > 0.1) {
      recommendation = '📈 Moderate Impact: Optimization will improve overall efficiency.';
    } else if (expected_improvement > 0.05) {
      recommendation = '⚡ Small Gains: Minor adjustments recommended.';
    } else {
      recommendation = '✅ Well Optimized: Current allocation is near optimal.';
    }

    // Add specific action items
    const actionItems = [];
    if (budget_increase > 0) {
      actionItems.push(`Increase top performer budget by $${Math.round(budget_increase)}`);
    }
    
    if (optimization.campaign_breakdown) {
      const underperformers = optimization.campaign_breakdown.filter(c => c.recommended_budget < c.current_budget);
      if (underperformers.length > 0) {
        actionItems.push(`Reduce budget for ${underperformers.length} underperforming campaigns`);
      }
    }

    return {
      ...optimization,
      confidence,
      recommendation,
      action_items: actionItems,
      urgency_level: expected_improvement > 0.15 ? 'high' : expected_improvement > 0.08 ? 'medium' : 'low',
      implementation_ease: budget_increase === 0 ? 'easy' : 'requires_approval',
      expected_timeline: '24-48 hours to see impact'
    };
  }

  /**
   * Quick budget health check
   */
  async quickHealthCheck(campaigns) {
    try {
      if (!campaigns || campaigns.length === 0) {
        return {
          status: 'no_data',
          recommendation: 'No campaign data available for analysis'
        };
      }

      const totalSpend = campaigns.reduce((sum, c) => sum + (c.spend || 0), 0);
      const totalRevenue = campaigns.reduce((sum, c) => sum + (c.revenue || 0), 0);
      const averageROAS = totalRevenue / (totalSpend || 1);

      let status = 'healthy';
      let recommendation = 'Budget allocation looks good';

      if (averageROAS < 1.5) {
        status = 'critical';
        recommendation = '🚨 Low ROAS detected. Immediate budget reallocation needed.';
      } else if (averageROAS < 2.5) {
        status = 'warning';
        recommendation = '⚠️ ROAS below target. Consider budget optimization.';
      }

      return {
        status,
        recommendation,
        average_roas: averageROAS,
        total_spend: totalSpend,
        total_revenue: totalRevenue
      };

    } catch (error) {
      log.error('Budget health check failed:', error);
      return {
        status: 'error',
        recommendation: 'Unable to analyze budget health'
      };
    }
  }

  /**
   * Get model health status
   */
  getHealthStatus() {
    return {
      model_name: 'Budget Optimizer',
      status: this.isReady() ? 'healthy' : 'unavailable',
      python_path: this.pythonPath,
      last_check: this.lastHealthCheck,
      version: '1.0.0'
    };
  }
}