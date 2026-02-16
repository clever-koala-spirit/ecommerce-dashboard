/**
 * Plan Gating Middleware
 * Checks if a shop has an active Shopify billing subscription before allowing access.
 */
import { getShopBillingStatus } from '../services/shopifyBilling.js';

/**
 * Require any active billing plan.
 */
export function requireActivePlan(req, res, next) {
  const shopDomain = req.shopDomain;
  if (!shopDomain) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const billing = getShopBillingStatus(shopDomain);
  if (!billing || billing.status !== 'active') {
    return res.status(402).json({
      error: 'Active subscription required',
      code: 'PLAN_REQUIRED',
      subscribePath: '/api/billing/subscribe',
    });
  }

  req.billingPlan = billing.plan;
  next();
}

/**
 * Require a specific plan tier or higher.
 * Tier order: starter < growth < scale
 */
const TIER_ORDER = { starter: 1, growth: 2, scale: 3 };

export function requirePlan(minimumPlan) {
  return (req, res, next) => {
    const shopDomain = req.shopDomain;
    if (!shopDomain) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const billing = getShopBillingStatus(shopDomain);
    if (!billing || billing.status !== 'active') {
      return res.status(402).json({
        error: 'Active subscription required',
        code: 'PLAN_REQUIRED',
      });
    }

    const currentTier = TIER_ORDER[billing.plan] || 0;
    const requiredTier = TIER_ORDER[minimumPlan] || 0;

    if (currentTier < requiredTier) {
      return res.status(403).json({
        error: `This feature requires the ${minimumPlan} plan or higher`,
        code: 'PLAN_UPGRADE_REQUIRED',
        currentPlan: billing.plan,
        requiredPlan: minimumPlan,
      });
    }

    req.billingPlan = billing.plan;
    next();
  };
}

export default { requireActivePlan, requirePlan };
