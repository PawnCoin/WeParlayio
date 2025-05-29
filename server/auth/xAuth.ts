
import { Router } from 'express';
import passport from 'passport';
import { Strategy as TwitterStrategy } from 'passport-twitter';
import { storage } from '../storage';

const router = Router();

// X (Twitter) OAuth Strategy
passport.use('x-twitter', new TwitterStrategy({
  consumerKey: process.env.TWITTER_CONSUMER_KEY || 'demo-twitter-key',
  consumerSecret: process.env.TWITTER_CONSUMER_SECRET || 'demo-twitter-secret',
  callbackURL: process.env.NODE_ENV === 'production' 
    ? 'https://weparlay.io/auth/x/callback'
    : 'http://localhost:5000/auth/x/callback',
  includeEmail: true
}, async (token: string, tokenSecret: string, profile: any, done: any) => {
  try {
    // X/Twitter profile structure
    const xProfile = {
      id: profile.id,
      username: profile.username,
      displayName: profile.displayName,
      profileImageUrl: profile.photos?.[0]?.value || null,
      email: profile.emails?.[0]?.value || `x_${profile.id}@weparlay.io`
    };

    // Check if user exists
    let user = await storage.getUserByEmail(xProfile.email);
    
    if (!user) {
      // Create new user
      const userData = {
        id: `user_x_${Date.now()}`,
        email: xProfile.email,
        username: xProfile.username,
        firstName: xProfile.displayName.split(' ')[0] || 'X',
        lastName: xProfile.displayName.split(' ')[1] || 'User',
        profileImageUrl: xProfile.profileImageUrl,
        balance: 50.00,
        weplayTokenBalance: 100,
        provider: 'x',
        providerId: xProfile.id,
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
router.get('/', passport.authenticate('x-twitter'));

router.get('/callback', 
  passport.authenticate('x-twitter', { failureRedirect: '/login?error=x_auth_failed' }),
  (req, res) => {
    // Successful authentication
    res.redirect('/');
  }
);

export default router;
