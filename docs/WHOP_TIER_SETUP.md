# Whop paid-membership setup

Whop is used only for paid WeParlay membership tiers. It must never receive, hold, settle, or pay out a wager. The public product remains play-cash only.

## Required environment variables

```bash
WEPARLAY_TIER_PAYMENTS_ENABLED=true
WHOP_API_KEY=...
WHOP_ACCOUNT_ID=biz_...
WHOP_WEBHOOK_SECRET=ws_...
```

Keep every value in the host's secret manager, never in GitHub or the browser.

## Whop dashboard

1. Create the membership products and confirm the final monthly pricing and refund terms.
2. Create a webhook pointing to `https://weparlay.io/api/whop/webhook`.
3. Subscribe it to at least `payment.succeeded`, `membership.activated`, and `membership.deactivated`.
4. Copy its one-time signing secret into `WHOP_WEBHOOK_SECRET`.
5. Test in Whop sandbox first. The site grants a tier only after a verified `payment.succeeded` event; a return to the website alone never grants access.

The server attaches the authenticated WeParlay user ID, tier, and an internal order ID as Whop checkout metadata. That metadata returns with the payment webhook so the entitlement is matched safely.

## Android / Google Play

Do not enable Whop checkout inside the Play-distributed Android build until the app is enrolled and approved for the applicable Google Play external-billing or external-link program. Until then, the native app must keep membership purchase disabled or use Play Billing. The regular website can use Whop.
