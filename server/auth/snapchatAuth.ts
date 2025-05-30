
import { Router } from 'express';
import passport from 'passport';
import { Strategy as OAuth2Strategy } from 'passport-oauth2';
import { storage } from '../storage';

const router = Router();

// Snapchat OAuth2 Strategy
passport.use('snapchat', new OAuth2Strategy({
  authorizationURL: 'https://accounts.snapchat.com/login/oauth2/authorize',
  tokenURL: 'https://accounts.snapchat.com/login/oauth2/access_token',
  clientID: process.env.SNAPCHAT_CLIENT_ID || 'demo-snapchat-client-id',
  clientSecret: process.env.SNAPCHAT_CLIENT_SECRET || 'demo-snapchat-client-secret',
  callbackURL: process.env.NODE_ENV === 'production' 
    ? 'https://weparlay.io/auth/snapchat/callback'
    : 'http://localhost:5000/auth/snapchat/callback',
  scope: ['https://auth.snapchat.com/oauth2/api/user.external_id']
}, async (accessToken: string, refreshToken: string, profile: any, done: any) => {
  try {
    // Snapchat profile structure
    const snapchatProfile = {
      id: profile.data?.me?.external_id || `snapchat_${Date.now()}`,
      username: profile.data?.me?.display_name || 'Snapchat User',
      displayName: profile.data?.me?.display_name || 'Snapchat User',
      email: `snapchat_${profile.data?.me?.external_id}@weparlay.io` // Snapchat doesn't provide email
    };

    // Check if user exists
    let user = await storage.getUserByEmail(snapchatProfile.email);
    
    if (!user) {
      // Create new user
      const userData = {
        id: `user_snapchat_${Date.now()}`,
        email: snapchatProfile.email,
        username: snapchatProfile.username,
        firstName: snapchatProfile.displayName.split(' ')[0] || 'Snapchat',
        lastName: snapchatProfile.displayName.split(' ')[1] || 'User',
        balance: 50.00,
        weplayTokenBalance: 100,
        provider: 'snapchat',
        providerId: snapchatProfile.id,
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
router.get('/', passport.authenticate('snapchat'));

router.get('/callback', 
  passport.authenticate('snapchat', { failureRedirect: '/login?error=snapchat_auth_failed' }),
  (req, res) => {
    // Successful authentication
    res.redirect('/');
  }
);

export default router;
