# Fantasy Sports Authentication Guide

## Yahoo Fantasy Authentication Fix

### Current Issue
The callback URL in your Yahoo Developer App doesn't match your Replit domain, causing the "refused to connect" error.

### Solution - Update Yahoo App Settings
1. Go to [Yahoo Developer Console](https://developer.yahoo.com/apps/)
2. Find your app with Client ID: `YthhJ5AU`
3. Update the "Redirect URI" to: `https://f7097b10-74b9-45ad-9152-e5c7329e5010-00-dwypxvoq2aso.worf.replit.dev/api/yahoo-real/oauth/callback`

### Current Configuration
- **Client ID**: YthhJ5AU (✓ working)
- **Client Secret**: dj0yJmk9V2... (✓ working) 
- **Callback URL**: Needs to match your Replit domain

## ESPN Fantasy Authentication

### Why ESPN Shows "Connected"
ESPN shows connected because it can access public sports data (NFL scores, player stats, etc.) without authentication.

### ESPN Fantasy Limitations
**ESPN does NOT offer OAuth for fantasy leagues.** This is an ESPN policy limitation, not a technical issue.

#### Available ESPN Options:
1. **Public Leagues Only**: Users with public leagues can share their league URL
2. **Manual League Input**: Users manually enter league ID and settings  
3. **Screen Scraping**: Not recommended, violates ToS
4. **ESPN+ Integration**: Requires separate subscription, limited access

#### ESPN's Official Position:
- No API access to private fantasy leagues
- No OAuth flow for personal fantasy data
- Users must manually share league information

## Comparison Summary

| Platform | Authentication | User Access | API Quality |
|----------|---------------|-------------|-------------|
| **Yahoo** | ✅ OAuth 2.0 | Full fantasy data | Excellent |
| **ESPN** | ❌ None available | Public data only | Limited |

## Recommendation
Focus on Yahoo Fantasy integration since it provides complete OAuth access to user fantasy data. ESPN integration remains limited to public sports data and manually shared league information.