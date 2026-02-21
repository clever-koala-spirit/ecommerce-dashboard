import express from 'express';
import { getDB } from '../db/database.js';
import { requireShopAuth } from '../middleware/security.js';

const router = express.Router();

// Mock ML prediction responses (to be replaced with real ML models later)
const mockPredictions = {
  creative_fatigue: {
    confidence: 0.7,
    risk_level: 'medium',
    days_left: 5,
    recommendation: '⚠️ Warning: Creative showing fatigue signs. Prepare replacement creative.',
    action_button: {
      text: "Refresh Creative Now",
      priority: "high",
      estimated_impact: '+25% CTR improvement'
    }
  },
  budget_optimization: {
    confidence: 0.85,
    current_budget: 10000,
    optimized_budget: { total: 12400 },
    expected_improvement: 0.23,
    recommendation: '🚀 High Impact: Budget reallocation will significantly boost performance.',
    action_button: {
      text: "Increase Budget $2K",
      priority: "high", 
      estimated_roas: 3.7
    }
  },
  product_velocity: {
    confidence: 0.6,
    trend: 'stable',
    velocity_score: 0.12,
    recommendation: '📈 Moderate Priority: Product velocity stable but could improve with targeted campaigns.',
    action_button: {
      text: "Boost Product Campaigns",
      priority: "medium",
      estimated_conversion: '8-15%'
    }
  },
  cross_merchant: {
    confidence: 0.88,
    similarity_score: 0.92,
    benchmark_performance: 1.45,
    recommendation: '🎯 High Confidence: Similar merchants achieving 45% better performance. Strong optimization opportunity.',
    action_button: {
      text: "See Benchmark Report", 
      priority: "high",
      estimated_improvement: '30-45%'
    }
  }
};

// POST /api/predictions/creative-fatigue
router.post('/creative-fatigue', requireShopAuth, async (req, res) => {
  try {
    const { shopDomain } = req;
    const prediction = {
      ...mockPredictions.creative_fatigue,
      creative_id: req.body.creative_id || 'current_campaign',
      timestamp: new Date().toISOString(),
      shop_domain: shopDomain
    };
    res.json(prediction);
  } catch (error) {
    res.status(500).json({ error: 'Prediction service temporarily unavailable' });
  }
});

// POST /api/predictions/budget-optimization
router.post('/budget-optimization', requireShopAuth, async (req, res) => {
  try {
    const { shopDomain } = req;
    const prediction = {
      ...mockPredictions.budget_optimization,
      timestamp: new Date().toISOString(),
      shop_domain: shopDomain
    };
    res.json(prediction);
  } catch (error) {
    res.status(500).json({ error: 'Prediction service temporarily unavailable' });
  }
});

// POST /api/predictions/product-velocity
router.post('/product-velocity', requireShopAuth, async (req, res) => {
  try {
    const { shopDomain } = req;
    const prediction = {
      ...mockPredictions.product_velocity,
      timestamp: new Date().toISOString(), 
      shop_domain: shopDomain
    };
    res.json(prediction);
  } catch (error) {
    res.status(500).json({ error: 'Prediction service temporarily unavailable' });
  }
});

// POST /api/predictions/cross-merchant
router.post('/cross-merchant', requireShopAuth, async (req, res) => {
  try {
    const { shopDomain } = req;
    const prediction = {
      ...mockPredictions.cross_merchant,
      timestamp: new Date().toISOString(),
      shop_domain: shopDomain
    };
    res.json(prediction);
  } catch (error) {
    res.status(500).json({ error: 'Prediction service temporarily unavailable' });
  }
});

// GET /api/predictions - Get all predictions for dashboard
router.get('/', requireShopAuth, async (req, res) => {
  try {
    const { shopDomain } = req;
    const timestamp = new Date().toISOString();
    
    const allPredictions = {
      creative_fatigue: { ...mockPredictions.creative_fatigue, timestamp, shop_domain: shopDomain },
      budget_optimization: { ...mockPredictions.budget_optimization, timestamp, shop_domain: shopDomain },
      product_velocity: { ...mockPredictions.product_velocity, timestamp, shop_domain: shopDomain },
      cross_merchant: { ...mockPredictions.cross_merchant, timestamp, shop_domain: shopDomain }
    };
    
    res.json(allPredictions);
  } catch (error) {
    res.status(500).json({ error: 'Prediction service temporarily unavailable' });
  }
});

export default router;