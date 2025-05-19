import { notificationService, NotificationPriority, NotificationType } from '../services/notificationService';
import { User } from '@shared/schema';

/**
 * User registration hook
 * This function is called after a new user is registered
 */
export async function afterUserRegistration(user: User): Promise<void> {
  // Notify the site owner about new user registration
  try {
    await notificationService.notifyNewUserRegistration(user);
    console.log(`Notification sent to admin for new user: ${user.id}`);
  } catch (error) {
    console.error('Failed to send new user notification:', error);
  }
}

/**
 * User login hook
 * This function is called after a user logs in
 */
export async function afterUserLogin(user: User): Promise<void> {
  // Only notify about suspicious logins or specific conditions
  // For example, first login from a new device or location
  const isSuspiciousLogin = false; // This would be determined by more logic
  
  if (isSuspiciousLogin) {
    try {
      await notificationService.notifySecurityAlert(
        `Suspicious login for user ${user.id}`,
        'medium'
      );
    } catch (error) {
      console.error('Failed to send suspicious login notification:', error);
    }
  }
}

/**
 * High value bet hook
 * This function is called when a high value bet is placed
 */
export async function onHighValueBet(userId: string, betAmount: number, betDetails: any): Promise<void> {
  // Threshold for high value bets that should notify the admin
  const HIGH_BET_THRESHOLD = 500; // $500
  
  if (betAmount >= HIGH_BET_THRESHOLD) {
    try {
      await notificationService.notifyHighValueBet(userId, betAmount, betDetails);
    } catch (error) {
      console.error('Failed to send high value bet notification:', error);
    }
  }
}

/**
 * Withdrawal request hook
 * This function is called when a user requests a withdrawal
 */
export async function onWithdrawalRequest(userId: string, amount: number): Promise<void> {
  // Notify admin about withdrawal requests
  try {
    await notificationService.notifyWithdrawalRequest(userId, amount);
  } catch (error) {
    console.error('Failed to send withdrawal request notification:', error);
  }
}

/**
 * Error logging hook
 * This function is called when a system error occurs
 */
export async function onSystemError(error: Error): Promise<void> {
  try {
    await notificationService.notifySystemError(error.message, error.stack);
  } catch (err) {
    console.error('Failed to send system error notification:', err);
  }
}