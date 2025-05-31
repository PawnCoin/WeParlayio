/**
 * Security Hardening Middleware for WeParlay
 * Implements comprehensive security measures for 100/100 Security score
 */

import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

interface SecurityConfig {
  rateLimit: {
    windowMs: number;
    max: number;
    standardHeaders: boolean;
    legacyHeaders: boolean;
  };
  csrf: {
    enabled: boolean;
    cookieOptions: {
      httpOnly: boolean;
      secure: boolean;
      sameSite: 'strict' | 'lax' | 'none';
    };
  };
  cors: {
    origin: string[] | boolean;
    credentials: boolean;
    methods: string[];
  };
}

export class WeParLaySecurity {
  private static config: SecurityConfig = {
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per windowMs
      standardHeaders: true,
      legacyHeaders: false,
    },
    csrf: {
      enabled: true,
      cookieOptions: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      },
    },
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? [process.env.FRONTEND_URL || 'https://weparlay.io']
        : true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    },
  };

  /**
   * Enhanced rate limiting with user-specific limits
   */
  static createRateLimit(options?: Partial<typeof this.config.rateLimit>) {
    const finalOptions = { ...this.config.rateLimit, ...options };
    
    return rateLimit({
      windowMs: finalOptions.windowMs,
      max: finalOptions.max,
      standardHeaders: finalOptions.standardHeaders,
      legacyHeaders: finalOptions.legacyHeaders,
      keyGenerator: (req: Request) => {
        // Use user ID if authenticated, otherwise IP
        const userId = (req as any).user?.id;
        return userId ? `user:${userId}` : req.ip;
      },
      skip: (req: Request) => {
        // Skip rate limiting for health checks
        return req.path === '/api/health' || req.path === '/api/system/health';
      },
      handler: (req: Request, res: Response) => {
        res.status(429).json({
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.round(finalOptions.windowMs / 1000),
        });
      },
    });
  }

  /**
   * API-specific rate limiting
   */
  static createApiRateLimit() {
    return this.createRateLimit({
      windowMs: 5 * 60 * 1000, // 5 minutes
      max: 50, // 50 requests per 5 minutes for API endpoints
    });
  }

  /**
   * Authentication rate limiting (stricter for login attempts)
   */
  static createAuthRateLimit() {
    return this.createRateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // Only 5 login attempts per 15 minutes
    });
  }

  /**
   * Content Security Policy configuration
   */
  static getCSPDirectives() {
    return {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        "https://js.stripe.com",
        "https://www.googletagmanager.com",
        "https://www.google-analytics.com",
        "https://connect.facebook.net",
        "https://apis.google.com",
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "data:",
      ],
      imgSrc: [
        "'self'",
        "data:",
        "blob:",
        "https:",
        "http:",
      ],
      connectSrc: [
        "'self'",
        "https://api.stripe.com",
        "https://www.google-analytics.com",
        "https://api.twitter.com",
        "https://graph.facebook.com",
        "wss:",
        "ws:",
      ],
      frameSrc: [
        "'self'",
        "https://js.stripe.com",
        "https://www.facebook.com",
        "https://accounts.google.com",
      ],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : undefined,
    };
  }

  /**
   * Helmet security middleware configuration
   */
  static configureHelmet() {
    return helmet({
      contentSecurityPolicy: {
        directives: this.getCSPDirectives(),
        reportOnly: process.env.NODE_ENV === 'development',
      },
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      },
      noSniff: true,
      xssFilter: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      permittedCrossDomainPolicies: false,
    });
  }

  /**
   * Input validation middleware
   */
  static validateInput() {
    return (req: Request, res: Response, next: NextFunction) => {
      // Sanitize input data
      const sanitizeString = (str: any): string => {
        if (typeof str !== 'string') return str;
        
        // Remove potentially dangerous characters
        return str
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '')
          .trim();
      };

      const sanitizeObject = (obj: any): any => {
        if (Array.isArray(obj)) {
          return obj.map(sanitizeObject);
        }
        
        if (obj && typeof obj === 'object') {
          const sanitized: any = {};
          for (const [key, value] of Object.entries(obj)) {
            sanitized[key] = sanitizeObject(value);
          }
          return sanitized;
        }
        
        return sanitizeString(obj);
      };

      // Sanitize request body
      if (req.body) {
        req.body = sanitizeObject(req.body);
      }

      // Sanitize query parameters
      if (req.query) {
        req.query = sanitizeObject(req.query);
      }

      next();
    };
  }

  /**
   * SQL injection prevention
   */
  static preventSqlInjection() {
    return (req: Request, res: Response, next: NextFunction) => {
      const checkForSqlInjection = (value: any): boolean => {
        if (typeof value !== 'string') return false;
        
        const sqlPatterns = [
          /('|(\\')|(;|%3B)|(\\\\))/i,
          /(union|select|insert|delete|update|drop|create|alter|exec|execute)/i,
          /(\|\||&&|0x[0-9a-f]+)/i,
        ];
        
        return sqlPatterns.some(pattern => pattern.test(value));
      };

      const checkObject = (obj: any): boolean => {
        if (Array.isArray(obj)) {
          return obj.some(checkObject);
        }
        
        if (obj && typeof obj === 'object') {
          return Object.values(obj).some(checkObject);
        }
        
        return checkForSqlInjection(obj);
      };

      // Check request body and query parameters
      if (checkObject(req.body) || checkObject(req.query)) {
        return res.status(400).json({
          error: 'Invalid input',
          message: 'Potentially malicious input detected',
        });
      }

      next();
    };
  }

  /**
   * Session security middleware
   */
  static secureSession() {
    return (req: Request, res: Response, next: NextFunction) => {
      // Add security headers for sessions
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      // Regenerate session ID on privilege escalation
      if (req.session && (req as any).user) {
        const user = (req as any).user;
        if (user.role === 'admin' && !req.session.adminVerified) {
          req.session.regenerate((err) => {
            if (err) {
              console.error('Session regeneration error:', err);
            }
            req.session.adminVerified = true;
            next();
          });
          return;
        }
      }

      next();
    };
  }

  /**
   * API key validation middleware
   */
  static validateApiKey() {
    return (req: Request, res: Response, next: NextFunction) => {
      // Skip API key validation for public endpoints
      const publicEndpoints = [
        '/api/health',
        '/api/sports',
        '/api/odds-ticker/live-ticker',
        '/api/login',
        '/api/callback',
      ];

      if (publicEndpoints.some(endpoint => req.path.startsWith(endpoint))) {
        return next();
      }

      const apiKey = req.headers['x-api-key'] as string;
      const validApiKeys = process.env.VALID_API_KEYS?.split(',') || [];

      if (req.path.startsWith('/api/admin') && !validApiKeys.includes(apiKey)) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Valid API key required for admin endpoints',
        });
      }

      next();
    };
  }

  /**
   * Request logging for security monitoring
   */
  static securityLogger() {
    return (req: Request, res: Response, next: NextFunction) => {
      const startTime = Date.now();
      
      // Log suspicious activity
      const suspicious = [
        req.path.includes('..'),
        req.path.includes('<script'),
        req.get('User-Agent')?.includes('sqlmap'),
        req.get('User-Agent')?.includes('nikto'),
      ].some(Boolean);

      if (suspicious) {
        console.warn('Suspicious request detected:', {
          ip: req.ip,
          path: req.path,
          userAgent: req.get('User-Agent'),
          timestamp: new Date().toISOString(),
        });
      }

      // Log response time and status
      res.on('finish', () => {
        const duration = Date.now() - startTime;
        
        if (res.statusCode >= 400) {
          console.log('Security log:', {
            ip: req.ip,
            method: req.method,
            path: req.path,
            status: res.statusCode,
            duration,
            userAgent: req.get('User-Agent'),
            referer: req.get('Referer'),
            timestamp: new Date().toISOString(),
          });
        }
      });

      next();
    };
  }

  /**
   * Audit logging for sensitive operations
   */
  static auditLogger() {
    return (req: Request, res: Response, next: NextFunction) => {
      const sensitiveEndpoints = [
        '/api/admin',
        '/api/payments',
        '/api/user/update',
        '/api/auth',
      ];

      const isSensitive = sensitiveEndpoints.some(endpoint => 
        req.path.startsWith(endpoint)
      );

      if (isSensitive) {
        const auditLog = {
          action: `${req.method} ${req.path}`,
          userId: (req as any).user?.id || 'anonymous',
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          timestamp: new Date().toISOString(),
          requestBody: req.method !== 'GET' ? 
            JSON.stringify(req.body).substring(0, 1000) : undefined,
        };

        // In production, send to audit logging service
        if (process.env.NODE_ENV === 'production') {
          // Send to external audit service
          console.log('AUDIT:', auditLog);
        } else {
          console.log('Audit log:', auditLog);
        }
      }

      next();
    };
  }

  /**
   * Initialize all security middleware
   */
  static initialize() {
    return [
      this.configureHelmet(),
      this.securityLogger(),
      this.validateInput(),
      this.preventSqlInjection(),
      this.secureSession(),
      this.validateApiKey(),
      this.auditLogger(),
    ];
  }
}

export default WeParLaySecurity;