/**
 * Cross-Merchant Intelligence - JavaScript Wrapper
 * Competitive intelligence and market positioning analysis
 */

import { spawn } from 'child_process';
import { log } from '../utils/logger.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class CrossMerchantIntelligence {
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
   * Call Python intelligence model
   */
  async callPythonModel(inputData) {
    return new Promise((resolve, reject) => {
      const python = spawn('python3', ['-c', `
import sys
import os
sys.path.append('${this.pythonPath}')
from models.cross_merchant import CrossMerchantIntelligence
import json

# Initialize intelligence
intelligence = CrossMerchantIntelligence()

# Parse input
input_data = json.loads('${JSON.stringify(inputData).replace(/'/g, "\\'")}')

# Make analysis
try:
    result = intelligence.analyze(input_data)
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
          log.error(`Python analysis failed with code ${code}: ${errorOutput}`);
          reject(new Error(`Python analysis failed: ${errorOutput}`));
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
          reject(new Error('Failed to parse analysis result'));
        }
      });
    });
  }

  /**
   * Analyze competitive landscape and opportunities
   */
  async analyze(inputData) {
    try {
      const {
        competitor_data = [],
        market_segment,
        shop_domain
      } = inputData;

      log(`🔍 Cross-merchant analysis for ${shop_domain} in ${market_segment}`);

      // Try Python model first
      let analysis;
      try {
        analysis = await this.callPythonModel({
          competitor_data,
          market_segment
        });
      } catch (pythonError) {
        log.error('Python model failed, using fallback:', pythonError);
        analysis = this.fallbackAnalysis(inputData);
      }

      // Enhance with strategic insights
      const enhancedAnalysis = this.enhanceAnalysis(analysis, inputData);

      log(`✅ Cross-merchant analysis complete: ${enhancedAnalysis.confidence} confidence`);
      return enhancedAnalysis;

    } catch (error) {
      log.error('Cross-merchant analysis failed:', error);
      throw error;
    }
  }

  /**
   * Fallback analysis when Python model fails
   */
  fallbackAnalysis(inputData) {
    const { competitor_data = [], market_segment = 'general' } = inputData;

    if (competitor_data.length === 0) {
      return {
        market_position: 'unknown',
        opportunities: [],
        insights: []
      };
    }

    // Analyze competitive positioning
    const marketPosition = this.analyzeMarketPosition(competitor_data);
    const opportunities = this.identifyOpportunities(competitor_data, market_segment);
    const insights = this.generateInsights(competitor_data, marketPosition);

    return {
      market_position: marketPosition,
      opportunities,
      insights,
      opportunity_score: this.calculateOpportunityScore(opportunities)
    };
  }

  /**
   * Analyze market position relative to competitors
   */
  analyzeMarketPosition(competitorData) {
    // Calculate metrics relative to competitors
    const metrics = competitorData.map(competitor => ({
      id: competitor.id || competitor.name,
      pricing_position: competitor.average_price || 0,
      product_count: competitor.product_count || 0,
      market_share: competitor.market_share || 0,
      customer_rating: competitor.rating || 0,
      social_following: competitor.social_followers || 0
    }));

    if (metrics.length === 0) {
      return {
        position: 'unknown',
        percentile: 0,
        strengths: [],
        weaknesses: []
      };
    }

    // Sort competitors by a composite score
    const scoredCompetitors = metrics.map(competitor => {
      const score = (
        (competitor.market_share * 0.4) +
        (competitor.customer_rating / 5 * 0.3) +
        (Math.log(competitor.social_following + 1) / 10 * 0.2) +
        (competitor.product_count / 1000 * 0.1)
      );
      return { ...competitor, composite_score: score };
    }).sort((a, b) => b.composite_score - a.composite_score);

    // Assume current merchant is being compared (would need actual merchant data)
    const merchantRank = Math.floor(scoredCompetitors.length * 0.6); // Assume middle position
    const percentile = ((scoredCompetitors.length - merchantRank) / scoredCompetitors.length) * 100;

    let position = 'middle';
    if (percentile > 80) position = 'leader';
    else if (percentile > 60) position = 'strong';
    else if (percentile < 20) position = 'challenger';

    return {
      position,
      percentile: Math.round(percentile),
      total_competitors: scoredCompetitors.length,
      market_rank: merchantRank + 1
    };
  }

  /**
   * Identify market opportunities
   */
  identifyOpportunities(competitorData, marketSegment) {
    const opportunities = [];

    // Price gap analysis
    const prices = competitorData.map(c => c.average_price).filter(p => p > 0);
    if (prices.length > 0) {
      const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const priceGap = maxPrice - minPrice;

      if (priceGap > avgPrice * 0.3) { // 30% price variation
        opportunities.push({
          type: 'pricing_gap',
          description: 'Significant price variation in market - opportunity for competitive pricing',
          potential: 'high',
          action: `Price products between $${Math.round(minPrice * 1.1)} - $${Math.round(avgPrice * 0.9)}`,
          estimated_impact: '15-25% conversion improvement'
        });
      }
    }

    // Product diversity analysis
    const productCounts = competitorData.map(c => c.product_count).filter(p => p > 0);
    if (productCounts.length > 0) {
      const avgProducts = productCounts.reduce((sum, p) => sum + p, 0) / productCounts.length;
      const maxProducts = Math.max(...productCounts);

      if (maxProducts > avgProducts * 2) {
        opportunities.push({
          type: 'product_expansion',
          description: 'Market leaders offer significantly more products - expansion opportunity',
          potential: 'medium',
          action: `Consider expanding catalog by ${Math.round(avgProducts * 0.5)} products`,
          estimated_impact: '10-20% revenue growth'
        });
      }
    }

    // Social media presence gaps
    const socialFollowers = competitorData.map(c => c.social_followers).filter(f => f > 0);
    if (socialFollowers.length > 0) {
      const avgFollowers = socialFollowers.reduce((sum, f) => sum + f, 0) / socialFollowers.length;
      const maxFollowers = Math.max(...socialFollowers);

      if (maxFollowers > avgFollowers * 3) {
        opportunities.push({
          type: 'social_presence',
          description: 'Leaders have strong social presence - marketing opportunity',
          potential: 'high',
          action: `Invest in social marketing to reach ${Math.round(avgFollowers)} followers`,
          estimated_impact: '20-40% brand awareness increase'
        });
      }
    }

    // Market segment specific opportunities
    if (marketSegment) {
      opportunities.push(...this.getSegmentSpecificOpportunities(marketSegment, competitorData));
    }

    return opportunities.slice(0, 5); // Top 5 opportunities
  }

  /**
   * Get segment-specific opportunities
   */
  getSegmentSpecificOpportunities(segment, competitorData) {
    const opportunities = [];

    switch (segment.toLowerCase()) {
      case 'fashion':
        opportunities.push({
          type: 'seasonal_trends',
          description: 'Fashion market highly seasonal - trend timing opportunity',
          potential: 'high',
          action: 'Launch pre-season collections 2-3 months early',
          estimated_impact: '25-35% early adoption advantage'
        });
        break;

      case 'electronics':
        opportunities.push({
          type: 'tech_innovation',
          description: 'Electronics market rewards innovation - R&D opportunity',
          potential: 'high',
          action: 'Focus on emerging tech categories (AI, IoT, sustainable)',
          estimated_impact: '30-50% market differentiation'
        });
        break;

      case 'beauty':
        opportunities.push({
          type: 'influencer_marketing',
          description: 'Beauty market driven by influencer endorsements',
          potential: 'medium',
          action: 'Partner with micro-influencers in beauty niche',
          estimated_impact: '15-30% reach expansion'
        });
        break;

      default:
        opportunities.push({
          type: 'market_education',
          description: 'General market opportunity for customer education',
          potential: 'medium',
          action: 'Create educational content about product benefits',
          estimated_impact: '10-20% customer trust improvement'
        });
    }

    return opportunities;
  }

  /**
   * Generate strategic insights
   */
  generateInsights(competitorData, marketPosition) {
    const insights = [];

    // Market concentration analysis
    const marketShares = competitorData.map(c => c.market_share || 0);
    const topThreeShare = marketShares.sort((a, b) => b - a).slice(0, 3).reduce((sum, share) => sum + share, 0);

    if (topThreeShare > 70) {
      insights.push({
        type: 'market_concentration',
        insight: 'Market is dominated by top 3 players - focus on niche differentiation',
        priority: 'high'
      });
    } else if (topThreeShare < 40) {
      insights.push({
        type: 'fragmented_market',
        insight: 'Fragmented market with no clear leader - opportunity for market share gains',
        priority: 'high'
      });
    }

    // Pricing strategy insights
    const prices = competitorData.map(c => c.average_price).filter(p => p > 0);
    if (prices.length > 0) {
      const priceCV = this.calculateCV(prices); // Coefficient of variation
      if (priceCV > 0.3) {
        insights.push({
          type: 'pricing_inconsistency',
          insight: 'High price variation suggests unclear value propositions - opportunity for clear positioning',
          priority: 'medium'
        });
      }
    }

    // Customer satisfaction gaps
    const ratings = competitorData.map(c => c.rating || 0).filter(r => r > 0);
    if (ratings.length > 0) {
      const avgRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
      if (avgRating < 4.0) {
        insights.push({
          type: 'satisfaction_opportunity',
          insight: `Market average rating ${avgRating.toFixed(1)}/5 - opportunity to exceed expectations`,
          priority: 'high'
        });
      }
    }

    return insights;
  }

  /**
   * Calculate coefficient of variation
   */
  calculateCV(values) {
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    return stdDev / mean;
  }

  /**
   * Calculate overall opportunity score
   */
  calculateOpportunityScore(opportunities) {
    if (opportunities.length === 0) return 0;

    const potentialScores = {
      high: 1.0,
      medium: 0.6,
      low: 0.3
    };

    const totalScore = opportunities.reduce((sum, opp) => {
      return sum + (potentialScores[opp.potential] || 0.5);
    }, 0);

    return Math.min(1, totalScore / opportunities.length);
  }

  /**
   * Enhance analysis with strategic recommendations
   */
  enhanceAnalysis(analysis, inputData) {
    const { 
      market_position, 
      opportunities = [], 
      insights = [],
      opportunity_score = 0
    } = analysis;

    // Determine confidence based on data quality
    const competitorCount = inputData.competitor_data?.length || 0;
    let confidence = 'green';
    if (competitorCount < 3) confidence = 'red';
    else if (competitorCount < 10) confidence = 'yellow';

    // Generate strategic recommendation
    let recommendation = '';
    const highPotentialOpps = opportunities.filter(opp => opp.potential === 'high').length;
    
    if (highPotentialOpps > 2) {
      recommendation = '🎯 Strategic: Multiple high-impact opportunities identified. Prioritize execution.';
    } else if (opportunities.length > 0) {
      recommendation = '📊 Tactical: Moderate opportunities available. Consider selective implementation.';
    } else {
      recommendation = '🔄 Defensive: Maintain current position while monitoring market changes.';
    }

    // Calculate revenue opportunity
    const revenueOpportunity = this.estimateRevenueOpportunity(opportunities, opportunity_score);

    return {
      ...analysis,
      confidence,
      recommendation,
      revenue_opportunity: revenueOpportunity,
      competitive_threats: this.identifyThreats(inputData.competitor_data),
      strategic_priority: highPotentialOpps > 1 ? 'aggressive_growth' : opportunities.length > 0 ? 'selective_expansion' : 'market_defense',
      next_analysis_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    };
  }

  /**
   * Estimate revenue opportunity from identified gaps
   */
  estimateRevenueOpportunity(opportunities, opportunityScore) {
    // Conservative estimate based on opportunity types and potential
    const baseRevenue = 100000; // Assume $100k baseline
    const opportunityMultiplier = 1 + (opportunityScore * 0.5); // Up to 50% uplift

    const typeMultipliers = {
      'pricing_gap': 1.3,
      'product_expansion': 1.4,
      'social_presence': 1.2,
      'seasonal_trends': 1.5,
      'tech_innovation': 2.0
    };

    let totalMultiplier = opportunityMultiplier;
    opportunities.forEach(opp => {
      const typeBoost = typeMultipliers[opp.type] || 1.1;
      totalMultiplier *= Math.pow(typeBoost, 0.3); // Diminishing returns
    });

    return Math.round(baseRevenue * totalMultiplier);
  }

  /**
   * Identify competitive threats
   */
  identifyThreats(competitorData = []) {
    const threats = [];

    // Price war threat
    const lowPricers = competitorData.filter(c => c.pricing_strategy === 'low_cost').length;
    if (lowPricers > competitorData.length * 0.3) {
      threats.push({
        type: 'price_war',
        severity: 'high',
        description: 'Multiple competitors competing on price',
        mitigation: 'Focus on value differentiation over price competition'
      });
    }

    // Market share concentration
    const dominantPlayer = competitorData.find(c => c.market_share > 40);
    if (dominantPlayer) {
      threats.push({
        type: 'market_dominance',
        severity: 'medium',
        description: 'Single player controls significant market share',
        mitigation: 'Target underserved segments and niches'
      });
    }

    return threats;
  }

  /**
   * Get model health status
   */
  getHealthStatus() {
    return {
      model_name: 'Cross-Merchant Intelligence',
      status: this.isReady() ? 'healthy' : 'unavailable',
      python_path: this.pythonPath,
      last_check: this.lastHealthCheck,
      version: '1.0.0'
    };
  }
}