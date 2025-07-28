/**
 * Two-Factor Authentication Service for WeParlay
 * Implements TOTP-based 2FA with backup codes and SMS fallback
 */

import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import crypto from 'crypto';
import { logger } from './enhancedLoggingService';

export interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
  manualEntryKey: string;
}

export interface TwoFactorVerification {
  isValid: boolean;
  type: 'totp' | 'backup' | 'sms';
  usedBackupCode?: string;
}

export class TwoFactorAuthService {
  private static readonly ISSUER = 'WeParlay.io';
  private static readonly BACKUP_CODES_COUNT = 10;
  private static readonly BACKUP_CODE_LENGTH = 8;

  /**
   * Generate 2FA setup for a user
   */
  static async generateTwoFactorSetup(userId: string, userEmail: string): Promise<TwoFactorSetup> {
    try {
      // Generate secret key
      const secret = speakeasy.generateSecret({
        name: userEmail,
        issuer: this.ISSUER,
        length: 32,
      });

      // Generate QR code
      const qrCode = await qrcode.toDataURL(secret.otpauth_url!);

      // Generate backup codes
      const backupCodes = this.generateBackupCodes();

      logger.logAudit({
        action: '2fa_setup_initiated',
        resource: 'user_security',
        userId,
        context: { 
          timestamp: new Date().toISOString(),
          userAgent: 'system'
        },
      });

      return {
        secret: secret.base32,
        qrCode,
        backupCodes,
        manualEntryKey: secret.base32,
      };
    } catch (error) {
      logger.error('Failed to generate 2FA setup', error, { userId });
      throw new Error('Failed to generate 2FA setup');
    }
  }

