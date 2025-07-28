import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TwoFactorAuthService } from '../services/twoFactorAuthService';

describe('TwoFactorAuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateTwoFactorSetup', () => {
    it('should generate valid 2FA setup', async () => {
      const setup = await TwoFactorAuthService.generateTwoFactorSetup('user123', 'test@example.com');
      
      expect(setup).toHaveProperty('secret');
      expect(setup).toHaveProperty('qrCode');
      expect(setup).toHaveProperty('backupCodes');
      expect(setup).toHaveProperty('manualEntryKey');
      
      expect(setup.secret).toBeTruthy();
      expect(setup.qrCode).toContain('data:image/png;base64');
      expect(setup.backupCodes).toHaveLength(10);
      expect(setup.backupCodes.every(code => code.length === 8)).toBe(true);
    });
  });

  describe('verifyToken', () => {
    it('should verify valid TOTP token', () => {
      // This would need a fixed secret and timestamp for reliable testing
      // In practice, you'd mock the speakeasy library
      const secret = 'JBSWY3DPEHPK3PXP';
      const mockToken = '123456';
      
      // Mock speakeasy.totp.verify to return true for valid tokens
      vi.mock('speakeasy', () => ({
        totp: {
          verify: vi.fn().mockReturnValue(true),
        },
        generateSecret: vi.fn().mockReturnValue({
          base32: secret,
          otpauth_url: 'otpauth://totp/test@example.com?secret=JBSWY3DPEHPK3PXP&issuer=WeParlay.io',
        }),
      }));

      const result = TwoFactorAuthService.verifyToken(secret, mockToken);
      expect(result).toBe(true);
    });

    it('should reject invalid TOTP token', () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      const invalidToken = 'invalid';
      
      vi.mock('speakeasy', () => ({
        totp: {
          verify: vi.fn().mockReturnValue(false),
        },
      }));

      const result = TwoFactorAuthService.verifyToken(secret, invalidToken);
      expect(result).toBe(false);
    });
  });

  describe('hashBackupCodes', () => {
    it('should hash backup codes securely', () => {
      const codes = ['ABC12345', 'DEF67890'];
      const hashed = TwoFactorAuthService.hashBackupCodes(codes);
      
      expect(hashed).toHaveLength(2);
      expect(hashed[0]).not.toBe(codes[0]);
      expect(hashed[1]).not.toBe(codes[1]);
      expect(hashed[0]).toMatch(/^[a-f0-9]{64}$/); // SHA-256 hex
      expect(hashed[1]).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe('verifyBackupCode', () => {
    it('should verify valid backup code', () => {
      const originalCode = 'ABC12345';
      const hashedCodes = TwoFactorAuthService.hashBackupCodes([originalCode]);
      
      const result = TwoFactorAuthService.verifyBackupCode(originalCode, hashedCodes);
      expect(result).toBe(hashedCodes[0]);
    });

    it('should reject invalid backup code', () => {
      const originalCode = 'ABC12345';
      const invalidCode = 'XYZ99999';
      const hashedCodes = TwoFactorAuthService.hashBackupCodes([originalCode]);
      
      const result = TwoFactorAuthService.verifyBackupCode(invalidCode, hashedCodes);
      expect(result).toBeNull();
    });
  });

  describe('requiresTwoFactor', () => {
    it('should require 2FA for high-security actions', () => {
      expect(TwoFactorAuthService.requiresTwoFactor('withdraw_funds', 'bronze')).toBe(true);
      expect(TwoFactorAuthService.requiresTwoFactor('change_password', 'silver')).toBe(true);
      expect(TwoFactorAuthService.requiresTwoFactor('admin_access', 'gold')).toBe(true);
    });

    it('should not require 2FA for low-security actions', () => {
      expect(TwoFactorAuthService.requiresTwoFactor('view_profile', 'bronze')).toBe(false);
      expect(TwoFactorAuthService.requiresTwoFactor('place_small_bet', 'silver')).toBe(false);
    });

    it('should respect tier requirements for admin actions', () => {
      expect(TwoFactorAuthService.requiresTwoFactor('admin_access', 'bronze')).toBe(false);
      expect(TwoFactorAuthService.requiresTwoFactor('admin_access', 'gold')).toBe(true);
      expect(TwoFactorAuthService.requiresTwoFactor('admin_access', 'admin')).toBe(true);
    });
  });

  describe('checkRateLimit', () => {
    it('should allow attempts within limit', () => {
      const result = TwoFactorAuthService.checkRateLimit('user123');
      expect(result.allowed).toBe(true);
      expect(result.remainingAttempts).toBe(5);
    });

    it('should handle rate limiting correctly', () => {
      const userId = 'user123';
      
      // Simulate 5 failed attempts
      for (let i = 0; i < 5; i++) {
        TwoFactorAuthService.recordAttempt(userId, false);
      }
      
      const result = TwoFactorAuthService.checkRateLimit(userId);
      expect(result.allowed).toBe(false);
      expect(result.lockUntil).toBeDefined();
    });
  });

  describe('generateSmsCode', () => {
    it('should generate 6-digit SMS code', () => {
      const code = TwoFactorAuthService.generateSmsCode();
      expect(code).toMatch(/^\d{6}$/);
      expect(parseInt(code)).toBeGreaterThanOrEqual(100000);
      expect(parseInt(code)).toBeLessThanOrEqual(999999);
    });
  });
});