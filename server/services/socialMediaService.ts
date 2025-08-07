import fetch from 'node-fetch';
import { TwitterApi } from 'twitter-api-v2';

export interface SocialMediaPost {
  id: string;
  platform: 'twitter' | 'facebook' | 'instagram';
  content: string;
  mediaUrls?: string[];
  scheduledFor?: Date;
  isPublished: boolean;
  publishedAt?: Date;
  engagement: {
    likes: number;
    shares: number;
    comments: number;
  };
}

export interface SocialMediaAccount {
  platform: 'twitter' | 'facebook' | 'instagram';
  username: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  isActive: boolean;
}

export class SocialMediaService {
  private twitterClient?: TwitterApi;
  
  constructor() {
    this.initializeTwitter();
  }

  private initializeTwitter() {
    if (process.env.TWITTER_API_KEY && process.env.TWITTER_API_SECRET) {
      this.twitterClient = new TwitterApi({
        appKey: process.env.TWITTER_API_KEY,
        appSecret: process.env.TWITTER_API_SECRET,
        accessToken: process.env.TWITTER_ACCESS_TOKEN,
        accessSecret: process.env.TWITTER_ACCESS_SECRET,
      });
    }
  }

  // Twitter/X Integration
  async postToTwitter(content: string, mediaUrls?: string[]): Promise<SocialMediaPost> {
    try {
      if (!this.twitterClient) {
        throw new Error('Twitter client not initialized');
      }

      let mediaIds: string[] = [];
      if (mediaUrls && mediaUrls.length > 0) {
        for (const url of mediaUrls) {
          const mediaId = await this.uploadTwitterMedia(url);
          if (mediaId) mediaIds.push(mediaId);
        }
      }

      const tweet = await this.twitterClient.v2.tweet(content, {
        media: mediaIds.length > 0 ? { media_ids: mediaIds } : undefined
      });

      return {
        id: tweet.data.id,
        platform: 'twitter',
        content,
        mediaUrls,
        isPublished: true,
        publishedAt: new Date(),
        engagement: { likes: 0, shares: 0, comments: 0 }
      };
    } catch (error) {
      console.error('Error posting to Twitter:', error);
      throw error;
    }
  }

  private async uploadTwitterMedia(url: string): Promise<string | null> {
    try {
      if (!this.twitterClient) return null;
      
      const response = await fetch(url);
      const buffer = await response.buffer();
      const mediaId = await this.twitterClient.v1.uploadMedia(buffer, { mimeType: 'image/jpeg' });
      return mediaId;
    } catch (error) {
      console.error('Error uploading Twitter media:', error);
      return null;
    }
  }

