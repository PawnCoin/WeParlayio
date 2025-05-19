import { User } from "@shared/schema";

// Notification types
export enum NotificationType {
  UserRegistration = 'user_registration',
  BetPlaced = 'bet_placed',
  BetWon = 'bet_won',
  BetLost = 'bet_lost',
  Deposit = 'deposit',
  Withdrawal = 'withdrawal',
  SystemAlert = 'system_alert',
  TournamentEntry = 'tournament_entry',
  PaymentIssue = 'payment_issue',
  SecurityAlert = 'security_alert'
}

// Notification priority levels
export enum NotificationPriority {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
  Critical = 'critical'
}

// Notification channels
export enum NotificationChannel {
  Email = 'email',
  Push = 'push',
  SMS = 'sms',
  InApp = 'in_app'
}

// Notification interface
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  recipientId: string;
  priority: NotificationPriority;
  createdAt: Date;
  readAt?: Date;
  channels: NotificationChannel[];
  metadata?: Record<string, any>;
}

// Admin notification settings
interface AdminNotificationSettings {
  newUsers: boolean;
  highValueBets: boolean;
  paymentIssues: boolean;
  securityAlerts: boolean;
  systemErrors: boolean;
  withdrawalRequests: boolean;
  dailySummary: boolean;
  weeklyReport: boolean;
}

// Default admin notification settings
const defaultAdminSettings: AdminNotificationSettings = {
  newUsers: true,
  highValueBets: true,
  paymentIssues: true,
  securityAlerts: true,
  systemErrors: true,
  withdrawalRequests: true,
  dailySummary: true,
  weeklyReport: true
};

class NotificationService {
  private adminSettings: AdminNotificationSettings = defaultAdminSettings;
  private adminEmail: string = 'support@weparlay.io';

  constructor() {
    // Initialize admin settings
    this.loadAdminSettings();
  }

  private loadAdminSettings(): void {
    // In a real implementation, this would load from database
    // For now, use default settings
    this.adminSettings = defaultAdminSettings;
  }

  /**
   * Send notification to user
   */
  async notifyUser(
    user: User, 
    type: NotificationType, 
    title: string, 
    message: string, 
    priority: NotificationPriority = NotificationPriority.Medium,
    channels: NotificationChannel[] = [NotificationChannel.InApp]
  ): Promise<void> {
    console.log(`Notification sent to user ${user.id}: ${title}`);
    
    // In a real implementation, this would:
    // 1. Record the notification in the database
    // 2. Send through appropriate channels (email, push, etc.)
    // 3. Handle failures and retries

    // For email notifications, would use SendGrid, Mailgun, etc.
    if (channels.includes(NotificationChannel.Email) && user.email) {
      await this.sendEmail(
        user.email,
        title,
        message,
        type
      );
    }
  }

  /**
   * Send notification to admin/site owner
   */
  async notifyAdmin(
    type: NotificationType, 
    title: string, 
    message: string, 
    priority: NotificationPriority = NotificationPriority.Medium,
    metadata?: Record<string, any>
  ): Promise<void> {
    // Check if this notification type should be sent to admin based on settings
    if (!this.shouldNotifyAdmin(type)) {
      return;
    }

    console.log(`Admin notification: ${title}`);
    
    // Always send critical notifications via email
    if (priority === NotificationPriority.Critical || priority === NotificationPriority.High) {
      await this.sendEmail(
        this.adminEmail,
        `[${priority.toUpperCase()}] ${title}`,
        message,
        type,
        metadata
      );
    }
    
    // For non-critical notifications, respect the channel preferences
    else {
      // Store for the admin dashboard
      this.storeAdminNotification(type, title, message, priority, metadata);
    }
  }

  /**
   * Check if admin should be notified based on settings
   */
  private shouldNotifyAdmin(type: NotificationType): boolean {
    switch (type) {
      case NotificationType.UserRegistration:
        return this.adminSettings.newUsers;
      case NotificationType.BetPlaced:
        return this.adminSettings.highValueBets;
      case NotificationType.PaymentIssue:
        return this.adminSettings.paymentIssues;
      case NotificationType.SecurityAlert:
        return this.adminSettings.securityAlerts;
      case NotificationType.SystemAlert:
        return this.adminSettings.systemErrors;
      case NotificationType.Withdrawal:
        return this.adminSettings.withdrawalRequests;
      default:
        return false;
    }
  }

