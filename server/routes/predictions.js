const express = require('express');
const router = express.Router();
const logger = require('winston');

// Import ML models
const { BudgetOptimizer } = require('../ml/models/budget_optimizer');
const { CustomerPurchase } = require('../ml/models/customer_purchase');
const { ProductVelocity } = require('../ml/models/product_velocity');
const { CreativeFatigue } = require('../ml/models/creative_fatigue');
const { CrossMerchant } = require('../ml/models/cross_merchant');

// Import JARVIS components for failover
const ErrorRecovery = require('../jarvis/recovery/ErrorRecovery');
const ContextManager = require('../jarvis/context/ContextManager');

// Import Pentagon security
const securityMiddleware = require('../security/middleware/security');

// Initialize ML models
const budgetOptimizer = new BudgetOptimizer();
const customerPurchase = new CustomerPurchase();
const productVelocity = new ProductVelocity();
const creativeFatigue = new CreativeFatigue();
const crossMerchant = new CrossMerchant();

// Initialize JARVIS components
const errorRecovery = new ErrorRecovery();
const contextManager = new ContextManager();

// Apply security middleware to all prediction routes
router.use(securityMiddleware.authenticate);
router.use(securityMiddleware.rateLimit);
router.use(securityMiddleware.inputValidation);

// Budget Optimization Prediction
router.post('/budget-optimize', async (req, res) => {
    try {
        const context = await contextManager.createContext(req);
        const { budget, metrics, timeframe } = req.body;
        
        const prediction = await budgetOptimizer.optimize({
            budget,
            metrics,
            timeframe,
            context: context.data
        });
        
        logger.info('Budget optimization prediction completed', { 
            userId: req.user?.id, 
            prediction: prediction.summary 
        });
        
        res.json({
            success: true,
            prediction,
            recommendations: prediction.recommendations,
            confidence: prediction.confidence
        });
        
    } catch (error) {
        const recovery = await errorRecovery.handleError(error, {
            route: 'budget-optimize',
            fallback: 'basic_budget_calculation'
        });
        
        if (recovery.resolved) {
            res.json(recovery.result);
        } else {
            logger.error('Budget optimization failed', { error: error.message });
            res.status(500).json({
                success: false,
                error: 'Prediction service temporarily unavailable',
                fallback: true
            });
        }
    }
});

// Customer Purchase Prediction
router.post('/customer-purchase', async (req, res) => {
    try {
        const context = await contextManager.createContext(req);
        const { customerId, productId, features } = req.body;
        
        const prediction = await customerPurchase.predict({
            customerId,
            productId,
            features,
            context: context.data
        });
        
        logger.info('Customer purchase prediction completed', { 
            customerId, 
            productId,
            probability: prediction.probability 
        });
        
        res.json({
            success: true,
            prediction,
            probability: prediction.probability,
            factors: prediction.influencing_factors,
            recommendations: prediction.recommendations
        });
        
    } catch (error) {
        const recovery = await errorRecovery.handleError(error, {
            route: 'customer-purchase',
            fallback: 'average_conversion_rate'
        });
        
        if (recovery.resolved) {
            res.json(recovery.result);
        } else {
            logger.error('Customer purchase prediction failed', { error: error.message });
            res.status(500).json({
                success: false,
                error: 'Prediction service temporarily unavailable',
                fallback: true
            });
        }
    }
});

// Product Velocity Prediction
router.post('/product-velocity', async (req, res) => {
    try {
        const context = await contextManager.createContext(req);
        const { productId, timeframe, marketFactors } = req.body;
        
        const prediction = await productVelocity.predict({
            productId,
            timeframe,
            marketFactors,
            context: context.data
        });
        
        logger.info('Product velocity prediction completed', { 
            productId,
            predicted_sales: prediction.predicted_sales 
        });
        
        res.json({
            success: true,
            prediction,
            velocity: prediction.velocity_score,
            forecast: prediction.sales_forecast,
            trends: prediction.trend_analysis
        });
        
    } catch (error) {
        const recovery = await errorRecovery.handleError(error, {
            route: 'product-velocity',
            fallback: 'historical_average'
        });
        
        if (recovery.resolved) {
            res.json(recovery.result);
        } else {
            logger.error('Product velocity prediction failed', { error: error.message });
            res.status(500).json({
                success: false,
                error: 'Prediction service temporarily unavailable',
                fallback: true
            });
        }
    }
});

// Creative Fatigue Analysis
router.post('/creative-fatigue', async (req, res) => {
    try {
        const context = await contextManager.createContext(req);
        const { campaignId, creativeAssets, performanceData } = req.body;
        
        const analysis = await creativeFatigue.analyze({
            campaignId,
            creativeAssets,
            performanceData,
            context: context.data
        });
        
        logger.info('Creative fatigue analysis completed', { 
            campaignId,
            fatigue_score: analysis.fatigue_score 
        });
        
        res.json({
            success: true,
            analysis,
            fatigue_score: analysis.fatigue_score,
            recommendations: analysis.recommendations,
            refresh_priority: analysis.refresh_priority
        });
        
    } catch (error) {
        const recovery = await errorRecovery.handleError(error, {
            route: 'creative-fatigue',
            fallback: 'performance_trend_analysis'
        });
        
        if (recovery.resolved) {
            res.json(recovery.result);
        } else {
            logger.error('Creative fatigue analysis failed', { error: error.message });
            res.status(500).json({
                success: false,
                error: 'Analysis service temporarily unavailable',
                fallback: true
            });
        }
    }
});

// Cross-Merchant Insights
router.post('/cross-merchant', async (req, res) => {
    try {
        const context = await contextManager.createContext(req);
        const { merchantId, category, benchmarkRequest } = req.body;
        
        const insights = await crossMerchant.analyze({
            merchantId,
            category,
            benchmarkRequest,
            context: context.data
        });
        
        logger.info('Cross-merchant analysis completed', { 
            merchantId,
            category,
            benchmark_score: insights.benchmark_score 
        });
        
        res.json({
            success: true,
            insights,
            benchmark: insights.benchmark_data,
            opportunities: insights.opportunities,
            competitive_analysis: insights.competitive_analysis
        });
        
    } catch (error) {
        const recovery = await errorRecovery.handleError(error, {
            route: 'cross-merchant',
            fallback: 'industry_averages'
        });
        
        if (recovery.resolved) {
            res.json(recovery.result);
        } else {
            logger.error('Cross-merchant analysis failed', { error: error.message });
            res.status(500).json({
                success: false,
                error: 'Analysis service temporarily unavailable',
                fallback: true
            });
        }
    }
});

// Health check endpoint
router.get('/health', async (req, res) => {
    try {
        const modelStatus = {
            budget_optimizer: await budgetOptimizer.health(),
            customer_purchase: await customerPurchase.health(),
            product_velocity: await productVelocity.health(),
            creative_fatigue: await creativeFatigue.health(),
            cross_merchant: await crossMerchant.health()
        };
        
        const jarvisStatus = {
            error_recovery: errorRecovery.isHealthy(),
            context_manager: contextManager.isHealthy()
        };
        
        res.json({
            success: true,
            models: modelStatus,
            jarvis: jarvisStatus,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        logger.error('Health check failed', { error: error.message });
        res.status(503).json({
            success: false,
            error: 'Health check failed'
        });
    }
});

export default router;