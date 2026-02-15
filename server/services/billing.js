/**
 * Stripe Billing Service
 * Handles subscriptions, payments, and billing management
 */
import Stripe from 'stripe';
import { log } from '../utils/logger.js';

class BillingService {
  constructor() {
    // Pricing configuration (set before early return so getPricingPlans works)
    this.prices = {
      starter: process.env.STRIPE_PRICE_STARTER || 'price_starter',
      growth: process.env.STRIPE_PRICE_GROWTH || 'price_growth', 
      scale: process.env.STRIPE_PRICE_SCALE || 'price_scale'
    };

    if (!process.env.STRIPE_SECRET_KEY) {
      log.warn('Stripe billing service initialized without STRIPE_SECRET_KEY');
      this.stripe = null;
      return;
    }

    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    
    log.info('Stripe billing service initialized', { 
      pricesConfigured: Object.keys(this.prices).length 
    });
  }

  /**
   * Check if Stripe is properly configured
   */
  isConfigured() {
    return !!this.stripe;
  }

  /**
   * Create a new Stripe customer
   */
  async createCustomer(email, name, shopDomain, metadata = {}) {
    if (!this.isConfigured()) {
      throw new Error('Stripe not configured');
    }

    try {
      const customer = await this.stripe.customers.create({
        email,
        name,
        metadata: {
          shopDomain,
          source: 'slay_season_dashboard',
          ...metadata
        }
      });

      log.billing('customer_created', {
        customerId: customer.id,
        shopDomain,
        email: email.replace(/(..).*(@.*)/, '$1***$2') // Mask email
      });

      return customer;
    } catch (error) {
      log.error('Failed to create Stripe customer', error, { shopDomain, email: email.replace(/(..).*(@.*)/, '$1***$2') });
      throw new Error(`Customer creation failed: ${error.message}`);
    }
  }

