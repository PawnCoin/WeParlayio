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