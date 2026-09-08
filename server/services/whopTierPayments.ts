import { createHmac, timingSafeEqual } from 'node:crypto';

export const WHOP_TIER_PRICING = {
  bronze: { name: 'Bronze', amount: 9.99 },
  silver: { name: 'Silver', amount: 19.99 },
  gold: { name: 'Gold', amount: 49.99 },
  platinum: { name: 'Platinum', amount: 99.99 },
} as const;

export type WhopTier = keyof typeof WHOP_TIER_PRICING;

export function parseWhopTier(value: unknown): WhopTier | undefined {
  const tier = typeof value === 'string' ? value.trim().toLowerCase() : '';
  return tier in WHOP_TIER_PRICING ? tier as WhopTier : undefined;
}

export function isWhopTierPaymentsEnabled(): boolean {
  return process.env.WEPARLAY_TIER_PAYMENTS_ENABLED === 'true';
}

export function hasWhopCheckoutConfiguration(): boolean {
  return Boolean(process.env.WHOP_API_KEY && process.env.WHOP_ACCOUNT_ID);
}

export async function createWhopTierCheckout(input: {
  tier: WhopTier;
  userId: string;
  orderId: string;
}) {
  const apiKey = process.env.WHOP_API_KEY;
  const accountId = process.env.WHOP_ACCOUNT_ID;
  if (!apiKey || !accountId) {
    throw new Error('Whop is not configured. Add WHOP_API_KEY and WHOP_ACCOUNT_ID before enabling tier checkout.');
  }

  const price = WHOP_TIER_PRICING[input.tier];
  const response = await fetch('https://api.whop.com/api/v1/checkout_configurations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      account_id: accountId,
      plan: {
        initial_price: price.amount,
        plan_type: 'renewal',
      },
      metadata: {
        weparlay_order_id: input.orderId,
        weparlay_user_id: input.userId,
        weparlay_tier: input.tier,
      },
    }),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof body?.message === 'string' ? body.message : 'Whop could not create checkout.';
    throw new Error(message);
  }

  const sessionId = typeof body?.id === 'string' ? body.id : undefined;
  const planId = typeof body?.plan?.id === 'string' ? body.plan.id : undefined;
  if (!sessionId || !planId) {
    throw new Error('Whop returned an incomplete checkout configuration.');
  }

  return { sessionId, planId, amount: price.amount, currency: 'usd' };
}

export function verifyWhopWebhook(rawBody: Buffer, headers: Record<string, string | string[] | undefined>): boolean {
  const secret = process.env.WHOP_WEBHOOK_SECRET;
  const webhookId = readHeader(headers, 'webhook-id');
  const timestamp = readHeader(headers, 'webhook-timestamp');
  const signatureHeader = readHeader(headers, 'webhook-signature');
  if (!secret || !webhookId || !timestamp || !signatureHeader) return false;

  const timestampSeconds = Number(timestamp);
  if (!Number.isFinite(timestampSeconds) || Math.abs(Date.now() / 1000 - timestampSeconds) > 5 * 60) return false;

  const expected = createHmac('sha256', secret)
    .update(`${webhookId}.${timestamp}.${rawBody.toString('utf8')}`)
    .digest('base64');

  return signatureHeader.split(' ').some((signature) => {
    const [, candidate] = signature.split(',', 2);
    if (!candidate) return false;
    const expectedBuffer = Buffer.from(expected);
    const candidateBuffer = Buffer.from(candidate);
    return expectedBuffer.length === candidateBuffer.length && timingSafeEqual(expectedBuffer, candidateBuffer);
  });
}

function readHeader(headers: Record<string, string | string[] | undefined>, name: string): string | undefined {
  const value = headers[name] ?? headers[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value;
}
