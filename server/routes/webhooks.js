/**
 * Shopify Webhook Handlers
 * All webhooks verified via HMAC before processing
 * Includes mandatory GDPR endpoints
 */
import { Router } from 'express';
import crypto from 'crypto';
import { verifyWebhookHMAC } from '../auth/shopify.js';
import { markShopUninstalled, logWebhook, isWebhookProcessed, markWebhookProcessed, deleteShopData } from '../db/database.js';

const router = Router();

// --- Webhook verification middleware ---
function verifyWebhook(req, res, next) {
  const hmac = req.headers['x-shopify-hmac-sha256'];
  const body = req.rawBody;

  if (!hmac || !body) {
    console.warn('[Webhook] Missing HMAC or body');
    return res.status(401).json({ error: 'Webhook verification failed' });
  }

  if (!verifyWebhookHMAC(body, hmac)) {
    console.warn('[Webhook] HMAC mismatch — rejecting');
    return res.status(401).json({ error: 'Invalid webhook signature' });
  }

  // Idempotency check — prevent duplicate processing
  const payloadHash = crypto.createHash('sha256').update(body).digest('hex');
  if (isWebhookProcessed(payloadHash)) {
    return res.status(200).json({ message: 'Already processed' });
  }

  req.payloadHash = payloadHash;
  next();
}

// --- App uninstalled ---
router.post('/app-uninstalled', verifyWebhook, (req, res) => {
  try {
    const shopDomain = req.headers['x-shopify-shop-domain'];
    console.log(`[Webhook] App uninstalled: ${shopDomain}`);

    markShopUninstalled(shopDomain);
    logWebhook(shopDomain, 'app/uninstalled', req.payloadHash);
    markWebhookProcessed(req.payloadHash);

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('[Webhook] app-uninstalled error:', error);
    res.status(500).json({ error: 'Processing failed' });
  }
});

// --- Orders create (real-time data) ---
router.post('/orders-create', verifyWebhook, (req, res) => {
  try {
    const shopDomain = req.headers['x-shopify-shop-domain'];
    const order = req.body;

    console.log(`[Webhook] New order: ${order.name} from ${shopDomain} — $${order.total_price}`);

    logWebhook(shopDomain, 'orders/create', req.payloadHash);
    markWebhookProcessed(req.payloadHash);

    // TODO: Update real-time metrics in database

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('[Webhook] orders-create error:', error);
    res.status(500).json({ error: 'Processing failed' });
  }
});

// --- GDPR: Customer data request ---
router.post('/customers-data-request', verifyWebhook, (req, res) => {
  try {
    const { shop_domain, customer, orders_requested } = req.body;
    console.log(`[GDPR] Customer data request from ${shop_domain} for customer ${customer?.id}`);

    logWebhook(shop_domain, 'customers/data_request', req.payloadHash);
    markWebhookProcessed(req.payloadHash);

    // We don't store personal customer data — only aggregated metrics
    // Respond with acknowledgment
    res.status(200).json({ received: true, message: 'No personal customer data stored' });
  } catch (error) {
    console.error('[GDPR] customers-data-request error:', error);
    res.status(200).json({ received: true }); // Must return 200 for GDPR
  }
});

// --- GDPR: Customer data erasure ---
router.post('/customers-redact', verifyWebhook, (req, res) => {
  try {
    const { shop_domain, customer } = req.body;
    console.log(`[GDPR] Customer redact request from ${shop_domain} for customer ${customer?.id}`);

    logWebhook(shop_domain, 'customers/redact', req.payloadHash);
    markWebhookProcessed(req.payloadHash);

    // We don't store personal customer data — only aggregated metrics
    res.status(200).json({ received: true, message: 'No personal customer data to redact' });
  } catch (error) {
    console.error('[GDPR] customers-redact error:', error);
    res.status(200).json({ received: true });
  }
});

// --- GDPR: Shop data erasure ---
router.post('/shop-redact', verifyWebhook, (req, res) => {
  try {
    const { shop_domain } = req.body;
    console.log(`[GDPR] Shop redact request for ${shop_domain}`);

    // Delete all shop data from our database
    // This is called 48 hours after app uninstall
    deleteShopData(shop_domain);
    logWebhook(shop_domain, 'shop/redact', req.payloadHash);
    markWebhookProcessed(req.payloadHash);

    console.log(`[GDPR] Shop data deleted for ${shop_domain}`);

    res.status(200).json({ received: true, message: 'Shop data deleted' });
  } catch (error) {
    console.error('[GDPR] shop-redact error:', error);
    res.status(200).json({ received: true });
  }
});

export default router;
