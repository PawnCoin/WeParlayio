import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { storage } from '../storage';

const router = Router();
const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is required');
  return process.env.JWT_SECRET;
};

const credentialRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many sign-in attempts. Please try again later.' },
});

// User Registration
router.post('/register', credentialRateLimit, async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, phone, dateOfBirth, allowMarketing } = req.body;

    if (
      typeof username !== 'string' || username.trim().length < 3 || username.length > 40 ||
      typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email) || email.length > 254 ||
      typeof password !== 'string' || password.length < 12 || password.length > 128 ||
      Number.isNaN(new Date(dateOfBirth).getTime())
    ) {
      return res.status(400).json({ message: 'Invalid registration details' });
    }

    // Check if user already exists
    const existingUser = await storage.getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const existingEmail = await storage.getUserByEmail?.(email);
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const userData = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      dateOfBirth: new Date(dateOfBirth),
      allowMarketing,
      balance: 10000.00, // WeParlay Cash welcome reward
      weplayTokenBalance: 100, // Starting WePlay tokens
      isActive: true,
      createdAt: new Date(),
    };

    const newUser = await storage.createUser(userData);

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, username: newUser.username },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    // Remove password from response
    const userResponse = { ...newUser };
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: userResponse,
      token,
      isNewUser: true
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// User Login
router.post('/login', credentialRateLimit, async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const loginId = String(email || username || '').trim();
    if (!loginId || !password) return res.status(400).json({ success: false, message: 'Email or username and password are required' });

    const user = loginId.includes('@')
      ? await storage.getUserByEmail(loginId)
      : await storage.getUserByUsername(loginId);
    if (!user?.password || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Account access is disabled' });
    }
    const isAdmin = user.isAdmin === true || user.role === 'admin';

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username || user.email?.split('@')[0] || 'Anonymous',
        email: user.email,
        role: isAdmin ? 'admin' : 'user',
        isAdmin: isAdmin
      },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    // Remove password from response
    const userResponse = { ...user };
    delete userResponse.password;

    // Force platinum tier for admin users in login response
    const responseUser = {
      ...userResponse,
      isAdmin: isAdmin || user.isAdmin || false,
      role: isAdmin ? 'admin' : (user.role || 'user')
    };
    
    // Admin users always get platinum tier
    if (responseUser.isAdmin) {
      responseUser.tier = 'platinum';
      responseUser.subscriptionTier = 'platinum';
    }

    res.json({
      success: true,
      message: isAdmin ? 'Admin login successful' : 'Login successful',
      user: responseUser,
      token,
      isAdmin: isAdmin || user.isAdmin || false
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Login failed', 
      error: 'Authentication service unavailable'
    });
  }
});

// Admin Password Reset
router.post('/admin-reset-password', credentialRateLimit, (_req, res) => {
  // Password reset stays unavailable until a transactional email provider and
  // secure, expiring reset-token flow are configured.
  res.status(503).json({
    success: false,
    message: 'Password reset is not available yet. Contact support for account help.',
  });
});

// Get current user info endpoint - returns actual user data
router.get('/user', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Try to verify as JWT token
    try {
      const decoded = jwt.verify(token, getJwtSecret()) as any;
      
      const user = await storage.getUser(decoded.userId);
      
      if (!user) {
        console.log('User lookup failed for userId:', decoded.userId);
        return res.status(401).json({ message: 'User not found' });
      }
      
      // Remove password from response
      const userResponse = { ...user };
      delete userResponse.password;
      
      userResponse.isAdmin = user.isAdmin === true || user.role === 'admin';
      userResponse.role = userResponse.isAdmin ? 'admin' : 'user';
      
      return res.json(userResponse);
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError);
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  try {
    // Clear session if using sessions
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destruction error:', err);
        }
      });
    }
    
    // Clear any cookies
    res.clearCookie('connect.sid');
    res.clearCookie('session');
    res.clearCookie('auth-token');
    
    res.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Logout failed' 
    });
  }
});

// Get current authenticated user (with proper auth)
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, getJwtSecret()) as any;

    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove password from response
    const userResponse = { ...user };
    delete userResponse.password;

    res.json(userResponse);

  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

export default router;
