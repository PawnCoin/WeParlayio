# Social Media API Setup Guide

## Current Status
The social media bot system shows fake statistics because the APIs are not properly configured. Here's exactly what you need:

## 1. Twitter API (X Developer Platform)

### Steps to Get Twitter API Access:
1. **Go to**: https://developer.twitter.com/
2. **Sign up** for a Twitter Developer Account
3. **Create a Project** (required for v2 API access)
4. **Create an App** within the project
5. **Get these credentials**:
   - API Key (Consumer Key)
   - API Secret (Consumer Secret) 
   - Access Token
   - Access Token Secret
   - Bearer Token

### Required Environment Variables:
```
TWITTER_API_KEY=your_api_key_here
TWITTER_API_SECRET=your_api_secret_here  
TWITTER_ACCESS_TOKEN=your_access_token_here
TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret_here
```

### Current Issue:
The error shows "Client Forbidden - client-not-enrolled" which means the app needs to be attached to a Project with appropriate API access level.

## 2. Facebook API (Meta for Developers)

### Steps to Get Facebook API Access:
1. **Go to**: https://developers.facebook.com/
2. **Create a Facebook App**
3. **Add Facebook Login** product
4. **Get Page Access Token** for posting to Facebook pages
5. **Get these credentials**:
   - App ID
   - App Secret
   - Page Access Token (long-lived)
   - Page ID

### Required Environment Variables:
```
FACEBOOK_ACCESS_TOKEN=your_page_access_token_here
FACEBOOK_PAGE_ID=your_page_id_here
```

### Current Issue:
"Error validating access token: The session is invalid because the user logged out" - need a valid, long-lived page access token.

## 3. Instagram API (Meta Business)

### Steps to Get Instagram API Access:
1. **Convert to Business Account**: Your Instagram must be a business account
2. **Connect to Facebook Page**: Link Instagram to a Facebook page
3. **Use Instagram Basic Display API** or **Instagram Graph API**
4. **Get these credentials**:
   - Instagram Business Account ID
   - Access Token (same as Facebook)

### Required Environment Variables:
```
INSTAGRAM_ACCESS_TOKEN=your_access_token_here
INSTAGRAM_BUSINESS_ACCOUNT_ID=your_account_id_here
```

## Quick Setup Summary:

### What You Need to Do:
1. **Twitter**: Create developer account → Create project → Create app → Get 4 keys
2. **Facebook**: Create app → Add pages → Get page access token
3. **Instagram**: Convert to business → Connect to Facebook → Use same token

### Cost:
- **Twitter**: Free tier available (limited posts per month)
- **Facebook**: Free for basic posting
- **Instagram**: Free for basic posting

### Time Required:
- Twitter setup: 15-30 minutes (may require approval)
- Facebook setup: 10-15 minutes  
- Instagram setup: 5-10 minutes (if already business account)

Once you provide these API credentials, the social media bot system will show real statistics instead of fake data.