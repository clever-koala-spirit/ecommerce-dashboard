/**
 * Billing API Routes
 * Handles Stripe subscriptions + Shopify Billing API
 */
import express from 'express';
import billingService from '../services/billing.js';
import shopifyBilling from '../services/shopifyBilling.js';
import { decrypt } from '../db/database.js';
import { log } from '../utils/logger.js';
import {
  validateCreateSubscription,
  validateUpdateSubscription,
} from '../middleware/validation.js';

const router = express.Router();

/**
 * GET /api/billing/plans
 * Get available pricing plans
 */
router.get('/plans', (req, res) => {
  try {
    const plans = billingService.getPricingPlans();
    res.json({
      success: true,
      plans,
      configured: billingService.isConfigured()
    });
  } catch (error) {
    log.error('Failed to get pricing plans', error, { shopDomain: req.shopDomain });
    res.status(500).json({ 
      error: 'Failed to retrieve pricing plans',
      configured: billingService.isConfigured()
    });
  }
});

/**
 * POST /api/billing/checkout-session
 * Create a Stripe checkout session for new subscription
 */
router.post('/checkout-session', validateCreateSubscription, async (req, res) => {
  try {
    const { priceId, trial } = req.body;
    const { shopDomain, shopData } = req;

    if (!billingService.isConfigured()) {
      return res.status(503).json({ 
        error: 'Billing service not configured',
        configured: false
      });
    }

    // Generate success and cancel URLs
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const successUrl = `${baseUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/billing/cancel`;

    const session = await billingService.createCheckoutSession(
      priceId,
      shopData.shopEmail || `${shopDomain.split('.')[0]}@example.com`,
      shopDomain,
      successUrl,
      cancelUrl
    );

    log.billing('checkout_session_requested', {
      shopDomain,
      priceId,
      sessionId: session.id,
      trial
    });

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url,
      configured: true
    });
  } catch (error) {
    log.error('Failed to create checkout session', error, { 
      shopDomain: req.shopDomain,
      priceId: req.body.priceId
    });
    res.status(500).json({ 
      error: error.message,
      configured: billingService.isConfigured()
    });
  }
});

/**
 * POST /api/billing/create-subscription
 * Create a subscription directly (with payment method)
 */
router.post('/create-subscription', validateCreateSubscription, async (req, res) => {
  try {
    const { priceId, paymentMethodId, trial } = req.body;
    const { shopDomain, shopData } = req;

    if (!billingService.isConfigured()) {
      return res.status(503).json({ 
        error: 'Billing service not configured',
        configured: false
      });
    }

    // First, create or get customer
    let customer;
    try {
      customer = await billingService.createCustomer(
        shopData.shopEmail || `${shopDomain.split('.')[0]}@example.com`,
        shopData.shopName || shopDomain,
        shopDomain
      );
    } catch (error) {
      log.error('Failed to create customer', error, { shopDomain });
      return res.status(400).json({ error: 'Customer creation failed' });
    }

    // Create subscription
    const subscription = await billingService.createSubscription(
      customer.id,
      priceId,
      paymentMethodId,
      trial
    );

    log.billing('subscription_created_direct', {
      shopDomain,
      subscriptionId: subscription.id,
      customerId: customer.id,
      priceId
    });

    res.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        clientSecret: subscription.latest_invoice?.payment_intent?.client_secret
      },
      customer: {
        id: customer.id
      },
      configured: true
    });
  } catch (error) {
    log.error('Failed to create subscription', error, { 
      shopDomain: req.shopDomain,
      priceId: req.body.priceId
    });
    res.status(500).json({ 
      error: error.message,
      configured: billingService.isConfigured()
    });
  }
});

/**
 * PUT /api/billing/subscription/:subscriptionId
 * Update existing subscription (change plan)
 */
router.put('/subscription/:subscriptionId', validateUpdateSubscription, async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { priceId } = req.body;
    const { shopDomain } = req;

    if (!billingService.isConfigured()) {
      return res.status(503).json({ 
        error: 'Billing service not configured',
        configured: false
      });
    }

    const subscription = await billingService.updateSubscription(subscriptionId, priceId);

    log.billing('subscription_updated_via_api', {
      shopDomain,
      subscriptionId,
      newPriceId: priceId
    });

    res.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status
      },
      configured: true
    });
  } catch (error) {
    log.error('Failed to update subscription', error, { 
      shopDomain: req.shopDomain,
      subscriptionId: req.params.subscriptionId
    });
    res.status(500).json({ 
      error: error.message,
      configured: billingService.isConfigured()
    });
  }
});

