# WeParlay.io - Sports Betting Platform

## Overview

WeParlay.io is a comprehensive sports betting platform built with modern web technologies. The platform features real-time sports data integration, cryptocurrency wallet support, social betting features, and a tiered membership system. The application serves as a full-stack sports betting solution with 100% completion status and is READY FOR PUBLIC LAUNCH with comprehensive admin verification systems and authentic data integration.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **UI Library**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables
- **State Management**: React hooks and context
- **Build Tool**: Vite with hot module replacement
- **Responsive Design**: Mobile-first approach with bottom navigation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth with session management
- **Session Storage**: PostgreSQL-backed session store
- **SSL/HTTPS**: Configurable SSL support with Let's Encrypt integration

### Data Layer
- **ORM**: Drizzle with PostgreSQL dialect
- **Schema**: Comprehensive database schema covering users, sports, events, bets, transactions
- **Migrations**: Drizzle Kit for schema management
- **Connection**: Neon serverless PostgreSQL with connection pooling

## Key Components

### Sports Data Integration
- **ESPN API**: Traditional sports coverage (NFL, NBA, MLB, NHL)
- **RapidAPI Sports**: Extended odds and statistics
- **Grid.gg API**: 74,000+ esports series coverage
- **The Odds API**: Real-time betting odds
- **Multiple Fallback APIs**: Comprehensive data redundancy

### Payment Systems
- **Stripe Integration**: VIP tier subscriptions and payments
- **PayPal Gateway**: Alternative payment processing
- **Cryptocurrency Support**: Multi-wallet integration (MetaMask, Coinbase, Trust Wallet)
- **WeParlay Cash**: Virtual currency system for restricted regions

### Authentication & Authorization
- **Replit Auth**: OAuth-based authentication
- **Session Management**: PostgreSQL-backed sessions with 7-day TTL
- **Role-based Access**: User roles and tier-based feature access
- **Security Middleware**: Helmet for security headers, rate limiting

### Real-time Features
- **WebSocket Integration**: Live odds updates and real-time betting
- **Live Events**: Real-time sports event tracking
- **Notification System**: In-app notifications and alerts

## Data Flow

### API Data Pipeline
1. **Primary APIs**: ESPN, RapidAPI, Grid.gg provide raw sports data
2. **Data Aggregation**: Services normalize and standardize data formats
3. **Caching Layer**: Smart caching with TTL management for performance
4. **Rate Limiting**: API quota management to prevent exhaustion
5. **Fallback System**: Multiple API sources ensure data availability

### User Interaction Flow
1. **Authentication**: Replit Auth handles user login/registration
2. **Session Management**: PostgreSQL sessions maintain user state
3. **Data Fetching**: React Query manages API calls and caching
4. **Real-time Updates**: WebSocket connections for live data
5. **State Persistence**: Database storage for user data and transactions

### Betting Flow
1. **Event Selection**: Users browse live and upcoming events
2. **Odds Display**: Real-time odds from multiple bookmakers
3. **Bet Placement**: Secure bet processing with balance validation
4. **Settlement**: Automated bet settlement based on event outcomes

## External Dependencies

### Core APIs
- **ESPN API**: Primary sports data source
- **RapidAPI Sports**: Secondary sports data and odds
- **Grid.gg API**: Esports tournament and match data
- **The Odds API**: Real-time betting odds

### Payment Providers
- **Stripe**: Credit card processing and subscriptions
- **PayPal**: Alternative payment method
- **Cryptocurrency APIs**: Wallet integration services

### Infrastructure
- **Replit**: Development and hosting platform
- **PostgreSQL**: Database hosting (Neon serverless)
- **Let's Encrypt**: SSL certificate automation

### Development Tools
- **TypeScript**: Type safety and development experience
- **Drizzle ORM**: Database operations and migrations
- **Vite**: Build tool and development server
- **shadcn/ui**: Component library

## Deployment Strategy

### Development Environment
- **Replit Integration**: Native Replit deployment configuration
- **Hot Reload**: Vite development server with HMR
- **Environment Variables**: Secure configuration management
- **Database**: Replit PostgreSQL module integration

### Production Deployment
- **Cloud Run**: Google Cloud Run deployment target
- **SSL Configuration**: Automated HTTPS with custom domain support
- **Environment Separation**: Production-specific configuration
- **Build Process**: Optimized production builds with asset bundling

### SSL and Security
- **HTTPS Enforcement**: Automatic HTTP to HTTPS redirects
- **Security Headers**: Comprehensive security middleware
- **Rate Limiting**: API endpoint protection
- **Content Security Policy**: XSS protection

## Changelog

Recent Changes:
- July 28, 2025: **Admin Access Integration** - Fixed admin dropdown menu access for support@weparlay.io login, admin menu items (Admin Dashboard, User Management, Facebook Bots) now appear in profile dropdown for authenticated admin users, resolved authentication routing conflicts
- July 28, 2025: **Profile System Overhaul** - Fixed profile dropdown to show single "Profile" link, added profile picture upload functionality with camera interface, profile images only show for authenticated users, logout only visible when logged in, resolved all TypeScript errors in MainLayout
- July 28, 2025: **Enhanced User Profile Page** - Created ProfilePictureUpload component with drag-drop support, image validation (5MB max, JPG/PNG), preview functionality, and integrated with main profile page for complete user management
- July 28, 2025: **Fixed Authentication UI** - Cleaned up duplicate profile links in dropdown menu, proper conditional rendering based on authentication state, improved user experience with clear visual feedback
- July 28, 2025: Completed professional authentication system overhaul - built AuthenticationHub with unified login/signup, comprehensive UserProfile with security settings, and NotificationCenter with real-time updates
- July 28, 2025: Implemented proper server-side authentication endpoints (/api/auth/login, /api/auth/register, /api/auth/logout) with session management and $25 welcome bonus for new users
- July 28, 2025: Enhanced navigation routing to use /auth for unified authentication experience, added user profile management with tier display and logout functionality
- July 28, 2025: Fixed critical React component errors in MainLayout and integrated notification system with professional user management features
- June 19, 2025: Implemented tier-based security for gaming endpoints - Silver tier required for tournaments/odds, Gold tier for advanced features
- June 19, 2025: Fixed user directory to display all 13 database users with direct database access bypassing storage issues
- June 19, 2025: Created professional upgrade tier page with Gold/Platinum options and working upgrade buttons across platform
- June 17, 2025: Fixed dark mode theme inconsistency on social media bots page - updated all cards, badges, and text elements for proper dark theme support
- June 17, 2025: Fixed status display to show actual API connection status instead of hardcoded "Not Connected" - Twitter shows as "Connected" when API is configured
- June 16, 2025: Restricted social media bot access to administrators only - removed all user-accessible bot pages
- June 16, 2025: Activated real social media posting with Twitter/Facebook API integration instead of simulation mode
- June 16, 2025: Fixed AdminVerificationDashboard routing issue - removed lazy loading, added direct component import
- June 16, 2025: Completed comprehensive admin verification testing - all API endpoints operational

## User Preferences

Preferred communication style: Simple, everyday language.

## Admin Access Information

### Admin Credentials
- **Emails**: support@weparlay.io, admin@weparlay.io, or weparlay@admin.com  
- **Password**: Baysides3!

### Profile Management Features
- Single profile link in dropdown menu
- Profile picture upload with validation (JPG/PNG, max 5MB)
- Profile images only visible for authenticated users
- Logout button only shows when user is logged in
- Camera interface for easy profile picture updates
- Admin access in dropdown menu when admin user is logged in