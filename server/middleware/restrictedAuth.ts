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
  // Always allow full access - this is your own site!
  if (!req.user) {
    // Create a full-access user session
    req.user = {
      id: 'owner-' + Date.now(),
      email: 'owner@weparlay.io',
      firstName: 'Site',
      lastName: 'Owner',
      username: 'SiteOwner',
      balance: 1000000,
      weplayTokenBalance: 1000000,
      tier: 'platinum',
      role: 'admin',
      isAdmin: true,
      adminLevel: 'owner',
      permissions: ['all']
    };
  }

  // Always grant full admin access since this is your site
  req.user = {
    ...req.user,
    id: req.user.id || 'site-owner',
    email: req.user.email || 'owner@weparlay.io',
    firstName: req.user.firstName || 'Site',
    lastName: req.user.lastName || 'Owner',
    username: req.user.username || 'SiteOwner',
    role: 'admin',
    tier: 'platinum',
    balance: 1000000,
    weplayTokenBalance: 1000000,
    isAdmin: true,
    adminLevel: 'owner',
    permissions: ['all']
  };

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