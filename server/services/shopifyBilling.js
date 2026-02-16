/**
 * Shopify Billing Service
 * Handles subscriptions via Shopify GraphQL Admin API (2024-10)
 */
import { getDB } from '../db/database.js';
import { log } from '../utils/logger.js';

const SHOPIFY_API_VERSION = '2024-10';

const PLANS = {
  starter: { name: 'Starter', price: 49.0, trialDays: 14 },
  growth:  { name: 'Growth',  price: 149.0, trialDays: 14 },
  scale:   { name: 'Scale',   price: 399.0, trialDays: 14 },
};

/**
 * Make a GraphQL request to Shopify Admin API
 */
async function shopifyGraphQL(shopDomain, accessToken, query, variables = {}) {
  const url = `https://${shopDomain}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shopify GraphQL error ${res.status}: ${text}`);
  }

  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(`Shopify GraphQL: ${json.errors.map(e => e.message).join(', ')}`);
  }
  return json.data;
}

/**
 * Create a recurring app subscription via appSubscriptionCreate mutation.
 * Returns the confirmation URL the merchant must visit to approve.
 */
export async function createRecurringCharge(shopDomain, accessToken, planKey, returnUrl) {
  const plan = PLANS[planKey];
  if (!plan) throw new Error(`Unknown plan: ${planKey}`);

  const mutation = `
    mutation appSubscriptionCreate($name: String!, $returnUrl: URL!, $trialDays: Int!, $lineItems: [AppSubscriptionLineItemInput!]!) {
      appSubscriptionCreate(
        name: $name
        returnUrl: $returnUrl
        trialDays: $trialDays
        test: ${process.env.NODE_ENV !== 'production'}
        lineItems: $lineItems
      ) {
        appSubscription {
          id
          status
        }
        confirmationUrl
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    name: `Slay Season ${plan.name}`,
    returnUrl,
    trialDays: plan.trialDays,
    lineItems: [
      {
        plan: {
          appRecurringPricingDetails: {
            price: { amount: plan.price, currencyCode: 'USD' },
            interval: 'EVERY_30_DAYS',
          },
        },
      },
    ],
  };

  const data = await shopifyGraphQL(shopDomain, accessToken, mutation, variables);
  const result = data.appSubscriptionCreate;

  if (result.userErrors?.length) {
    throw new Error(`Shopify billing error: ${result.userErrors.map(e => e.message).join(', ')}`);
  }

  return {
    subscriptionId: result.appSubscription.id,
    status: result.appSubscription.status,
    confirmationUrl: result.confirmationUrl,
  };
}

/**
 * Query the current active app subscription for a shop.
 */
export async function getActiveCharge(shopDomain, accessToken) {
  const query = `
    {
      currentAppInstallation {
        activeSubscriptions {
          id
          name
          status
          currentPeriodEnd
          trialDays
          test
          lineItems {
            plan {
              pricingDetails {
                ... on AppRecurringPricing {
                  price { amount currencyCode }
                  interval
                }
              }
            }
          }
        }
      }
    }
  `;

  const data = await shopifyGraphQL(shopDomain, accessToken, query);
  const subs = data.currentAppInstallation.activeSubscriptions;

  if (!subs || subs.length === 0) return null;

  const sub = subs[0];
  const pricing = sub.lineItems?.[0]?.plan?.pricingDetails;

  // Determine plan key from price
  let planKey = null;
  if (pricing?.price?.amount) {
    const amount = parseFloat(pricing.price.amount);
    for (const [key, p] of Object.entries(PLANS)) {
      if (p.price === amount) { planKey = key; break; }
    }
  }

  return {
    id: sub.id,
    name: sub.name,
    status: sub.status,
    planKey,
    currentPeriodEnd: sub.currentPeriodEnd,
    trialDays: sub.trialDays,
    test: sub.test,
    price: pricing?.price,
  };
}

/**
 * Cancel an app subscription.
 */
export async function cancelCharge(shopDomain, accessToken, chargeId) {
  const mutation = `
    mutation appSubscriptionCancel($id: ID!) {
      appSubscriptionCancel(id: $id) {
        appSubscription {
          id
          status
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const data = await shopifyGraphQL(shopDomain, accessToken, mutation, { id: chargeId });
  const result = data.appSubscriptionCancel;

  if (result.userErrors?.length) {
    throw new Error(`Cancel error: ${result.userErrors.map(e => e.message).join(', ')}`);
  }

  return {
    id: result.appSubscription.id,
    status: result.appSubscription.status,
  };
}

/**
 * Persist billing status in the shops table.
 */
export function updateShopBillingStatus(shopDomain, { planKey, subscriptionId, status }) {
  const db = getDB();
  db.run(
    `UPDATE shops SET
       billing_plan = ?,
       billing_subscription_id = ?,
       billing_status = ?,
       billing_updated_at = CURRENT_TIMESTAMP,
       updated_at = CURRENT_TIMESTAMP
     WHERE shop_domain = ?`,
    [planKey || null, subscriptionId || null, status || null, shopDomain]
  );
}

/**
 * Get stored billing status for a shop.
 */
export function getShopBillingStatus(shopDomain) {
  const db = getDB();
  const results = db.exec(
    `SELECT billing_plan, billing_subscription_id, billing_status, billing_updated_at
     FROM shops WHERE shop_domain = ? AND is_active = 1`,
    [shopDomain]
  );
  if (!results.length || !results[0].values.length) return null;
  const [plan, subId, status, updatedAt] = results[0].values[0];
  return { plan, subscriptionId: subId, status, updatedAt };
}

export { PLANS };

export default {
  PLANS,
  createRecurringCharge,
  getActiveCharge,
  cancelCharge,
  updateShopBillingStatus,
  getShopBillingStatus,
};
