import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { isAuthenticated } from '../replitAuth';
import { storage } from '../simpleStorage';
import {
  WHOP_TIER_PRICING,
  createWhopTierCheckout,
  hasWhopCheckoutConfiguration,
  isWhopTierPaymentsEnabled,
  parseWhopTier,
  verifyWhopWebhook,
} from '../services/whopTierPayments';

const router = Router();
const processedWebhookIds = new Set<string>();

router.get('/status', (_req, res) => {
  res.json({
    success: true,
    enabled: isWhopTierPaymentsEnabled() && hasWhopCheckoutConfiguration(),
    provider: 'whop',
    tiers: WHOP_TIER_PRICING,
  });
});

router.post('/tier-checkout', isAuthenticated, async (req: any, res) => {
  const userId = req.user?.claims?.sub;
  const tier = parseWhopTier(req.body?.tier);
  if (!userId) return res.status(401).json({ success: false, message: 'User not authenticated.' });
  if (!tier) return res.status(400).json({ success: false, message: 'Choose a valid membership tier.' });
  if (!isWhopTierPaymentsEnabled()) {
    return res.status(503).json({ success: false, message: 'Membership checkout is not active yet.' });
  }

  try {
    const user = await storage.getUser(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    const checkout = await createWhopTierCheckout({
      tier,
      userId,
      orderId: randomUUID(),
    });
    return res.json({ success: true, checkout, tier });
  } catch (error: any) {
    console.error('Whop tier checkout failed:', error.message);
    return res.status(502).json({ success: false, message: error.message || 'Could not start Whop checkout.' });
  }
});

router.post('/webhook', async (req: any, res) => {
  const rawBody = req.rawBody;
  if (!Buffer.isBuffer(rawBody) || !verifyWhopWebhook(rawBody, req.headers)) {
    return res.status(400).send('Invalid webhook signature');
  }

  let event: any;
  try {
    event = JSON.parse(rawBody.toString('utf8'));
  } catch {
    return res.status(400).send('Invalid webhook payload');
  }

  const webhookId = String(event.id || req.headers['webhook-id'] || '');
  if (!webhookId || processedWebhookIds.has(webhookId)) return res.status(200).send('OK');
  processedWebhookIds.add(webhookId);

  if (event.type === 'payment.succeeded') {
    const metadata = event.data?.metadata || {};
    const tier = parseWhopTier(metadata.weparlay_tier);
    const userId = typeof metadata.weparlay_user_id === 'string' ? metadata.weparlay_user_id : undefined;
    if (!tier || !userId) {
      console.warn(`Whop payment ${event.data?.id || webhookId} is missing WeParlay metadata.`);
      return res.status(200).send('OK');
    }

    try {
      await storage.updateUserTier(userId, WHOP_TIER_PRICING[tier].name);
    } catch (error) {
      processedWebhookIds.delete(webhookId);
      console.error('Unable to apply Whop membership:', error);
      return res.status(500).send('Retry');
    }
  }

  return res.status(200).send('OK');
});

export default router;
