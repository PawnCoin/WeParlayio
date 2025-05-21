import { db } from '../db';
import { storage } from '../storage';
import { 
  bettingChallenges, 
  notifications,
  InsertNotification,
} from '@shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Service for handling notifications for betting challenges, invites, and other alerts
 */
export class NotificationService {
  /**
   * Send an email notification
   * @param to Email address to send to
   * @param subject Email subject
   * @param content Email content (HTML)
   * @returns Promise resolving to success status
   */
  async sendEmail(to: string, subject: string, content: string): Promise<boolean> {
    try {
      // In a real implementation, this would connect to an email service
      // For example, using SendGrid, Mailchimp, or AWS SES
      console.log(`Sending email to ${to} with subject "${subject}"`);
      console.log(`Email content: ${content}`);
      
      return true;
    } catch (error) {
      console.error('Error sending email notification:', error);
      return false;
    }
  }

  /**
   * Send an SMS notification
   * @param phoneNumber Phone number to send to
   * @param message SMS message content
   * @returns Promise resolving to success status
   */
  async sendSMS(phoneNumber: string, message: string): Promise<boolean> {
    try {
      // In a real implementation, this would connect to an SMS service
      // For example, using Twilio, Nexmo, or AWS SNS
      console.log(`Sending SMS to ${phoneNumber}`);
      console.log(`SMS content: ${message}`);
      
      return true;
    } catch (error) {
      console.error('Error sending SMS notification:', error);
      return false;
    }
  }

  /**
   * Send a push notification to a user's device
   * @param userId User ID to send to
   * @param title Notification title
   * @param body Notification body
   * @param data Additional data payload
   * @returns Promise resolving to success status
   */
  async sendPushNotification(
    userId: string, 
    title: string, 
    body: string, 
    data: any = {}
  ): Promise<boolean> {
    try {
      // In a real implementation, this would connect to a push notification service
      // For example, using Firebase Cloud Messaging, OneSignal, or AWS SNS
      console.log(`Sending push notification to user ${userId}`);
      console.log(`Push notification title: ${title}`);
      console.log(`Push notification body: ${body}`);
      console.log(`Push notification data:`, data);
      
      return true;
    } catch (error) {
      console.error('Error sending push notification:', error);
      return false;
    }
  }

  /**
   * Send an in-app notification that will be displayed when the user logs in
   * @param userId User ID to send to
   * @param type Notification type
   * @param message Notification message
   * @param link Optional link to navigate to
   * @returns Promise resolving to success status
   */
  async sendInAppNotification(
    userId: string,
    type: string,
    message: string,
    link?: string
  ): Promise<boolean> {
    try {
      const notification: InsertNotification = {
        userId,
        type,
        message,
        link,
        read: false
      };
      
      await storage.createNotification(notification);
      
      return true;
    } catch (error) {
      console.error('Error creating in-app notification:', error);
      return false;
    }
  }

  /**
   * Send a betting challenge invitation
   * @param challengeId ID of the challenge
   * @param fromUserId User ID who sent the challenge
   * @param toUserId User ID who receives the challenge (optional, if using email/phone)
   * @param toEmail Email address to send to (optional)
   * @param toPhone Phone number to send to (optional)
   * @returns Promise resolving to success status
   */
  async sendBettingChallenge(
    challengeId: string,
    fromUserId: string,
    toUserId?: string,
    toEmail?: string,
    toPhone?: string
  ): Promise<boolean> {
    try {
      // Get the challenge details
      const challenge = await storage.getBettingChallenge(parseInt(challengeId));
      if (!challenge) {
        throw new Error(`Challenge with ID ${challengeId} not found`);
      }
      
      // Update challenge to mark notification as sent
      await db
        .update(bettingChallenges)
        .set({ notificationSent: true })
        .where(eq(bettingChallenges.id, parseInt(challengeId)));
      
      // Get sender user details
      const fromUser = await storage.getUser(fromUserId);
      if (!fromUser) {
        throw new Error(`User with ID ${fromUserId} not found`);
      }
      
      const senderName = fromUser.username || fromUser.email || 'A WeParlay user';
      
      // Prepare notification messages
      const challengeAmount = challenge.isVirtual 
        ? `${challenge.amount} WeParlay Cash` 
        : `$${challenge.amount}`;
      
      const emailSubject = `New Betting Challenge from ${senderName} on WeParlay`;
      const emailContent = `
        <h2>You've been challenged to a bet!</h2>
        <p><strong>${senderName}</strong> has challenged you to a bet on ${challenge.eventName}.</p>
        <p>Amount: ${challengeAmount}</p>
        <p>Their pick: ${challenge.pick}</p>
        <p>Your side: ${challenge.oppositePick || 'The opposite side'}</p>
        ${challenge.customMessage ? `<p>Message: "${challenge.customMessage}"</p>` : ''}
        <p><a href="https://weparlay.io/challenges/${challenge.challengeUuid}">Click here to view and respond to this challenge</a></p>
      `;
      
      const smsContent = `WeParlay: ${senderName} challenged you to a ${challengeAmount} bet on ${challenge.eventName}. View: https://weparlay.io/challenges/${challenge.challengeUuid}`;
      
      // Send to specific user if userId is provided
      if (toUserId) {
        // Create in-app notification
        await this.sendInAppNotification(
          toUserId,
          'challenge',
          `${senderName} challenged you to a ${challengeAmount} bet on ${challenge.eventName}`,
          `/challenges/${challenge.challengeUuid}`
        );
        
        // Get user details for potential email/phone
        const toUser = await storage.getUser(toUserId);
        if (toUser?.email) {
          await this.sendEmail(toUser.email, emailSubject, emailContent);
        }
      }
      
      // Send to email if provided
      if (toEmail) {
        await this.sendEmail(toEmail, emailSubject, emailContent);
      }
      
      // Send to phone if provided
      if (toPhone) {
        await this.sendSMS(toPhone, smsContent);
      }
      
      return true;
    } catch (error) {
      console.error('Error sending betting challenge notification:', error);
      return false;
    }
  }
  
