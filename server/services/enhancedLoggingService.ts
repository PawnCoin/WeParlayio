/**
 * Enhanced Logging Service for WeParlay
 * Implements comprehensive audit logging, error tracking, and security monitoring
 */

import winston from 'winston';
import path from 'path';
import { Request } from 'express';

export interface LogContext {
  userId?: string;
  sessionId?: string;
  ip?: string;
  userAgent?: string;
  action?: string;
  resource?: string;
  timestamp?: string;
  requestId?: string;
}

export interface SecurityEvent {
  type: 'suspicious_activity' | 'failed_login' | 'rate_limit_exceeded' | 'sql_injection_attempt';
  severity: 'low' | 'medium' | 'high' | 'critical';
  context: LogContext;
  details: Record<string, any>;
}

export interface AuditEvent {
  action: string;
  resource: string;
  userId: string;
  changes?: Record<string, any>;
  previousValues?: Record<string, any>;
  context: LogContext;
}

export interface BettingEvent {
  type: 'bet_placed' | 'bet_settled' | 'deposit' | 'withdrawal' | 'bonus_awarded';
  userId: string;
  amount?: number;
  currency?: string;
  betId?: string;
  transactionId?: string;
  context: LogContext;
}

class EnhancedLoggingService {
  private logger: winston.Logger;
  private auditLogger: winston.Logger;
  private securityLogger: winston.Logger;
  private bettingLogger: winston.Logger;