  // Facebook Integration
  async postToFacebook(content: string, pageId: string, accessToken: string, mediaUrls?: string[]): Promise<SocialMediaPost> {
    try {
      const url = `https://graph.facebook.com/v18.0/${pageId}/posts`;
      const postData: any = {
        message: content,
        access_token: accessToken
      };

      if (mediaUrls && mediaUrls.length > 0) {
        postData.link = mediaUrls[0]; // Facebook posts support one main link
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      });

      if (!response.ok) {
        throw new Error(`Facebook API error: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        id: data.id,
        platform: 'facebook',
        content,
        mediaUrls,
        isPublished: true,
        publishedAt: new Date(),
        engagement: { likes: 0, shares: 0, comments: 0 }
      };
    } catch (error) {
      console.error('Error posting to Facebook:', error);
      throw error;
    }
  }

  // Instagram Integration (via Facebook Graph API)
  async postToInstagram(content: string, mediaUrl: string, accessToken: string, instagramAccountId: string): Promise<SocialMediaPost> {
    try {
      // Step 1: Create media container
      const containerResponse = await fetch(`https://graph.facebook.com/v18.0/${instagramAccountId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: mediaUrl,
          caption: content,
          access_token: accessToken
        })
      });

      const containerData = await containerResponse.json();
      
      if (!containerResponse.ok) {
        throw new Error(`Instagram container creation error: ${containerData.error?.message}`);
      }

      // Step 2: Publish the media
      const publishResponse = await fetch(`https://graph.facebook.com/v18.0/${instagramAccountId}/media_publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: containerData.id,
          access_token: accessToken
        })
      });

      const publishData = await publishResponse.json();

      if (!publishResponse.ok) {
        throw new Error(`Instagram publish error: ${publishData.error?.message}`);
      }

      return {
        id: publishData.id,
        platform: 'instagram',
        content,
        mediaUrls: [mediaUrl],
        isPublished: true,
        publishedAt: new Date(),
        engagement: { likes: 0, shares: 0, comments: 0 }
      };
    } catch (error) {
      console.error('Error posting to Instagram:', error);
      throw error;
    }
  }

  // Cross-platform posting
  async postToMultiplePlatforms(
    content: string, 
    platforms: ('twitter' | 'facebook' | 'instagram')[], 
    options: {
      mediaUrls?: string[];
      facebookPageId?: string;
      facebookAccessToken?: string;
      instagramAccountId?: string;
      instagramAccessToken?: string;
    } = {}
  ): Promise<SocialMediaPost[]> {
    const results: SocialMediaPost[] = [];
    const errors: string[] = [];

    for (const platform of platforms) {
      try {
        switch (platform) {
          case 'twitter':
            if (this.twitterClient) {
              const post = await this.postToTwitter(content, options.mediaUrls);
              results.push(post);
            }
            break;
          case 'facebook':
            if (options.facebookPageId && options.facebookAccessToken) {
              const post = await this.postToFacebook(
                content, 
                options.facebookPageId, 
                options.facebookAccessToken, 
                options.mediaUrls
              );
              results.push(post);
            }
            break;
          case 'instagram':
            if (options.instagramAccountId && options.instagramAccessToken && options.mediaUrls?.[0]) {
              const post = await this.postToInstagram(
                content, 
                options.mediaUrls[0], 
                options.instagramAccessToken, 
                options.instagramAccountId
              );
              results.push(post);
            }
            break;
        }
      } catch (error) {
        errors.push(`${platform}: ${error.message}`);
      }
    }

    if (errors.length > 0) {
      console.warn('Some social media posts failed:', errors);
    }

    return results;
  }

  // OAuth URL generators for login/account creation
  getTwitterAuthUrl(redirectUri: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: process.env.TWITTER_CLIENT_ID || 'demo_id',
      redirect_uri: redirectUri,
      scope: 'tweet.read tweet.write users.read',
      state: 'twitter_auth',
      code_challenge_method: 'plain',
      code_challenge: 'challenge'
    });

    return `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
  }

  getFacebookAuthUrl(redirectUri: string): string {
    const params = new URLSearchParams({
      client_id: process.env.FACEBOOK_APP_ID || 'demo_id',
      redirect_uri: redirectUri,
      scope: 'email,public_profile,pages_manage_posts,pages_read_engagement',
      response_type: 'code',
      state: 'facebook_auth'
    });

    return `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
  }

  getInstagramAuthUrl(redirectUri: string): string {
    // Instagram uses Facebook's OAuth
    const params = new URLSearchParams({
      client_id: process.env.FACEBOOK_APP_ID || 'demo_id',
      redirect_uri: redirectUri,
      scope: 'instagram_basic,instagram_content_publish',
      response_type: 'code',
      state: 'instagram_auth'
    });

    return `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
  }

  // Marketing automation templates
  generateBettingPromotionPost(eventName: string, odds: string): string {
    const templates = [
      `🏈 BIG GAME ALERT! ${eventName} is heating up! Get ${odds} odds on WeParlay! 🔥 #SportsBetting #WeParlay`,
      `⚡ LIVE NOW: ${eventName} with incredible ${odds} odds! Place your bet on WeParlay! 💰 #LiveBetting #Sports`,
      `🎯 Don't miss ${eventName}! ${odds} odds available NOW on WeParlay! Join the action! 🚀 #Betting #Sports`
    ];
    
    return templates[Math.floor(Math.random() * templates.length)];
  }

  generateVIPPromotionPost(): string {
    const templates = [
      `👑 VIP ACCESS: Unlock 296+ live sports channels + exclusive betting markets! Upgrade to WeParlay VIP today! 💎 #VIP #LiveStreaming`,
      `🔥 VIP EXCLUSIVE: Get early odds access, premium streams, and VIP-only tournaments! Join WeParlay VIP! ⭐ #Premium #Betting`,
      `💰 VIP BENEFITS: Higher limits, exclusive content, priority support! Experience WeParlay VIP now! 🎖️ #VIPLife #Sports`
    ];
    
    return templates[Math.floor(Math.random() * templates.length)];
  }

  generateFantasyPromotionPost(platform: 'ESPN' | 'Yahoo'): string {
    return `🏆 Connect your ${platform} Fantasy team to WeParlay! Get personalized betting insights based on your roster! 📊 #Fantasy${platform} #SmartBetting`;
  }

  // Scheduled posting
  async schedulePost(
    content: string,
    platforms: ('twitter' | 'facebook' | 'instagram')[],
    scheduledFor: Date,
    options: any = {}
  ): Promise<{ scheduled: boolean; postId: string }> {
    // In production, this would integrate with a job queue system like Bull or Agenda
    console.log(`Scheduling post for ${scheduledFor.toISOString()}:`, content);
    
    // For now, return a mock scheduled post
    return {
      scheduled: true,
      postId: `scheduled_${Date.now()}`
    };
  }

  // Analytics
  async getPostAnalytics(postId: string, platform: string): Promise<any> {
    // Mock analytics data
    return {
      postId,
      platform,
      impressions: Math.floor(Math.random() * 10000) + 1000,
      engagement: {
        likes: Math.floor(Math.random() * 500) + 50,
        shares: Math.floor(Math.random() * 100) + 10,
        comments: Math.floor(Math.random() * 50) + 5
      },
      clickThroughRate: (Math.random() * 5 + 1).toFixed(2) + '%',
      conversionRate: (Math.random() * 2 + 0.5).toFixed(2) + '%'
    };
  }
}

export const socialMediaService = new SocialMediaService();