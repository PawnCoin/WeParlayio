# Hostinger deployment handoff

This guide prepares WeParlay for a Hostinger deployment. It does not replace
legal, licensing, or provider onboarding requirements.

## Before uploading

1. Use a Hostinger plan that supports a persistent Node.js application and
   PostgreSQL connectivity. Shared static-only hosting cannot run this server.
2. Set the production domain and TLS certificate in Hostinger first. Use HTTPS
   only.
3. Create a managed PostgreSQL database and retain its connection details in
   Hostinger's secret/environment-variable area.
4. Generate separate long random values for `SESSION_SECRET`,
   `TOURNAMENT_SETTLEMENT_KEY`, and `P2P_SETTLEMENT_KEY`.
5. Set `PUBLIC_APP_URL` to the final HTTPS domain. Do not use a Replit URL.

## Deploy from GitHub

1. Connect the `PawnCoin/WeParlayio` GitHub repository to the Hostinger Node.js
   application or deploy feature.
2. Select the `main` branch.
3. Use `npm install` for dependencies and `npm run build` as the build command.
4. Use `npm run start` as the start command. Hostinger must provide `PORT`; do
   not hard-code one in the control panel.
5. Add every applicable environment variable from `.env.example` as a private
   Hostinger environment variable. Do not upload an `.env` file to GitHub.
6. Run `npm run db:push` only after `DATABASE_URL` is set and you have reviewed
   the target database. This changes database schema.
7. Point the domain at the application and verify HTTPS before opening access.

## Required checks after deployment

- Confirm `GET /api/health` responds through the final HTTPS domain.
- Confirm sign-up, sign-in, sign-out, profile access, the unified bet slip,
  custom-bet flow, and tournament pages load without browser-console errors.
- Confirm the database is reachable and migrations have been applied.
- Confirm no provider feature is enabled until its credentials, contracts, and
  compliance controls are in place.
- Confirm Hostinger logs do not expose secrets, user identity data, bet data, or
  payment details.

## Do not enable yet

Keep real-money cards, withdrawals, crypto custody/payouts, production SMS,
KYC/geolocation, automatic settlement, and live-TV playback disabled until the
matching provider and legal requirements are complete. These are product safety
requirements, not deployment settings.
