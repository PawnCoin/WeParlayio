
import { Router } from 'express';
import passport from 'passport';
import { Strategy as OAuth2Strategy } from 'passport-oauth2';
import { storage } from '../storage';

const router = Router();

// TikTok OAuth2 Strategy
passport.use('tiktok', new OAuth2Strategy({
  authorizationURL: 'https://www.tiktok.com/auth/authorize/',
  tokenURL: 'https://open-api.tiktok.com/oauth/access_token/',
  clientID: process.env.TIKTOK_CLIENT_ID || 'demo-tiktok-client-id',
  clientSecret: process.env.TIKTOK_CLIENT_SECRET || 'demo-tiktok-client-secret',
  callbackURL: process.env.NODE_ENV === 'production' 
    ? 'https://weparlay.io/auth/tiktok/callback'
    : 'http://localhost:5000/auth/tiktok/callback',
  scope: ['user.info.basic']
}, async (accessToken: string, refreshToken: string, profile: any, done: any) => {
  try {
    // TikTok profile structure
    const tiktokProfile = {
      id: profile.data?.user?.open_id || `tiktok_${Date.now()}`,
      username: profile.data?.user?.display_name || 'TikTok User',
      displayName: profile.data?.user?.display_name || 'TikTok User',
      profileImageUrl: profile.data?.user?.avatar_url || null,
      email: `tiktok_${profile.data?.user?.open_id}@weparlay.io` // TikTok doesn't provide email
    };

    // Check if user exists
    let user = await storage.getUserByEmail(tiktokProfile.email);
    
    if (!user) {
      // Create new user
      const userData = {
        id: `user_tiktok_${Date.now()}`,
        email: tiktokProfile.email,
        username: tiktokProfile.username,
        firstName: tiktokProfile.displayName.split(' ')[0] || 'TikTok',
        lastName: tiktokProfile.displayName.split(' ')[1] || 'User',
        profileImageUrl: tiktokProfile.profileImageUrl,
        balance: 50.00,
        weplayTokenBalance: 100,
        provider: 'tiktok',
        providerId: tiktokProfile.id,
        isActive: true,
        createdAt: new Date(),
      };
      
      user = await storage.createUser(userData);
    }

    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

// Routes
router.get('/', passport.authenticate('tiktok'));

router.get('/callback', 
  passport.authenticate('tiktok', { failureRedirect: '/login?error=tiktok_auth_failed' }),
  (req, res) => {
    // Successful authentication
    res.redirect('/');
  }
);

export default router;
