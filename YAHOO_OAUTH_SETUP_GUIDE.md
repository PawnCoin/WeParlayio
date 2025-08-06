# Yahoo OAuth Setup Guide for WeParlay

## Current Issue
You're getting the error `invalid client id` because the Yahoo OAuth credentials need to be properly configured for your Replit domain.

## Steps to Fix Yahoo OAuth

### 1. Create a Yahoo Developer App
1. Go to [Yahoo Developer Network](https://developer.yahoo.com/)
2. Sign in with your Yahoo account
3. Click "Create an App"
4. Fill out the application details:
   - **Application Name**: WeParlay Fantasy Integration
   - **Description**: Fantasy sports integration for WeParlay betting platform
   - **Home Page URL**: Your Replit domain (e.g., `https://your-replit-domain.replit.dev`)
   - **Redirect URI**: `https://your-replit-domain.replit.dev/api/yahoo-real/oauth/callback`

### 2. Required Permissions
Select these APIs for your Yahoo app:
- **Fantasy Sports** (Read access)
- Scope: `fspt-r` (Fantasy Sports Read)

### 3. Get Your Credentials
After creating the app, Yahoo will provide:
- **Client ID** (not "YthhJ5AU" - that's invalid)
- **Client Secret**

#### Where to Find Your Client Secret:
1. In Yahoo Developer Console, go to your app
2. Look for the "App Information" or "Credentials" section
3. You'll see:
   - **Client ID**: Long string starting with "dj0y..." 
   - **Client Secret**: Another long string (often shorter than Client ID)
4. If you can't see the secret, click "Show" or "Reveal" button next to it
5. Sometimes it's under "App Details" > "Security" section

#### Common Locations in Yahoo Developer Console:
- Main app dashboard
- "API Keys" tab
- "Security" or "Credentials" section
- "App Information" panel

### 4. Update Replit Secrets
In your Replit project, update these secrets:
```
YAHOO_CLIENT_ID=your_actual_client_id_from_yahoo
YAHOO_CLIENT_SECRET=your_actual_client_secret_from_yahoo
```

### 5. Domain Configuration
Make sure your Yahoo app's redirect URI exactly matches:
```
https://your-replit-domain.replit.dev/api/yahoo-real/oauth/callback
```

## Current Configuration Status
- Current Client ID: `YthhJ5AU` (INVALID)
- Expected Redirect URI: `https://your-replit-domain.replit.dev/api/yahoo-real/oauth/callback`

## Next Steps
1. Create a new Yahoo Developer app with correct settings
2. Update the Replit secrets with the new credentials
3. Test the OAuth flow again

## Testing the Integration
Once configured correctly:
1. Go to `/yahoo-fantasy` page
2. Click "Connect Yahoo Account"
3. You should be redirected to Yahoo's OAuth page
4. After authorization, you'll return with your real fantasy data

## Troubleshooting
- Ensure the redirect URI in Yahoo app exactly matches the one in logs
- Client ID should be a longer string, not "YthhJ5AU"
- Make sure your Yahoo app has Fantasy Sports permissions enabled
- Verify the domain is accessible via HTTPS