  /**
   * Notify a user that their challenge has been accepted
   * @param challengeId ID of the challenge
   * @returns Promise resolving to success status
   */
  async sendChallengeAcceptedNotification(challengeId: string): Promise<boolean> {
    try {
      // Get the challenge details
      const challenge = await storage.getBettingChallenge(parseInt(challengeId));
      if (!challenge) {
        throw new Error(`Challenge with ID ${challengeId} not found`);
      }
      
      // If createdBy is missing, we can't notify the creator
      if (!challenge.createdBy) {
        throw new Error(`Challenge creator ID is missing`);
      }
      
      // If acceptedBy is missing, the challenge hasn't been accepted
      if (!challenge.acceptedBy) {
        throw new Error(`Challenge acceptedBy is missing`);
      }
      
      // Get users
      const challenger = await storage.getUser(challenge.createdBy);
      const accepter = await storage.getUser(challenge.acceptedBy);
      
      if (!challenger || !accepter) {
        throw new Error(`User not found`);
      }
      
      const accepterName = accepter.username || accepter.email || 'Another user';
      
      // Send in-app notification to the challenge creator
      const challengeLink = `/challenges/${challenge.challengeUuid}`;
      const message = `${accepterName} has accepted your bet on ${challenge.eventName} for ${challenge.isVirtual ? 'WeParlay Cash' : '$'}${challenge.amount}`;
      
      await this.sendInAppNotification(
        challenge.createdBy,
        'challenge_accepted',
        message,
        challengeLink
      );
      
      // Also send push notification
      await this.sendPushNotification(
        challenge.createdBy,
        'Betting Challenge Accepted',
        message,
        { challengeId: challenge.id, link: challengeLink }
      );
      
      // Send email notification if the user has an email
      if (challenger.email) {
        const emailSubject = 'Your WeParlay Betting Challenge was Accepted';
        const emailContent = `
          <h2>Your betting challenge has been accepted!</h2>
          <p>${accepterName} has accepted your head-to-head bet on WeParlay.</p>
          <p><strong>Event:</strong> ${challenge.eventName}</p>
          <p><strong>Amount:</strong> ${challenge.isVirtual ? 'WeParlay Cash' : '$'}${challenge.amount}</p>
          <p><strong>Your Pick:</strong> ${challenge.pick}</p>
          <p><strong>Their Pick:</strong> ${challenge.oppositePick || 'The opposite outcome'}</p>
          <p>Click the link below to view the challenge details:</p>
          <p><a href="https://weparlay.io/challenges/${challenge.challengeUuid}">View Challenge</a></p>
          <p>Good luck!</p>
          <p>The WeParlay Team</p>
        `;
        
        await this.sendEmail(challenger.email, emailSubject, emailContent);
      }
      
      return true;
    } catch (error) {
      console.error('Error sending challenge accepted notification:', error);
      return false;
    }
  }
  
