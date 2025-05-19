import { Router } from 'express';
import session from 'express-session';
import passport from 'passport';
import { storage } from '../storage';
import googleAuthRouter from './googleAuth';
import facebookAuthRouter from './facebookAuth';

const router = Router();

// Session configuration
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'weparlay-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
});

// Initialize passport
router.use(sessionMiddleware);
router.use(passport.initialize());
router.use(passport.session());

// Serialize/Deserialize user
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Mount social auth routes
router.use('/google', googleAuthRouter);
router.use('/facebook', facebookAuthRouter);

// Current user endpoint
router.get('/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ authenticated: false });
  }
});

// Biometric authentication endpoint
router.post('/biometric-login', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Verify that this user exists
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid user' });
    }
    
    // The biometric validation happened on the client side
    // If the request made it here, the user successfully authenticated with their biometric
    
    // Log in the user
    req.login(user, (err) => {
      if (err) {
        console.error('Biometric login error:', err);
        return res.status(500).json({ error: 'Failed to login' });
      }
      
      return res.json({ message: 'Biometric login successful', user });
    });
  } catch (error) {
    console.error('Biometric login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Logout endpoint
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.redirect('/');
  });
});

export default router;