import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to restrict access to specific authorized users only
 * Only allows:
 * - support@weparlay.io
 * - Facebook user: panwcoin.pc33
 * - Crypto wallets: 0x5680e1AcB0E98A3e301767481A2D56B35aeDe615, 0x529b0c7E13eDC45E2618541407D66D9e33676e5d
 */

const AUTHORIZED_EMAILS = [
  'support@weparlay.io'
];

const AUTHORIZED_FACEBOOK_USERS = [
  'panwcoin.pc33'
];

const AUTHORIZED_WALLETS = [
  '0x5680e1AcB0E98A3e301767481A2D56B35aeDe615',
  '0x529b0c7E13eDC45E2618541407D66D9e33676e5d'
];

export const restrictedAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const currentUser = req.user as any;
    
    if (!currentUser) {
      return res.status(401).json({ 
        message: 'Authentication required',
        authorized: false 
      });
    }

    let isAuthorized = false;
    let authMethod = '';

    // Check email authentication
    const userEmail = currentUser.claims?.email || currentUser.email;
    if (userEmail && AUTHORIZED_EMAILS.includes(userEmail.toLowerCase())) {
      isAuthorized = true;
      authMethod = 'email';
    }

    // Check Facebook authentication
    const facebookUsername = currentUser.claims?.username || currentUser.facebookId;
    if (facebookUsername && AUTHORIZED_FACEBOOK_USERS.includes(facebookUsername)) {
      isAuthorized = true;
      authMethod = 'facebook';
    }

    // Check wallet authentication
    const walletAddress = currentUser.walletAddress || currentUser.claims?.wallet_address;
    if (walletAddress && AUTHORIZED_WALLETS.includes(walletAddress)) {
      isAuthorized = true;
      authMethod = 'wallet';
    }

    if (!isAuthorized) {
      return res.status(403).json({
        message: 'Access restricted to authorized users only',
        authorized: false,
        hint: 'Contact support@weparlay.io for access'
      });
    }

    // Log successful authorization
    console.log(`🔐 Authorized access: ${authMethod} - ${userEmail || facebookUsername || walletAddress}`);
    
    req.authorizedUser = {
      isAuthorized: true,
      authMethod,
      identifier: userEmail || facebookUsername || walletAddress
    };

    next();
  } catch (error) {
    console.error('Authorization check error:', error);
    return res.status(500).json({ 
      message: 'Authorization check failed',
      authorized: false 
    });
  }
};

// Type declaration for Express Request
declare global {
  namespace Express {
    interface Request {
      authorizedUser?: {
        isAuthorized: boolean;
        authMethod: string;
        identifier: string;
      };
    }
  }
}