/**
 * DELETE /api/billing/subscription/:subscriptionId
 * Cancel subscription
 */
router.delete('/subscription/:subscriptionId', async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { immediately } = req.query;
    const { shopDomain } = req;

    if (!billingService.isConfigured()) {
      return res.status(503).json({ 
        error: 'Billing service not configured',
        configured: false
      });
    }

    const subscription = await billingService.cancelSubscription(
      subscriptionId, 
      immediately === 'true'
    );

    log.billing('subscription_cancelled_via_api', {
      shopDomain,
      subscriptionId,
      immediately: immediately === 'true'
    });

    res.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      },
      configured: true
    });
  } catch (error) {
    log.error('Failed to cancel subscription', error, { 
      shopDomain: req.shopDomain,
      subscriptionId: req.params.subscriptionId
    });
    res.status(500).json({ 
      error: error.message,
      configured: billingService.isConfigured()
    });
  }
});

/**
 * GET /api/billing/subscription/:subscriptionId
 * Get subscription details
 */
router.get('/subscription/:subscriptionId', async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { shopDomain } = req;

    if (!billingService.isConfigured()) {
      return res.status(503).json({ 
        error: 'Billing service not configured',
        configured: false
      });
    }

    const subscription = await billingService.getSubscription(subscriptionId);

    res.json({
      success: true,
      subscription,
      configured: true
    });
  } catch (error) {
    log.error('Failed to get subscription', error, { 
      shopDomain: req.shopDomain,
      subscriptionId: req.params.subscriptionId
    });
    res.status(500).json({ 
      error: error.message,
      configured: billingService.isConfigured()
    });
  }
});

/**
 * POST /api/billing/portal-session
 * Create billing portal session for subscription management
 */
router.post('/portal-session', async (req, res) => {
  try {
    const { customerId } = req.body;
    const { shopDomain } = req;

    if (!customerId) {
      return res.status(400).json({ error: 'Customer ID is required' });
    }

    if (!billingService.isConfigured()) {
      return res.status(503).json({ 
        error: 'Billing service not configured',
        configured: false
      });
    }

    const returnUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const session = await billingService.createPortalSession(customerId, `${returnUrl}/billing`);

    log.billing('portal_session_created', {
      shopDomain,
      customerId,
      sessionId: session.id
    });

    res.json({
      success: true,
      url: session.url,
      configured: true
    });
  } catch (error) {
    log.error('Failed to create portal session', error, { 
      shopDomain: req.shopDomain,
      customerId: req.body.customerId
    });
    res.status(500).json({ 
      error: error.message,
      configured: billingService.isConfigured()
    });
  }
});

/**
 * GET /api/billing/usage
 * Get usage statistics for current billing period
 */
router.get('/usage', async (req, res) => {
  try {
    const { shopDomain } = req;
    const { start, end } = req.query;

    if (!billingService.isConfigured()) {
      return res.status(503).json({ 
        error: 'Billing service not configured',
        configured: false
      });
    }

    // Default to current month if dates not provided
    const startDate = start || new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endDate = end || new Date();

    const usage = await billingService.getUsageStats(shopDomain, startDate, endDate);

    res.json({
      success: true,
      usage,
      configured: true
    });
  } catch (error) {
    log.error('Failed to get usage stats', error, { shopDomain: req.shopDomain });
    res.status(500).json({ 
      error: error.message,
      configured: billingService.isConfigured()
    });
  }
});

/**
 * POST /api/billing/webhook
 * Handle Stripe webhooks (separate endpoint, no auth required)
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    
    if (!signature) {
      return res.status(400).json({ error: 'Missing Stripe signature' });
    }

    if (!billingService.isConfigured()) {
      return res.status(503).json({ error: 'Billing service not configured' });
    }

    const result = await billingService.handleWebhook(req.body, signature);

    log.billing('webhook_processed', {
      eventType: result.eventType,
      success: result.received
    });

    res.json(result);
  } catch (error) {
    log.error('Webhook processing failed', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/billing/status
 * Get billing service status and configuration
 */
router.get('/status', (req, res) => {
  res.json({
    configured: billingService.isConfigured(),
    plans: billingService.getPricingPlans().length,
    webhookEndpoint: '/api/billing/webhook',
    environment: process.env.NODE_ENV || 'development'
  });
});

export default router;