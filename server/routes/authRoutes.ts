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
      message: 'User registered successfully',
      user: userResponse,
      token,
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

// User Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username or email
    let user = await storage.getUserByUsername(username);
    if (!user && username.includes('@')) {
      user = await storage.getUserByEmail?.(username);
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET || 'weparlay-secret-key',
      { expiresIn: '7d' }
    );

    // Remove password from response
    const userResponse = { ...user };
    delete userResponse.password;

    res.json({
      message: 'Login successful',
      user: userResponse,
      token,
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
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

// Get current user
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