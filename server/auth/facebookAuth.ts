import { Router } from 'express';
import passport from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { storage } from '../storage';

if (!process.env.FACEBOOK_APP_ID || !process.env.FACEBOOK_APP_SECRET) {
  console.warn('Missing Facebook OAuth credentials. Facebook login will not work.');
}

const router = Router();

// Only initialize if we have credentials
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: '/api/auth/facebook/callback',
    proxy: true,
    profileFields: ['id', 'displayName', 'photos', 'email', 'first_name', 'last_name']
  }, 
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists by email
      let user;
      if (profile.emails && profile.emails[0] && profile.emails[0].value) {
        user = await storage.getUserByEmail(profile.emails[0].value);
      }
      
      if (!user) {
        // Create new user if they don't exist
        user = await storage.upsertUser({
          id: profile.id,
          email: profile.emails?.[0]?.value,
          firstName: profile._json?.first_name,
          lastName: profile._json?.last_name,
          profileImageUrl: profile.photos?.[0]?.value,
          status: 'active',
          role: 'user'
        });
      }
      
      return done(null, user);
    } catch (error) {
      return done(error as Error);
    }
  }));
}

// Routes
router.get('/facebook', passport.authenticate('facebook', { 
  scope: ['email', 'public_profile'] 
}));

router.get('/facebook/callback', 
  passport.authenticate('facebook', { 
    failureRedirect: '/login',
    successRedirect: '/'
  })
);

export default router;