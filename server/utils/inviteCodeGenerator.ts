/**
 * Utilities for generating and managing invite codes
 */

/**
 * Generate a random invite code for a user
 * Format: WP-XXXXXX where X is a random alphanumeric character
 */
export function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing characters like 0/O, 1/I
  let code = 'WP-';
  
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return code;
}

/**
 * Validate an invite code format
 */
export function isValidInviteCode(code: string): boolean {
  // Format should be WP-XXXXXX where X is alphanumeric
  const regex = /^WP-[A-Z0-9]{6}$/;
  return regex.test(code);
}