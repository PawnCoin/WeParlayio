import { db } from '../db';
import { User } from '@shared/schema';
import axios from 'axios';

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
      // In production, you would integrate with a service like SendGrid, Mailgun, etc.
      console.log(`[EMAIL NOTIFICATION] To: ${to}, Subject: ${subject}`);
      
      // For development/testing, we log the email instead of sending it
      console.log(`Email Content: ${content}`);
      
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
      // In production, you would integrate with a service like Twilio, Nexmo, etc.
      console.log(`[SMS NOTIFICATION] To: ${phoneNumber}`);
      console.log(`SMS Content: ${message}`);
      
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
  async sendPushNotification(userId: string, title: string, body: string, data: any = {}): Promise<boolean> {
    try {
      // In production, you would integrate with Firebase Cloud Messaging, OneSignal, etc.
      console.log(`[PUSH NOTIFICATION] To User: ${userId}`);
      console.log(`Title: ${title}, Body: ${body}`);
      console.log('Data:', data);
      
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
    type: 'challenge' | 'bet' | 'result' | 'system' | 'social', 
    message: string,
    link?: string
  ): Promise<boolean> {
    try {
      // Store the notification in the database
      const notification = {
        userId,
        type,
        message,
        link,
        createdAt: new Date(),
        read: false
      };
      
      // In a real implementation, you would store this in the database
      console.log(`[IN-APP NOTIFICATION] Stored for User: ${userId}`);
      console.log(`Type: ${type}, Message: ${message}`);
      
      return true;
    } catch (error) {
      console.error('Error sending in-app notification:', error);
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
      // Get the challenger's info
      const [challenger] = await db.select().from('users').where({ id: fromUserId });
      
      if (!challenger) {
        throw new Error('Challenger not found');
      }
      
      // Get challenge details
      const [challenge] = await db.select().from('betting_challenges').where({ id: challengeId });
      
      if (!challenge) {
        throw new Error('Challenge not found');
      }
      
      const challengeLink = `${process.env.APP_URL || 'https://weparlay.io'}/challenges/${challengeId}`;
      
      // Prepare notification content
      const challengerName = challenger.username || challenger.email || 'Someone';
      const subject = `${challengerName} has challenged you to a bet on WeParlay!`;
      const eventName = challenge.eventName || 'an event';
      const betAmount = challenge.amount ? `$${challenge.amount}` : 'a friendly bet';
      
      const emailContent = `
        <h2>You've Been Challenged!</h2>
        <p>${challengerName} has challenged you to ${betAmount} on ${eventName}.</p>
        <p>Click the link below to view the challenge and accept or decline:</p>
        <p><a href="${challengeLink}">${challengeLink}</a></p>
        <p>If you don't have a WeParlay account yet, you can create one when you open the link.</p>
        <p>Good luck!</p>
        <p>The WeParlay Team</p>
      `;
      
      const smsContent = `🏆 ${challengerName} has challenged you to ${betAmount} on ${eventName}. View and respond: ${challengeLink}`;
      
      const pushTitle = `New Betting Challenge!`;
      const pushBody = `${challengerName} has challenged you to ${betAmount} on ${eventName}.`;
      
      let notificationSent = false;
      
      // Send notification via all provided channels
      if (toUserId) {
        // Send in-app notification
        await this.sendInAppNotification(
          toUserId,
          'challenge',
          `${challengerName} has challenged you to ${betAmount} on ${eventName}.`,
          `/challenges/${challengeId}`
        );
        
        // Send push notification
        await this.sendPushNotification(toUserId, pushTitle, pushBody, { 
          challengeId, 
          type: 'challenge',
          link: `/challenges/${challengeId}`
        });
        
        notificationSent = true;
      }
      
      if (toEmail) {
        // Send email notification
        await this.sendEmail(toEmail, subject, emailContent);
        notificationSent = true;
      }
      
      if (toPhone) {
        // Send SMS notification
        await this.sendSMS(toPhone, smsContent);
        notificationSent = true;
      }
      
      // Update the challenge status to indicate notification was sent
      if (notificationSent) {
        await db.update('betting_challenges')
          .set({ notificationSent: true, updatedAt: new Date() })
          .where({ id: challengeId });
      }
      
      return notificationSent;
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
      // Get challenge details including challenger ID
      const [challenge] = await db.select().from('betting_challenges').where({ id: challengeId });
      
      if (!challenge) {
        throw new Error('Challenge not found');
      }
      
      // Get user details for both parties
      const [challenger] = await db.select().from('users').where({ id: challenge.createdBy });
      const [accepter] = await db.select().from('users').where({ id: challenge.acceptedBy });
      
      if (!challenger || !accepter) {
        throw new Error('User details not found');
      }
      
      const challengeLink = `${process.env.APP_URL || 'https://weparlay.io'}/challenges/${challengeId}`;
      
      // Prepare notification content
      const accepterName = accepter.username || accepter.email || 'Someone';
      const eventName = challenge.eventName || 'an event';
      
      // Notify the original challenger
      await this.sendInAppNotification(
        challenger.id,
        'challenge',
        `${accepterName} has accepted your challenge on ${eventName}!`,
        `/challenges/${challengeId}`
      );
      
      await this.sendPushNotification(
        challenger.id,
        'Challenge Accepted!',
        `${accepterName} has accepted your challenge on ${eventName}!`,
        { 
          challengeId, 
          type: 'challenge_accepted',
          link: `/challenges/${challengeId}`
        }
      );
      
      // If challenger has email, send email too
      if (challenger.email) {
        const emailContent = `
          <h2>Your Challenge Has Been Accepted!</h2>
          <p>${accepterName} has accepted your betting challenge on ${eventName}.</p>
          <p>View the active bet: <a href="${challengeLink}">${challengeLink}</a></p>
          <p>Good luck!</p>
          <p>The WeParlay Team</p>
        `;
        
        await this.sendEmail(
          challenger.email,
          `${accepterName} accepted your betting challenge!`,
          emailContent
        );
      }
      
      // Update challenge status
      await db.update('betting_challenges')
        .set({ 
          status: 'active',
          acceptedAt: new Date(),
          updatedAt: new Date()
        })
        .where({ id: challengeId });
      
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
      // Get challenge details
      const [challenge] = await db.select().from('betting_challenges').where({ id: challengeId });
      
      if (!challenge) {
        throw new Error('Challenge not found');
      }
      
      // Get user details
      const [challenger] = await db.select().from('users').where({ id: challenge.createdBy });
      const [accepter] = await db.select().from('users').where({ id: challenge.acceptedBy });
      
      if (!challenger || !accepter) {
        throw new Error('User details not found');
      }
      
      const eventName = challenge.eventName || 'the event';
      const betAmount = challenge.amount ? `$${challenge.amount}` : 'the bet';
      const challengeLink = `${process.env.APP_URL || 'https://weparlay.io'}/challenges/${challengeId}`;
      
      let winnerName = 'No one';
      let pushTitle = 'Bet Result';
      let pushBody = '';
      let emailSubject = '';
      let emailContent = '';
      
      if (isDraw) {
        // It's a draw
        pushTitle = 'Bet Ended in a Draw';
        pushBody = `Your bet on ${eventName} ended in a draw. The bet amount has been returned.`;
        emailSubject = `Your bet on ${eventName} ended in a draw`;
        emailContent = `
          <h2>Bet Result: Draw</h2>
          <p>Your bet on ${eventName} has ended in a draw.</p>
          <p>The bet amount of ${betAmount} has been returned to your account.</p>
          <p>View the details: <a href="${challengeLink}">${challengeLink}</a></p>
          <p>Thanks for using WeParlay!</p>
        `;
      } else if (winnerId) {
        // Someone won
        const isWinner = (userId: string) => userId === winnerId;
        const winner = isWinner(challenger.id) ? challenger : accepter;
        const loser = isWinner(challenger.id) ? accepter : challenger;
        
        winnerName = winner.username || winner.email || 'Your opponent';
        
        // Notify winner
        await this.sendInAppNotification(
          winner.id,
          'result',
          `You won your bet on ${eventName}! ${betAmount} has been added to your account.`,
          `/challenges/${challengeId}`
        );
        
        await this.sendPushNotification(
          winner.id,
          'You Won!',
          `Congratulations! You won your bet on ${eventName}! ${betAmount} has been added to your account.`,
          { 
            challengeId, 
            type: 'bet_won',
            link: `/challenges/${challengeId}`
          }
        );
        
        if (winner.email) {
          await this.sendEmail(
            winner.email,
            `You won your bet on ${eventName}!`,
            `
              <h2>Congratulations! You Won!</h2>
              <p>You've won your bet on ${eventName}!</p>
              <p>Your winnings of ${betAmount} have been added to your account.</p>
              <p>View the details: <a href="${challengeLink}">${challengeLink}</a></p>
              <p>Thanks for using WeParlay!</p>
            `
          );
        }
        
        // Notify loser
        await this.sendInAppNotification(
          loser.id,
          'result',
          `You lost your bet on ${eventName} to ${winnerName}.`,
          `/challenges/${challengeId}`
        );
        
        await this.sendPushNotification(
          loser.id,
          'Bet Result',
          `Unfortunately, you lost your bet on ${eventName} to ${winnerName}.`,
          { 
            challengeId, 
            type: 'bet_lost',
            link: `/challenges/${challengeId}`
          }
        );
        
        if (loser.email) {
          await this.sendEmail(
            loser.email,
            `Result of your bet on ${eventName}`,
            `
              <h2>Bet Result</h2>
              <p>Unfortunately, you lost your bet on ${eventName} to ${winnerName}.</p>
              <p>Better luck next time!</p>
              <p>View the details: <a href="${challengeLink}">${challengeLink}</a></p>
              <p>Thanks for using WeParlay!</p>
            `
          );
        }
      }
      
      // Update challenge status
      await db.update('betting_challenges')
        .set({ 
          status: 'settled',
          settledAt: new Date(),
          updatedAt: new Date(),
          winnerId: winnerId || null,
          isDraw: isDraw
        })
        .where({ id: challengeId });
      
      return true;
    } catch (error) {
      console.error('Error sending bet result notification:', error);
      return false;
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();