  /**
   * Create a subscription for a customer
   */
  async createSubscription(customerId, priceId, paymentMethodId = null, trial = false) {
    if (!this.isConfigured()) {
      throw new Error('Stripe not configured');
    }

    try {
      const subscriptionData = {
        customer: customerId,
        items: [{ price: priceId }],
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          source: 'slay_season_dashboard'
        }
      };

      // Add payment method if provided
      if (paymentMethodId) {
        subscriptionData.default_payment_method = paymentMethodId;
        subscriptionData.payment_behavior = 'default_incomplete';
      }

      // Add trial if requested
      if (trial) {
        subscriptionData.trial_period_days = 14; // 14-day free trial
      }

      const subscription = await this.stripe.subscriptions.create(subscriptionData);

      log.billing('subscription_created', {
        subscriptionId: subscription.id,
        customerId,
        priceId,
        status: subscription.status,
        trial
      });

      return subscription;
    } catch (error) {
      log.error('Failed to create subscription', error, { customerId, priceId });
      throw new Error(`Subscription creation failed: ${error.message}`);
    }
  }

  /**
   * Update a subscription (change plan)
   */
  async updateSubscription(subscriptionId, newPriceId) {
    if (!this.isConfigured()) {
      throw new Error('Stripe not configured');
    }

    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
      
      const updated = await this.stripe.subscriptions.update(subscriptionId, {
        items: [{
          id: subscription.items.data[0].id,
          price: newPriceId,
        }],
        proration_behavior: 'create_prorations'
      });

      log.billing('subscription_updated', {
        subscriptionId,
        oldPriceId: subscription.items.data[0].price.id,
        newPriceId,
        customerId: subscription.customer
      });

      return updated;
    } catch (error) {
      log.error('Failed to update subscription', error, { subscriptionId, newPriceId });
      throw new Error(`Subscription update failed: ${error.message}`);
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId, immediately = false) {
    if (!this.isConfigured()) {
      throw new Error('Stripe not configured');
    }

    try {
      const subscription = immediately
        ? await this.stripe.subscriptions.cancel(subscriptionId)
        : await this.stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: true
          });

      log.billing('subscription_cancelled', {
        subscriptionId,
        customerId: subscription.customer,
        immediately,
        cancellationDate: immediately ? new Date().toISOString() : new Date(subscription.current_period_end * 1000).toISOString()
      });

      return subscription;
    } catch (error) {
      log.error('Failed to cancel subscription', error, { subscriptionId });
      throw new Error(`Subscription cancellation failed: ${error.message}`);
    }
  }

  /**
   * Get subscription details
   */
  async getSubscription(subscriptionId) {
    if (!this.isConfigured()) {
      throw new Error('Stripe not configured');
    }

    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId, {
        expand: ['customer', 'items.data.price.product']
      });

      return {
        id: subscription.id,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        customer: subscription.customer,
        plan: subscription.items.data[0].price,
        trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null
      };
    } catch (error) {
      log.error('Failed to retrieve subscription', error, { subscriptionId });
      throw new Error(`Subscription retrieval failed: ${error.message}`);
    }
  }

  /**
   * Create a checkout session for new subscriptions
   */
  async createCheckoutSession(priceId, customerEmail, shopDomain, successUrl, cancelUrl) {
    if (!this.isConfigured()) {
      throw new Error('Stripe not configured');
    }

    try {
      const session = await this.stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        customer_email: customerEmail,
        success_url: successUrl,
        cancel_url: cancelUrl,
        allow_promotion_codes: true,
        billing_address_collection: 'required',
        metadata: {
          shopDomain,
          source: 'slay_season_dashboard'
        },
        subscription_data: {
          trial_period_days: 14, // 14-day free trial
          metadata: {
            shopDomain,
            source: 'slay_season_dashboard'
          }
        }
      });

      log.billing('checkout_session_created', {
        sessionId: session.id,
        priceId,
        customerEmail: customerEmail.replace(/(..).*(@.*)/, '$1***$2'),
        shopDomain
      });

      return session;
    } catch (error) {
      log.error('Failed to create checkout session', error, { priceId, shopDomain });
      throw new Error(`Checkout session creation failed: ${error.message}`);
    }
  }

  /**
   * Create a billing portal session for subscription management
   */
  async createPortalSession(customerId, returnUrl) {
    if (!this.isConfigured()) {
      throw new Error('Stripe not configured');
    }

    try {
      const session = await this.stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });

      log.billing('portal_session_created', {
        sessionId: session.id,
        customerId
      });

      return session;
    } catch (error) {
      log.error('Failed to create portal session', error, { customerId });
      throw new Error(`Portal session creation failed: ${error.message}`);
    }
  }

  /**
   * Handle Stripe webhook events
   */
  async handleWebhook(rawBody, signature) {
    if (!this.isConfigured()) {
      throw new Error('Stripe not configured');
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('Stripe webhook secret not configured');
    }

    try {
      const event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

      log.billing('webhook_received', {
        eventId: event.id,
        eventType: event.type
      });

      switch (event.type) {
        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object);
          break;
        
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object);
          break;
        
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object);
          break;
        
        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object);
          break;
        
        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object);
          break;
        
        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(event.data.object);
          break;
        
        default:
          log.info(`Unhandled webhook event: ${event.type}`);
      }

      return { received: true, eventType: event.type };
    } catch (error) {
      log.error('Webhook processing failed', error);
      throw new Error(`Webhook processing failed: ${error.message}`);
    }
  }

  // Webhook event handlers (implement based on your business logic)
  async handleSubscriptionCreated(subscription) {
    log.billing('webhook_subscription_created', {
      subscriptionId: subscription.id,
      customerId: subscription.customer
    });
    // TODO: Update shop's billing status in database
  }

  async handleSubscriptionUpdated(subscription) {
    log.billing('webhook_subscription_updated', {
      subscriptionId: subscription.id,
      customerId: subscription.customer,
      status: subscription.status
    });
    // TODO: Update shop's billing status in database
  }

  async handleSubscriptionDeleted(subscription) {
    log.billing('webhook_subscription_deleted', {
      subscriptionId: subscription.id,
      customerId: subscription.customer
    });
    // TODO: Handle subscription cancellation in database
  }

  async handlePaymentSucceeded(invoice) {
    log.billing('webhook_payment_succeeded', {
      invoiceId: invoice.id,
      customerId: invoice.customer,
      amount: invoice.amount_paid
    });
    // TODO: Update payment history in database
  }

  async handlePaymentFailed(invoice) {
    log.billing('webhook_payment_failed', {
      invoiceId: invoice.id,
      customerId: invoice.customer,
      amount: invoice.amount_due
    });
    // TODO: Handle failed payment (send notification, restrict access)
  }

  async handleCheckoutCompleted(session) {
    log.billing('webhook_checkout_completed', {
      sessionId: session.id,
      customerId: session.customer,
      subscriptionId: session.subscription
    });
    // TODO: Activate subscription and update shop status
  }

  /**
   * Get usage statistics for billing
   */
  async getUsageStats(shopDomain, startDate, endDate) {
    // TODO: Calculate usage-based metrics for billing
    // - API requests
    // - Data storage
    // - Active integrations
    // - Custom reports generated
    
    return {
      apiRequests: 0,
      dataStorage: 0,
      integrations: 0,
      reports: 0,
      period: { start: startDate, end: endDate }
    };
  }

  /**
   * Get available pricing plans
   */
  getPricingPlans() {
    return [
      {
        id: 'starter',
        name: 'Starter',
        priceId: this.prices.starter,
        monthlyPrice: 49,
        features: ['Up to $50k monthly revenue', 'Basic analytics', 'Email support'],
        limits: { revenue: 50000, integrations: 3 }
      },
      {
        id: 'growth',
        name: 'Growth',
        priceId: this.prices.growth,
        monthlyPrice: 149,
        features: ['Up to $250k monthly revenue', 'Advanced analytics', 'Priority support', 'Custom reports'],
        limits: { revenue: 250000, integrations: 10 }
      },
      {
        id: 'scale',
        name: 'Scale',
        priceId: this.prices.scale,
        monthlyPrice: 399,
        features: ['Unlimited revenue', 'AI insights & forecasting', 'Dedicated support', 'API access', 'Custom integrations'],
        limits: { revenue: -1, integrations: -1 } // unlimited
      }
    ];
  }
}

export { BillingService };
export default new BillingService();