# WeParlay.io - Sports Betting Platform

## Overview
WeParlay.io is a full-stack sports betting platform that integrates real-time sports data, supports cryptocurrency transactions, offers social betting features, and includes a tiered membership system. The platform aims to be a comprehensive and ready-for-launch solution, featuring robust admin verification and authentic data integration to tap into the sports betting market.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React with TypeScript
- **UI/UX**: shadcn/ui components, Radix UI primitives, Tailwind CSS with custom CSS variables. Mobile-first responsive design with bottom navigation.
- **State Management**: React hooks and context
- **Build**: Vite for development, Wouter for routing with lazy loading.
- **Performance**: Code splitting and Suspense-based loading.

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript (ES modules)
- **Database**: PostgreSQL (Drizzle ORM)
- **Authentication**: Replit Auth with PostgreSQL-backed session management.
- **Security**: Configurable SSL/HTTPS (Let's Encrypt), TOTP-based 2FA, comprehensive logging, performance monitoring, dependency scanning, advanced rate limiting, and security headers (Helmet, CSP, HSTS).

### Data Layer
- **ORM**: Drizzle with PostgreSQL dialect
- **Schema**: Covers users, sports, events, bets, transactions.
- **Migrations**: Drizzle Kit.
- **Connection**: Neon serverless PostgreSQL with connection pooling.

### Key Components & Features
- **Sports Data Integration**: Aggregates data from multiple APIs (ESPN, RapidAPI Sports, Grid.gg, The Odds API) with fallback systems for redundancy.
- **Unified Streaming Platform**: Single consolidated streaming page (/live-streaming) with tier-based access controls, YouTube integration for VIP users, IPTV support, and comprehensive search functionality.
- **Payment Systems**: Stripe for subscriptions, PayPal for alternative payments, multi-wallet cryptocurrency support (MetaMask, Coinbase, Trust Wallet), and internal "WeParlay Cash" virtual currency.
- **Authentication & Authorization**: Replit Auth, PostgreSQL-backed sessions (7-day TTL), role-based access control, and tier-based feature access.
- **Real-time Features**: WebSocket integration for live odds and event updates, and an in-app notification system.
- **API Data Pipeline**: Data aggregation, normalization, smart caching, rate limiting, and fallback systems.
- **User Interaction Flow**: Handles authentication, session management, data fetching (React Query), real-time updates (WebSockets), and state persistence.
- **Betting Flow**: Supports event selection, real-time odds display, secure bet placement, and automated bet settlement.
- **Deployment**: Replit integration for development, Google Cloud Run for production with automated SSL configuration, and environment separation.

## External Dependencies

### Core APIs
- **ESPN API**: Primary sports data.
- **RapidAPI Sports**: Secondary sports data and odds.
- **Grid.gg API**: Esports tournament and match data.
- **The Odds API**: Real-time betting odds.

### Payment Providers
- **Stripe**: Credit card processing and subscriptions.
- **PayPal**: Alternative payment method.
- **Cryptocurrency APIs**: Wallet integration services.

### Infrastructure
- **Replit**: Development and hosting.
- **PostgreSQL**: Database hosting (Neon serverless).
- **Let's Encrypt**: SSL certificate automation.

### Development Tools
- **TypeScript**: For type safety.
- **Drizzle ORM**: For database operations.
- **Vite**: Build tool and development server.
- **shadcn/ui**: Component library.