  constructor() {
    // Main application logger
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'weparlay-api' },
      transports: [
        new winston.transports.File({ 
          filename: path.join('logs', 'error.log'), 
          level: 'error',
          maxsize: 10 * 1024 * 1024, // 10MB
          maxFiles: 5,
        }),
        new winston.transports.File({ 
          filename: path.join('logs', 'combined.log'),
          maxsize: 50 * 1024 * 1024, // 50MB
          maxFiles: 10,
        }),
      ],
    });

    // Audit logger for sensitive operations
    this.auditLogger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      defaultMeta: { service: 'weparlay-audit' },
      transports: [
        new winston.transports.File({ 
          filename: path.join('logs', 'audit.log'),
          maxsize: 100 * 1024 * 1024, // 100MB
          maxFiles: 20,
        }),
      ],
    });

    // Security logger for suspicious activities
    this.securityLogger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      defaultMeta: { service: 'weparlay-security' },
      transports: [
        new winston.transports.File({ 
          filename: path.join('logs', 'security.log'),
          maxsize: 50 * 1024 * 1024, // 50MB
          maxFiles: 15,
        }),
      ],
    });

    // Betting/financial logger
    this.bettingLogger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      defaultMeta: { service: 'weparlay-betting' },
      transports: [
        new winston.transports.File({ 
          filename: path.join('logs', 'betting.log'),
          maxsize: 200 * 1024 * 1024, // 200MB
          maxFiles: 30,
        }),
      ],
    });

    // Add console transport in development
    if (process.env.NODE_ENV !== 'production') {
      const consoleFormat = winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      );
      
      [this.logger, this.auditLogger, this.securityLogger, this.bettingLogger].forEach(logger => {
        logger.add(new winston.transports.Console({ format: consoleFormat }));
      });
    }

    // Create logs directory if it doesn't exist
    this.ensureLogsDirectory();
  }

  private ensureLogsDirectory() {
    try {
      const fs = require('fs');
      if (!fs.existsSync('logs')) {
        fs.mkdirSync('logs', { recursive: true });
      }
    } catch (error) {
      console.error('Failed to create logs directory:', error);
    }
  }

  private extractContextFromRequest(req: Request): LogContext {
    return {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      sessionId: req.sessionID,
      userId: (req as any).user?.id,
      timestamp: new Date().toISOString(),
      requestId: (req as any).requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  // General application logging
  info(message: string, meta?: Record<string, any>) {
    this.logger.info(message, meta);
  }

  warn(message: string, meta?: Record<string, any>) {
    this.logger.warn(message, meta);
  }

  error(message: string, error?: Error, meta?: Record<string, any>) {
    this.logger.error(message, { 
      error: error?.message,
      stack: error?.stack,
      ...meta 
    });
  }

  // Security event logging
  logSecurityEvent(event: SecurityEvent) {
    this.securityLogger.warn('Security Event', {
      type: event.type,
      severity: event.severity,
      context: event.context,
      details: event.details,
    });

    // Also log to main logger if severity is high or critical
    if (['high', 'critical'].includes(event.severity)) {
      this.logger.error(`Security Alert: ${event.type}`, {
        severity: event.severity,
        context: event.context,
        details: event.details,
      });
    }
  }

  // Audit logging for sensitive operations
  logAudit(event: AuditEvent) {
    this.auditLogger.info('Audit Event', {
      action: event.action,
      resource: event.resource,
      userId: event.userId,
      changes: event.changes,
      previousValues: event.previousValues,
      context: event.context,
    });
  }

  // Betting/financial event logging
  logBettingEvent(event: BettingEvent) {
    this.bettingLogger.info('Betting Event', {
      type: event.type,
      userId: event.userId,
      amount: event.amount,
      currency: event.currency,
      betId: event.betId,
      transactionId: event.transactionId,
      context: event.context,
    });

    // Critical financial events also go to audit log
    if (['withdrawal', 'deposit'].includes(event.type)) {
      this.logAudit({
        action: event.type,
        resource: 'user_balance',
        userId: event.userId,
        changes: { amount: event.amount, currency: event.currency },
        context: event.context,
      });
    }
  }

  // Request logging middleware helper
  logRequest(req: Request, statusCode: number, duration: number) {
    const context = this.extractContextFromRequest(req);
    
    const logData = {
      method: req.method,
      path: req.path,
      statusCode,
      duration,
      context,
    };

    if (statusCode >= 400) {
      this.logger.warn('HTTP Error', logData);
    } else {
      this.logger.info('HTTP Request', logData);
    }
  }

  // Failed login attempts
  logFailedLogin(req: Request, email: string, reason: string) {
    const context = this.extractContextFromRequest(req);
    
    this.logSecurityEvent({
      type: 'failed_login',
      severity: 'medium',
      context,
      details: {
        email: email.replace(/(.{2}).*(.{2}@.*)/, '$1***$2'), // Partially mask email
        reason,
        path: req.path,
      },
    });
  }

  // Suspicious activity detection
  logSuspiciousActivity(req: Request, activityType: string, details: Record<string, any>) {
    const context = this.extractContextFromRequest(req);
    
    this.logSecurityEvent({
      type: 'suspicious_activity',
      severity: 'high',
      context,
      details: {
        activityType,
        path: req.path,
        ...details,
      },
    });
  }

  // Rate limiting events
  logRateLimitExceeded(req: Request, limit: number) {
    const context = this.extractContextFromRequest(req);
    
    this.logSecurityEvent({
      type: 'rate_limit_exceeded',
      severity: 'medium',
      context,
      details: {
        limit,
        path: req.path,
      },
    });
  }

  // SQL injection attempts
  logSqlInjectionAttempt(req: Request, suspiciousInput: string) {
    const context = this.extractContextFromRequest(req);
    
    this.logSecurityEvent({
      type: 'sql_injection_attempt',
      severity: 'critical',
      context,
      details: {
        path: req.path,
        method: req.method,
        suspiciousInput: suspiciousInput.substring(0, 500), // Limit size
        body: JSON.stringify(req.body).substring(0, 1000),
      },
    });
  }

  // Performance monitoring
  logSlowQuery(query: string, duration: number, context?: LogContext) {
    this.logger.warn('Slow Query Detected', {
      query: query.substring(0, 500),
      duration,
      context,
    });
  }

  // Database transaction logging
  logTransaction(userId: string, type: string, amount: number, currency: string, context?: LogContext) {
    this.logBettingEvent({
      type: type as any,
      userId,
      amount,
      currency,
      context: context || { timestamp: new Date().toISOString() },
    });
  }

  // Admin action logging
  logAdminAction(adminId: string, action: string, targetResource: string, changes: Record<string, any>, req?: Request) {
    const context = req ? this.extractContextFromRequest(req) : { timestamp: new Date().toISOString() };
    
    this.logAudit({
      action: `admin_${action}`,
      resource: targetResource,
      userId: adminId,
      changes,
      context,
    });
  }
}

// Singleton instance
export const logger = new EnhancedLoggingService();
export default logger;