  /**
   * Notify users about the result of a settled bet
   * @param challengeId ID of the challenge
   * @param winnerId ID of the winning user (if any)
   * @param isDraw Whether the bet resulted in a draw
   * @returns Promise resolving to success status
   */
  async sendBetResultNotification(
    challengeId: string,
    winnerId?: string,
    isDraw: boolean = false
  ): Promise<boolean> {
    try {
      // Get the challenge details
      const challenge = await storage.getBettingChallenge(parseInt(challengeId));
      if (!challenge) {
        throw new Error(`Challenge with ID ${challengeId} not found`);
      }
      
      // If createdBy is missing, we can't notify the creator
      if (!challenge.createdBy) {
        throw new Error(`Challenge creator ID is missing`);
      }
      
      // If acceptedBy is missing, the challenge hasn't been accepted
      if (!challenge.acceptedBy) {
        throw new Error(`Challenge acceptedBy is missing`);
      }
      
      // Get users
      const challenger = await storage.getUser(challenge.createdBy);
      const accepter = await storage.getUser(challenge.acceptedBy);
      
      if (!challenger || !accepter) {
        throw new Error(`User not found`);
      }
      
      const challengeLink = `/challenges/${challenge.challengeUuid}`;
      
      // Handle draw case
      if (isDraw) {
        const drawMessage = `Your bet on ${challenge.eventName} ended in a draw. Your ${challenge.isVirtual ? 'WeParlay Cash' : 'funds'} have been refunded.`;
        
        // Notify both users
        await this.sendInAppNotification(
          challenge.createdBy,
          'bet_result',
          drawMessage,
          challengeLink
        );
        
        await this.sendInAppNotification(
          challenge.acceptedBy,
          'bet_result',
          drawMessage,
          challengeLink
        );
        
        // Push notifications
        await this.sendPushNotification(
          challenge.createdBy,
          'Betting Result: Draw',
          drawMessage,
          { challengeId: challenge.id, link: challengeLink }
        );
        
        await this.sendPushNotification(
          challenge.acceptedBy,
          'Betting Result: Draw',
          drawMessage,
          { challengeId: challenge.id, link: challengeLink }
        );
        
        // Email notifications
        if (challenger.email) {
          const emailSubject = 'Your WeParlay Bet Ended in a Draw';
          await this.sendEmail(
            challenger.email,
            emailSubject,
            `<h2>Your bet ended in a draw</h2><p>${drawMessage}</p><p><a href="https://weparlay.io/challenges/${challenge.challengeUuid}">View Details</a></p>`
          );
        }
        
        if (accepter.email) {
          const emailSubject = 'Your WeParlay Bet Ended in a Draw';
          await this.sendEmail(
            accepter.email,
            emailSubject,
            `<h2>Your bet ended in a draw</h2><p>${drawMessage}</p><p><a href="https://weparlay.io/challenges/${challenge.challengeUuid}">View Details</a></p>`
          );
        }
        
        return true;
      }
      
      // Handle win/loss case
      if (winnerId) {
        const winner = winnerId === challenge.createdBy ? challenger : accepter;
        const loser = winnerId === challenge.createdBy ? accepter : challenger;
        
        if (!winner || !loser) {
          throw new Error(`Winner or loser user not found`);
        }
        
        const winnerName = winner.username || winner.email || 'You';
        const loserName = loser.username || loser.email || 'Your opponent';
        
        // Notify winner
        const winMessage = `Congratulations! You won your bet on ${challenge.eventName} against ${loserName}. ${challenge.isVirtual ? 'WeParlay Cash' : 'Funds'} have been added to your account.`;
        
        await this.sendInAppNotification(
          winnerId,
          'bet_result',
          winMessage,
          challengeLink
        );
        
        await this.sendPushNotification(
          winnerId,
          'Betting Result: You Won!',
          winMessage,
          { challengeId: challenge.id, link: challengeLink }
        );
        
        if (winner.email) {
          const emailSubject = 'You Won Your WeParlay Bet!';
          await this.sendEmail(
            winner.email,
            emailSubject,
            `<h2>You won your bet!</h2><p>${winMessage}</p><p><a href="https://weparlay.io/challenges/${challenge.challengeUuid}">View Details</a></p>`
          );
        }
        
        // Notify loser
        const loserId = winnerId === challenge.createdBy ? challenge.acceptedBy : challenge.createdBy;
        const loseMessage = `You lost your bet on ${challenge.eventName} against ${winnerName}.`;
        
        await this.sendInAppNotification(
          loserId,
          'bet_result',
          loseMessage,
          challengeLink
        );
        
        await this.sendPushNotification(
          loserId,
          'Betting Result: Better Luck Next Time',
          loseMessage,
          { challengeId: challenge.id, link: challengeLink }
        );
        
        if (loser.email) {
          const emailSubject = 'Your WeParlay Bet Result';
          await this.sendEmail(
            loser.email,
            emailSubject,
            `<h2>Your bet has been settled</h2><p>${loseMessage}</p><p><a href="https://weparlay.io/challenges/${challenge.challengeUuid}">View Details</a></p>`
          );
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error sending bet result notification:', error);
      return false;
    }
  }
}

export const notificationService = new NotificationService();