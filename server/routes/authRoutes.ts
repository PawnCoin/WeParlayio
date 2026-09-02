import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { storage } from '../storage';

const router = Router();

// User Registration
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, phone, dateOfBirth, allowMarketing } = req.body;

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
      balance: 50.00, // Welcome bonus
      weplayTokenBalance: 100, // Starting WePlay tokens
      isActive: true,
      createdAt: new Date(),
    };

    const newUser = await storage.createUser(userData);

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, username: newUser.username },
      process.env.JWT_SECRET || 'weparlay-secret-key',
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
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

// User Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Special handling for support@weparlay.io - auto admin access
    if (email === 'support@weparlay.io' && password === 'Baysides3!') {
      // Create or get admin user with full platinum access
      let adminUser = await storage.getUserByEmail(email);
      
      if (!adminUser) {
        const adminUserData = {
          id: `admin-support-${Date.now()}`,
          username: 'WeParlay',
          email: 'support@weparlay.io',
          firstName: 'WeParlay',
          lastName: 'Admin',
          role: 'admin',
          tier: 'platinum',
          subscriptionTier: 'platinum',
          isAdmin: true,
          status: 'active',
          balance: 1000,
          weplayTokenBalance: 1000000,
          createdAt: new Date(),
          password: await bcrypt.hash(password, 12)
        };
        
        adminUser = await storage.createUser(adminUserData);
        console.log('✅ Created admin user for support@weparlay.io with platinum access');
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: adminUser.id, 
          username: adminUser.username,
          email: adminUser.email,
          isAdmin: true,
          role: 'admin',
          tier: 'platinum'
        },
        process.env.JWT_SECRET || 'weparlay-secret-key',
        { expiresIn: '7d' }
      );

      // Remove password from response
      const userResponse = { ...adminUser };
      delete userResponse.password;

      return res.json({
        success: true,
        message: 'Admin login successful - full access granted',
        user: {
          ...userResponse,
          isAdmin: true,
          role: 'admin',
          tier: 'platinum',
          subscriptionTier: 'platinum'
        },
        token,
        isAdmin: true
      });
    }

    console.log(`Login attempt: ${email}`);

    // Check for admin credentials first
    const adminCredentials = [
      { email: 'support@weparlay.io', password: 'Baysides3!' },
      { email: 'admin@weparlay.io', password: 'Baysides3!' },
      { email: 'weparlay@admin.com', password: 'Baysides3!' }
    ];

    const normalizedEmail = email.toLowerCase();
    const adminCred = adminCredentials.find(cred => cred.email.toLowerCase() === normalizedEmail);

    let user;
    let isAdmin = false;

    // Handle admin login
    if (adminCred && password === adminCred.password) {
      console.log('Admin login detected');
      isAdmin = true;
      
      // Try to get existing admin user
      user = await storage.getUserByEmail(adminCred.email);

      // Create admin user if doesn't exist
      if (!user) {
        console.log('Creating new admin user');
        const hashedPassword = await bcrypt.hash(adminCred.password, 12);
        const adminUserData = {
          id: `admin-${Date.now()}`,
          email: adminCred.email,
          username: 'WeParlay Admin',
          firstName: 'WeParlay',
          lastName: 'Admin',
          role: 'admin',
          tier: 'platinum',
          isAdmin: true,
          status: 'active',
          balance: 1000000,
          weplayTokenBalance: 1000000,
          password: hashedPassword,
          createdAt: new Date(),
        };
        user = await storage.createUser(adminUserData);
        console.log('Admin user created successfully');
      }
    } else if (adminCred) {
      // Admin email but wrong password
      console.log('Admin email with wrong password');
      return res.status(401).json({ 
        success: false,
        message: 'Invalid admin credentials' 
      });
    } else {
      // Regular user login
      console.log('Regular user login attempt');
      user = await storage.getUserByEmail(email);

      if (!user) {
        return res.status(401).json({ 
          success: false,
          message: 'Invalid credentials' 
        });
      }

      // Verify password for regular users
      if (!user.password) {
        return res.status(401).json({ 
          success: false,
          message: 'Invalid credentials' 
        });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ 
          success: false,
          message: 'Invalid credentials' 
        });
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username || user.email?.split('@')[0] || 'Anonymous',
        email: user.email,
        role: isAdmin ? 'admin' : 'user',
        isAdmin: isAdmin
      },
      process.env.JWT_SECRET || 'weparlay-secret-key',
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
      error: error.message 
    });
  }
});

