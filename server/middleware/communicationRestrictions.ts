import { Request, Response, NextFunction } from 'express';

interface AuthenticatedRequest extends Request {
  user?: any;
  messagingPermissions?: {
    canSendSMS: boolean;
    canSendMMS: boolean;
    canEditTemplates: boolean;
    isVIP: boolean;
    isAdmin: boolean;
  };
}

// Check SMS/MMS permissions based on user subscription tier
export const checkSmsPermissions = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const user = req.user;
  
  if (!user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const subscriptionTier = user.subscriptionTier || 'bronze';
  const role = user.role || 'user';

  // Define permissions based on tier and role
  req.messagingPermissions = {
    canSendSMS: ['vip', 'diamond'].includes(subscriptionTier) || role === 'admin',
    canSendMMS: subscriptionTier === 'diamond' || role === 'admin',
    canEditTemplates: role === 'admin',
    isVIP: ['vip', 'diamond'].includes(subscriptionTier),
    isAdmin: role === 'admin'
  };

  next();
};

// Check if user can send SMS (VIP+ only)
export const requireSmsPermission = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.messagingPermissions?.canSendSMS) {
    return res.status(403).json({ 
      message: 'SMS sending requires VIP subscription or higher',
      upgradeRequired: true 
    });
  }
  next();
};

// Check if user can send MMS (Diamond+ only)
export const requireMmsPermission = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.messagingPermissions?.canSendMMS) {
    return res.status(403).json({ 
      message: 'MMS sending requires Diamond subscription',
      upgradeRequired: true 
    });
  }
  next();
};

// Check if user can edit templates (Admin only)
export const requireTemplatePermission = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.messagingPermissions?.canEditTemplates) {
    return res.status(403).json({ 
      message: 'Template editing requires admin privileges' 
    });
  }
  next();
};

// Rate limiting for SMS/MMS based on tier
export const rateLimitByTier = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const user = req.user;
  const tier = user?.subscriptionTier || 'bronze';
  
  // Set rate limits based on subscription tier
  const limits = {
    bronze: 0,     // No SMS
    silver: 0,     // No SMS
    gold: 0,       // No SMS
    vip: 50,       // 50 SMS per day
    diamond: 200   // 200 SMS per day
  };

  req.rateLimit = limits[tier as keyof typeof limits] || 0;
  next();
};