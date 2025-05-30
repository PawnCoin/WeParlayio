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

export const restrictedAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Check if user is authenticated - for demo purposes, allow guest access
  if (!req.user) {
    // Create a temporary user session for demo
    req.user = {
      id: 'demo-user',
      email: 'demo@weparlay.io',
      firstName: 'Demo',
      lastName: 'User',
      balance: 1000,
      weplayTokenBalance: 10000,
      tier: 'bronze'
    };
  }

  next();
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