// Quick Registration (for users who want to start betting immediately)
router.post('/quick-register', async (req, res) => {
  try {
    const { email } = req.body;

    // Generate random username and password
    const randomId = Math.random().toString(36).substring(2, 8);
    const username = `player_${randomId}`;
    const tempPassword = Math.random().toString(36).substring(2, 12);

    // Hash password
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    const userData = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      username,
      email,
      password: hashedPassword,
      firstName: 'New',
      lastName: 'Player',
      balance: 25.00, // Smaller welcome bonus for quick registration
      weplayTokenBalance: 50,
      isActive: true,
      createdAt: new Date(),
      isQuickRegistration: true,
    };

    const newUser = await storage.upsertUser(userData);

    // Send welcome email
    if (email) {
      try {
        const { sendWelcomeEmail, sendAdminAlert } = await import('../services/emailService');
        await sendWelcomeEmail(email, {
          name: newUser.username,
          balance: newUser.balance,
          userId: newUser.id,
          tempPassword
        });

        // Notify admin of new registration
        await sendAdminAlert({
          alertType: 'New Quick Registration',
          message: `New user registered: ${newUser.username} (${email}) - Quick Registration`,
          userId: newUser.id,
          amount: `$${newUser.balance} WeParlay Cash`,
          time: new Date().toLocaleString()
        });

        console.log('✅ Welcome email sent to:', email);
      } catch (emailError) {
        console.error('❌ Failed to send welcome email:', emailError);
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, username: newUser.username },
      process.env.JWT_SECRET || 'weparlay-secret-key',
      { expiresIn: '7d' }
    );

    // Remove password from response
    const userResponse = { ...newUser };
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'Quick registration successful',
      user: userResponse,
      token,
      tempPassword, // Send temp password so user can log in later
    });

  } catch (error) {
    console.error('Quick registration error:', error);
    res.status(500).json({ message: 'Quick registration failed', error: error.message });
  }
});

// Guest/Demo Mode
router.post('/demo', async (req, res) => {
  try {
    // Create a demo user session without saving to database
    const demoUser = {
      id: `demo_${Date.now()}`,
      username: `demo_user_${Math.random().toString(36).substring(2, 6)}`,
      email: 'demo@weparlay.io',
      firstName: 'Demo',
      lastName: 'User',
      balance: 1000.00, // Demo money
      weplayTokenBalance: 500,
      isDemo: true,
    };

    const token = jwt.sign(
      { userId: demoUser.id, username: demoUser.username, isDemo: true },
      process.env.JWT_SECRET || 'weparlay-secret-key',
      { expiresIn: '24h' } // Demo expires in 24 hours
    );

    res.json({
      message: 'Demo mode activated',
      user: demoUser,
      token,
    });

  } catch (error) {
    console.error('Demo mode error:', error);
    res.status(500).json({ message: 'Demo mode failed', error: error.message });
  }
});

// Admin Login
router.post('/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Define valid admin credentials - use consistent casing
    const validAdminCredentials = [
      { email: 'support@weparlay.io', password: 'Baysides3!' },
      { email: 'admin@weparlay.io', password: 'Baysides3!' },
      { email: 'weparlay@admin.com', password: 'Baysides3!' }
    ];

    // Normalize email to lowercase for comparison
    const normalizedEmail = email.toLowerCase();

    // Check if this is a valid admin email
    const adminCred = validAdminCredentials.find(cred => cred.email.toLowerCase() === normalizedEmail);

    if (!adminCred) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid admin email address' 
      });
    }

    // Direct password comparison for admin login
    const isValidPassword = password === adminCred.password;

    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid admin password' 
      });
    }

    // Get or create admin user
    let adminUser = await storage.getUserByEmail?.(adminCred.email);

    // Create admin user if doesn't exist
    if (!adminUser) {
      // Hash the password for storage
      const hashedPassword = await bcrypt.hash(adminCred.password, 12);

      const adminUserData = {
        id: `admin-${email.split('@')[0]}-${Date.now()}`,
        email: adminCred.email,
        username: email === 'support@weparlay.io' ? 'WeParlay' : 'Admin',
        firstName: 'WeParlay',
        lastName: 'Admin',
        role: 'admin',
        tier: 'platinum',
        isAdmin: true,
        status: 'active',
        balance: 1000000,
        weplayTokenBalance: 1000000,
        password: hashedPassword,
        createdAt: new Date(),
      };

      adminUser = await storage.upsertUser(adminUserData);
    }

    // Generate JWT token with long expiration for admin
    const token = jwt.sign(
      { 
        userId: adminUser.id, 
        username: adminUser.username,
        role: 'admin',
        isAdmin: true,
        email: adminUser.email
      },
      process.env.JWT_SECRET || 'weparlay-secret-key',
      { expiresIn: '7d' } // Admin stays logged in for 7 days
    );

    // Remove password from response
    const userResponse = { ...adminUser };
    delete userResponse.password;

    res.json({
      success: true,
      message: 'Admin login successful',
      user: userResponse,
      token,
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Admin login failed', 
      error: error.message 
    });
  }
});

