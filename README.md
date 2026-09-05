# WeParlay

WeParlay is a social sports-betting application centered on custom challenges,
daily tournaments, live game tracking, and a unified bet slip. The public app
does not include fantasy sports, player-prop betting, analytics dashboards, or
an AI betting helper.

## Current product boundaries

- WeParlay Cash is available for the product's play-cash flows.
- Real-money, card, and crypto wagering are intentionally disabled until the
  required legal approvals, provider contracts, identity controls, and secure
  payment integrations are complete.
- Live TV requires licensed providers and broadcast rights. Do not add
  unverified or scraped stream lists to the app.
- Administrative access is granted only through authenticated, server-side role
  checks. There is no login bypass or hard-coded owner key.

## Run locally

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run start
```

The production server reads `PORT` from the environment and defaults to port
3000. See [Hostinger deployment](docs/HOSTINGER_DEPLOYMENT.md) before deploying.

## Environment

Copy `.env.example` into the secret manager offered by your host. Never commit
real keys, database URLs, webhook secrets, or payment credentials. The
database and provider-specific variables are documented in `.env.example`.

## Project status

The delivery checklist is maintained in
[docs/DELIVERY_STATUS.md](docs/DELIVERY_STATUS.md). It separates completed
application work from items that cannot be completed without provider,
licensing, compliance, or account-owner input.
