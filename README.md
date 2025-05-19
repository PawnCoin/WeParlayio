# WeParlay Sports Betting Platform

A sophisticated sports betting platform with tournament management capabilities, real-time odds integration, and comprehensive betting features.

## Features

- Advanced tournament management system
- Live betting with real-time odds updates
- Fantasy sports integration with Yahoo
- Social betting features and sharing capabilities
- Video game betting section
- Comprehensive admin dashboard
- Dark/light mode and customizable themes
- Mobile-responsive design
- Cryptocurrency wallet integration

## Running in Development

```
npm run dev
```

This will start both the server and client in development mode with hot reloading.

## Deployment

To deploy this application:

1. Build the project:
```
npm run build
```

2. Start the production server:
```
npm run start
```

## Environment Variables

The following environment variables are required:

- `DATABASE_URL`: PostgreSQL database connection string
- `THE_ODDS_API_KEY`: API key for odds data from The Odds API
- `YAHOO_CLIENT_ID`: Client ID for Yahoo Fantasy Sports API integration
- `YAHOO_CLIENT_SECRET`: Client secret for Yahoo Fantasy Sports API integration

## Admin Access

Admin dashboard can be accessed at `/admin-dashboard` after login.
For direct access (bypassing login), use `/admin-bypass` with key "weparlay-owner-access".

## Support

For assistance or questions, please contact support@weparlay.io