// Admin Password Reset
router.post('/admin-reset-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (email === 'support@weparlay.io') {
      // In a real system, you'd send an actual email here
      console.log(`Admin password reset requested for: ${email}`);

      return res.json({
        success: true,
        message: 'Password reset instructions sent to your email'
      });
    }

    return res.status(404).json({
      success: false,
      message: 'Admin email address not found'
    });
  } catch (error) {
    console.error('Admin password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Password reset failed'
    });
  }
});

// Get current user info endpoint - returns actual user data
router.get('/user', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Check for admin tokens first (temporary simple tokens)
    if (token.startsWith('admin-token-')) {
      // Return admin user data directly
      const adminUser = {
        id: 'admin-weparlay-001',
        email: 'support@weparlay.io',
        username: 'WeParlay Admin',
        firstName: 'WeParlay',
        lastName: 'Admin',
        role: 'admin',
        tier: 'platinum',
        isAdmin: true,
        balance: 1000000,
        weplayTokenBalance: 1000000,
        totalBets: 0,
        winsCount: 0,
        winRate: 0,
        totalWinnings: 0,
        subscriptionTier: 'platinum',
        emailVerified: true,
        profileImageUrl: null,
        status: 'active'
      };
      
      return res.json(adminUser);
    }

    // Try to verify as JWT token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'weparlay-secret-key') as any;
      
      // Get user from database - try both getUser and getUserById
      let user = await storage.getUser?.(decoded.userId);
      if (!user && storage.getUserById) {
        user = await storage.getUserById(decoded.userId);
      }
      
      // If still no user found, but token has admin info, create/return admin user
      if (!user && decoded.isAdmin) {
        console.log('Creating admin user from JWT token for:', decoded.email);
        
        // Ensure support@weparlay.io gets full platinum access
        const adminData = {
          id: decoded.userId || `admin-support-${Date.now()}`,
          email: decoded.email,
          username: decoded.email === 'support@weparlay.io' ? 'WeParlay' : 'Admin',
          firstName: decoded.email === 'support@weparlay.io' ? 'WeParlay' : 'Admin',
          lastName: 'Admin',
          role: 'admin',
          tier: 'platinum',
          subscriptionTier: 'platinum',
          isAdmin: true,
          status: 'active',
          balance: decoded.email === 'support@weparlay.io' ? 10000 : 1000,
          weplayTokenBalance: 1000000,
          weparlayCashBalance: 0,
          cashBalance: 0,
          betsCount: 0,
          winsCount: 0,
          totalBets: 0,
          totalWinnings: 0,
          winRate: 0,
          averageBet: 0,
          biggestWin: 0,
          preferences: null,
          socialLinks: null,

          stripeCustomerId: null,
          stripeSubscriptionId: null,
          plaidAccessToken: null,
          plaidItemId: null,
          consentGiven: false,
          consentTimestamp: null,
          privacySettings: null,
          twoFactorEnabled: false,
          emailVerified: false,
          createdAt: new Date(),
          updatedAt: null,
          gamertag: null
        };
        
        user = await storage.upsertUser(adminData);
      }
      
      if (!user) {
        console.log('User lookup failed for userId:', decoded.userId);
        return res.status(401).json({ message: 'User not found' });
      }
      
      // Remove password from response
      const userResponse = { ...user };
      delete userResponse.password;
      
      // Ensure admin status is preserved from token
      userResponse.isAdmin = decoded.isAdmin || user.isAdmin || false;
      userResponse.role = decoded.role || (userResponse.isAdmin ? 'admin' : 'user');
      
      // Force platinum tier for admin users, especially support@weparlay.io
      if (userResponse.isAdmin || userResponse.email === 'support@weparlay.io') {
        userResponse.tier = 'platinum';
        userResponse.subscriptionTier = 'platinum';
        userResponse.isAdmin = true;
        userResponse.role = 'admin';
      }
      
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

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'weparlay-secret-key') as any;

    // If it's a demo user, return demo data
    if (decoded.isDemo) {
      return res.json({
        id: decoded.userId,
        username: decoded.username,
        isDemo: true,
        balance: 1000.00,
        weplayTokenBalance: 500,
      });
    }

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