  /**
   * Verify TOTP token
   */
  static verifyToken(secret: string, token: string, window = 1): boolean {
    try {
      return speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window,
      });
    } catch (error) {
      logger.error('TOTP verification failed', error);
      return false;
    }
  }

  /**
   * Verify 2FA attempt (TOTP, backup code, or SMS)
   */
  static async verifyTwoFactorAttempt(
    userId: string,
    secret: string,
    token: string,
    backupCodes: string[],
    smsCode?: string
  ): Promise<TwoFactorVerification> {
    try {
      // First try TOTP
      if (this.verifyToken(secret, token)) {
        logger.logAudit({
          action: '2fa_verification_success',
          resource: 'user_authentication',
          userId,
          changes: { method: 'totp' },
          context: { timestamp: new Date().toISOString() },
        });

        return {
          isValid: true,
          type: 'totp',
        };
      }

      // Try backup codes
      const matchingBackupCode = backupCodes.find(code => 
        this.constantTimeCompare(code, token)
      );

      if (matchingBackupCode) {
        logger.logAudit({
          action: '2fa_verification_success',
          resource: 'user_authentication',
          userId,
          changes: { method: 'backup_code' },
          context: { timestamp: new Date().toISOString() },
        });

        return {
          isValid: true,
          type: 'backup',
          usedBackupCode: matchingBackupCode,
        };
      }

      // Try SMS if provided
      if (smsCode && this.verifySmsCode(userId, smsCode)) {
        logger.logAudit({
          action: '2fa_verification_success',
          resource: 'user_authentication',
          userId,
          changes: { method: 'sms' },
          context: { timestamp: new Date().toISOString() },
        });

        return {
          isValid: true,
          type: 'sms',
        };
      }

      // Log failed attempt
      logger.logSecurityEvent({
        type: 'failed_login',
        severity: 'medium',
        context: { 
          userId,
          timestamp: new Date().toISOString() 
        },
        details: {
          reason: '2fa_verification_failed',
          attemptedMethods: [
            token ? 'totp' : null,
            smsCode ? 'sms' : null,
          ].filter(Boolean),
        },
      });

      return {
        isValid: false,
        type: 'totp',
      };
    } catch (error) {
      logger.error('2FA verification error', error, { userId });
      return {
        isValid: false,
        type: 'totp',
      };
    }
  }

  /**
   * Generate secure backup codes
   */
  private static generateBackupCodes(): string[] {
    const codes: string[] = [];
    
    for (let i = 0; i < this.BACKUP_CODES_COUNT; i++) {
      const code = crypto
        .randomBytes(this.BACKUP_CODE_LENGTH / 2)
        .toString('hex')
        .toUpperCase();
      codes.push(code);
    }

    return codes;
  }

  /**
   * Regenerate backup codes for a user
   */
  static regenerateBackupCodes(userId: string): string[] {
    const newCodes = this.generateBackupCodes();

    logger.logAudit({
      action: '2fa_backup_codes_regenerated',
      resource: 'user_security',
      userId,
      context: { timestamp: new Date().toISOString() },
    });

    return newCodes;
  }

  /**
   * Hash backup codes for secure storage
   */
  static hashBackupCodes(codes: string[]): string[] {
    return codes.map(code => 
      crypto.createHash('sha256').update(code).digest('hex')
    );
  }

  /**
   * Verify backup code against hashed codes
   */
  static verifyBackupCode(code: string, hashedCodes: string[]): string | null {
    const hashedInput = crypto.createHash('sha256').update(code.toUpperCase()).digest('hex');
    return hashedCodes.find(hashedCode => 
      this.constantTimeCompare(hashedCode, hashedInput)
    ) || null;
  }

  /**
   * Constant time string comparison to prevent timing attacks
   */
  private static constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }

  /**
   * Generate SMS code for fallback authentication
   */
  static generateSmsCode(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Store SMS code temporarily (in production, use Redis or similar)
   */
  private static smsCodeStore = new Map<string, { code: string; expires: number }>();

  static storeSmsCode(userId: string, code: string, expirationMinutes = 5): void {
    const expires = Date.now() + (expirationMinutes * 60 * 1000);
    this.smsCodeStore.set(userId, { code, expires });

    // Clean up expired codes
    setTimeout(() => {
      this.smsCodeStore.delete(userId);
    }, expirationMinutes * 60 * 1000);
  }

  /**
   * Verify SMS code
   */
  private static verifySmsCode(userId: string, inputCode: string): boolean {
    const stored = this.smsCodeStore.get(userId);
    
    if (!stored || Date.now() > stored.expires) {
      this.smsCodeStore.delete(userId);
      return false;
    }

    const isValid = this.constantTimeCompare(stored.code, inputCode);
    
    if (isValid) {
      this.smsCodeStore.delete(userId);
    }

    return isValid;
  }

  /**
   * Check if 2FA is required for user action
   */
  static requiresTwoFactor(action: string, userTier: string): boolean {
    const highSecurityActions = [
      'withdraw_funds',
      'change_password',
      'update_payment_method',
      'admin_access',
      'large_bet', // Bets over certain threshold
      'account_deletion',
    ];

    const vipRequiredActions = [
      'admin_access',
      'account_deletion',
    ];

    if (vipRequiredActions.includes(action)) {
      return ['gold', 'platinum', 'admin'].includes(userTier);
    }

    return highSecurityActions.includes(action);
  }

  /**
   * Rate limiting for 2FA attempts
   */
  private static attemptStore = new Map<string, { attempts: number; lockUntil?: number }>();

  static checkRateLimit(userId: string): { allowed: boolean; remainingAttempts?: number; lockUntil?: number } {
    const key = `2fa_${userId}`;
    const now = Date.now();
    const maxAttempts = 5;
    const lockDuration = 15 * 60 * 1000; // 15 minutes
    const windowDuration = 5 * 60 * 1000; // 5 minutes

    let record = this.attemptStore.get(key);

    // Clean up expired locks
    if (record?.lockUntil && now > record.lockUntil) {
      record = { attempts: 0 };
      this.attemptStore.set(key, record);
    }

    // Check if locked
    if (record?.lockUntil && now < record.lockUntil) {
      return {
        allowed: false,
        lockUntil: record.lockUntil,
      };
    }

    // Initialize or reset if outside window
    if (!record) {
      record = { attempts: 0 };
      this.attemptStore.set(key, record);
    }

    // Check attempts
    if (record.attempts >= maxAttempts) {
      record.lockUntil = now + lockDuration;
      this.attemptStore.set(key, record);

      logger.logSecurityEvent({
        type: 'rate_limit_exceeded',
        severity: 'high',
        context: { 
          userId,
          timestamp: new Date().toISOString() 
        },
        details: {
          action: '2fa_verification',
          attempts: record.attempts,
          lockDuration: lockDuration / 1000,
        },
      });

      return {
        allowed: false,
        lockUntil: record.lockUntil,
      };
    }

    return {
      allowed: true,
      remainingAttempts: maxAttempts - record.attempts,
    };
  }

  static recordAttempt(userId: string, success: boolean): void {
    const key = `2fa_${userId}`;
    const record = this.attemptStore.get(key) || { attempts: 0 };

    if (success) {
      // Reset on success
      this.attemptStore.delete(key);
    } else {
      // Increment attempts on failure
      record.attempts++;
      this.attemptStore.set(key, record);
    }
  }

  /**
   * Disable 2FA for a user (with proper verification)
   */
  static async disableTwoFactor(userId: string, currentToken: string, secret: string): Promise<boolean> {
    if (!this.verifyToken(secret, currentToken)) {
      logger.logSecurityEvent({
        type: 'suspicious_activity',
        severity: 'high',
        context: { 
          userId,
          timestamp: new Date().toISOString() 
        },
        details: {
          action: 'attempted_2fa_disable_with_invalid_token',
        },
      });
      return false;
    }

    logger.logAudit({
      action: '2fa_disabled',
      resource: 'user_security',
      userId,
      context: { timestamp: new Date().toISOString() },
    });

    return true;
  }
}

export default TwoFactorAuthService;