  /**
   * Send email notification
   */
  private async sendEmail(
    to: string,
    subject: string,
    message: string,
    type: NotificationType,
    metadata?: Record<string, any>
  ): Promise<void> {
    // In a real implementation, this would use SendGrid, AWS SES, etc.
    // For now, just log it
    console.log(`Email to ${to}: ${subject}`);
    console.log(`Message: ${message}`);
    console.log(`Type: ${type}`);
    if (metadata) {
      console.log(`Metadata: ${JSON.stringify(metadata)}`);
    }
  }

  /**
   * Store admin notification for dashboard
   */
  private storeAdminNotification(
    type: NotificationType,
    title: string,
    message: string,
    priority: NotificationPriority,
    metadata?: Record<string, any>
  ): void {
    // In a real implementation, this would store in database
    // For demo purposes, just log it
    console.log(`Stored admin notification: ${title}`);
  }

  /**
   * Notify about new user registration
   */
  async notifyNewUserRegistration(user: User): Promise<void> {
    const title = 'New User Registration';
    const message = `New user registered: ${user.firstName} ${user.lastName} (${user.email})`;
    
    await this.notifyAdmin(
      NotificationType.UserRegistration,
      title,
      message,
      NotificationPriority.Medium,
      { userId: user.id }
    );
  }

  /**
   * Notify about high value bet
   */
  async notifyHighValueBet(userId: string, betAmount: number, betDetails: any): Promise<void> {
    const title = 'High Value Bet Placed';
    const message = `User ID ${userId} placed a bet of $${betAmount}`;
    
    await this.notifyAdmin(
      NotificationType.BetPlaced,
      title,
      message,
      NotificationPriority.Medium,
      { userId, betAmount, betDetails }
    );
  }

  /**
   * Notify about payment issue
   */
  async notifyPaymentIssue(userId: string, amount: number, details: string): Promise<void> {
    const title = 'Payment Issue Detected';
    const message = `Payment issue for User ID ${userId}: ${details}`;
    
    await this.notifyAdmin(
      NotificationType.PaymentIssue,
      title,
      message,
      NotificationPriority.High,
      { userId, amount }
    );
  }

  /**
   * Notify about security alert
   */
  async notifySecurityAlert(details: string, severity: string): Promise<void> {
    const title = 'Security Alert';
    const message = `Security alert: ${details}`;
    
    const priority = severity === 'critical' 
      ? NotificationPriority.Critical 
      : NotificationPriority.High;
    
    await this.notifyAdmin(
      NotificationType.SecurityAlert,
      title,
      message,
      priority,
      { severity }
    );
  }

  /**
   * Notify about system error
   */
  async notifySystemError(errorMessage: string, stack?: string): Promise<void> {
    const title = 'System Error Detected';
    const message = `System error: ${errorMessage}`;
    
    await this.notifyAdmin(
      NotificationType.SystemAlert,
      title,
      message,
      NotificationPriority.High,
      { stack }
    );
  }

  /**
   * Notify about withdrawal request
   */
  async notifyWithdrawalRequest(userId: string, amount: number): Promise<void> {
    const title = 'Withdrawal Request';
    const message = `User ID ${userId} requested withdrawal of $${amount}`;
    
    await this.notifyAdmin(
      NotificationType.Withdrawal,
      title,
      message,
      NotificationPriority.Medium,
      { userId, amount }
    );
  }

  /**
   * Send daily summary to admin
   */
  async sendDailySummary(stats: any): Promise<void> {
    if (!this.adminSettings.dailySummary) {
      return;
    }

    const title = 'Daily Platform Summary';
    const message = `
      Daily summary for ${new Date().toLocaleDateString()}:
      - New users: ${stats.newUsers}
      - Active users: ${stats.activeUsers}
      - Total bets: ${stats.totalBets}
      - Bet volume: $${stats.betVolume}
      - Revenue: $${stats.revenue}
    `;
    
    await this.sendEmail(
      this.adminEmail,
      title,
      message,
      NotificationType.SystemAlert,
      stats
    );
  }

  /**
   * Update admin notification settings
   */
  updateAdminSettings(settings: Partial<AdminNotificationSettings>): void {
    this.adminSettings = {
      ...this.adminSettings,
      ...settings
    };
    
    // In a real implementation, save to database
    console.log('Admin notification settings updated:', this.adminSettings);
  }

  /**
   * Update admin email
   */
  updateAdminEmail(email: string): void {
    this.adminEmail = email;
    // In a real implementation, save to database
    console.log('Admin email updated:', this.adminEmail);
  }
}

// Create and export a singleton instance
export const notificationService = new NotificationService();