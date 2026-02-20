/**
 * Creative Fatigue Prediction Model - JavaScript Wrapper
 * Predicts when ad creatives will hit performance fatigue
 */

import { spawn } from 'child_process';
import { promisify } from 'util';
import { log } from '../utils/logger.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class CreativeFatiguePredictor {
  constructor() {
    this.pythonPath = path.join(__dirname, '../../../slay-season-predictions');
    this.ready = false;
    this.lastHealthCheck = null;
  }

  /**
   * Check if model is ready for predictions
   */
  isReady() {
    // Simple health check - return cached status if recent
    if (this.lastHealthCheck && Date.now() - this.lastHealthCheck < 60000) {
      return this.ready;
    }
    
    // For now, assume ready. In production, you'd ping the Python service
    this.ready = true;
    this.lastHealthCheck = Date.now();
    return this.ready;
  }

  /**
   * Call Python prediction model
   */
  async callPythonModel(inputData) {
    return new Promise((resolve, reject) => {
      const pythonScript = path.join(this.pythonPath, 'models/creative_fatigue.py');
      const python = spawn('python3', ['-c', `
import sys
import os
sys.path.append('${this.pythonPath}')
from models.creative_fatigue import CreativeFatiguePredictor
import json

# Initialize predictor
predictor = CreativeFatiguePredictor()

# Parse input
input_data = json.loads('${JSON.stringify(inputData).replace(/'/g, "\\'")}')

# Make prediction
try:
    result = predictor.predict(input_data)
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
          log.error(`Python script failed with code ${code}: ${errorOutput}`);
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
          log.error('Failed to parse Python output:', parseError, 'Output:', output);
          reject(new Error('Failed to parse prediction result'));
        }
      });
    });
  }

  /**
   * Predict creative fatigue with fallback logic
   */
  async predict(inputData) {
    try {
      const {
        creative_id,
        campaign_data = {},
        historical_performance = [],
        shop_domain
      } = inputData;

      log(`🎨 Predicting creative fatigue for ${creative_id}`);

      // Try Python model first
      let prediction;
      try {
        prediction = await this.callPythonModel({
          creative_id,
          campaign_data,
          historical_performance
        });
      } catch (pythonError) {
        log.error('Python model failed, using fallback:', pythonError);
        prediction = this.fallbackPrediction(inputData);
      }

      // Enhance with confidence scoring
      const enhancedPrediction = this.enhancePrediction(prediction, inputData);

      log(`✅ Creative fatigue prediction complete: ${enhancedPrediction.confidence} confidence`);
      return enhancedPrediction;

    } catch (error) {
      log.error('Creative fatigue prediction failed:', error);
      throw error;
    }
  }

  /**
   * Fallback prediction when Python model fails
   */
  fallbackPrediction(inputData) {
    const { campaign_data = {}, historical_performance = [] } = inputData;

    // Simple heuristic-based prediction
    let fatigueScore = 0;
    let confidence = 'yellow'; // Default to medium confidence
    let daysRemaining = 30;

    // Calculate fatigue based on available data
    if (historical_performance.length > 0) {
      const recent = historical_performance.slice(-7); // Last 7 days
      const older = historical_performance.slice(-14, -7); // Previous 7 days

      if (recent.length > 0 && older.length > 0) {
        const recentAvgCTR = recent.reduce((sum, day) => sum + (day.ctr || 0), 0) / recent.length;
        const olderAvgCTR = older.reduce((sum, day) => sum + (day.ctr || 0), 0) / older.length;
        
        const ctrDecline = (olderAvgCTR - recentAvgCTR) / olderAvgCTR;
        
        if (ctrDecline > 0.3) {
          fatigueScore = 0.8;
          confidence = 'red';
          daysRemaining = 2;
        } else if (ctrDecline > 0.15) {
          fatigueScore = 0.6;
          confidence = 'yellow';
          daysRemaining = 7;
        } else {
          fatigueScore = 0.3;
          confidence = 'green';
          daysRemaining = 21;
        }
      }
    }

    // Factor in campaign age
    const daysRunning = campaign_data.days_running || 0;
    if (daysRunning > 14) {
      fatigueScore += 0.1;
      daysRemaining = Math.max(1, daysRemaining - 5);
    }

    return {
      fatigue_score: Math.min(1, fatigueScore),
      days_remaining: daysRemaining,
      ctr_decline: fatigueScore > 0.5,
      estimated_impact: fatigueScore * 0.4 // 40% performance drop at max fatigue
    };
  }

  /**
   * Enhance prediction with confidence indicators and recommendations
   */
  enhancePrediction(prediction, inputData) {
    const { fatigue_score, days_remaining } = prediction;
    
    // Determine confidence color (traffic light system)
    let confidence = 'green';
    if (fatigue_score > 0.7) confidence = 'red';
    else if (fatigue_score > 0.4) confidence = 'yellow';

    // Generate actionable recommendation
    let recommendation = '';
    if (fatigue_score > 0.7) {
      recommendation = '🚨 Critical: Creative is fatigued. Replace immediately to prevent performance drop.';
    } else if (fatigue_score > 0.4) {
      recommendation = '⚠️ Warning: Creative showing fatigue signs. Prepare replacement creative.';
    } else {
      recommendation = '✅ Healthy: Creative performing well. Monitor for changes.';
    }

    // Calculate estimated impact
    const estimatedImpact = {
      ctr_improvement: fatigue_score > 0.5 ? '+25-40%' : '+10-20%',
      cost_savings: fatigue_score > 0.5 ? '15-30%' : '5-15%',
      conversion_lift: fatigue_score > 0.5 ? '+20-35%' : '+8-18%'
    };

    return {
      ...prediction,
      confidence,
      recommendation,
      estimated_impact: estimatedImpact,
      urgency_level: fatigue_score > 0.7 ? 'high' : fatigue_score > 0.4 ? 'medium' : 'low',
      next_check_hours: fatigue_score > 0.7 ? 6 : fatigue_score > 0.4 ? 24 : 72
    };
  }

  /**
   * Batch predict multiple creatives
   */
  async predictBatch(creatives) {
    const results = [];
    
    for (const creative of creatives) {
      try {
        const prediction = await this.predict(creative);
        results.push({
          creative_id: creative.creative_id,
          ...prediction
        });
      } catch (error) {
        log.error(`Failed to predict creative ${creative.creative_id}:`, error);
        results.push({
          creative_id: creative.creative_id,
          error: 'Prediction failed',
          confidence: 'low'
        });
      }
    }

    return results;
  }

  /**
   * Get model health status
   */
  getHealthStatus() {
    return {
      model_name: 'Creative Fatigue Predictor',
      status: this.isReady() ? 'healthy' : 'unavailable',
      python_path: this.pythonPath,
      last_check: this.lastHealthCheck,
      version: '1.0.0'
    };
  }
}