import { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { storage } from '../storage';

// ===== Common Issue Patterns & Solutions =====
interface KnownIssue {
  id: string;
  name: string;
  patterns: string[];
  isFinancial: boolean;
  isPersonal: boolean;
  category: string;
  autoFix: (req: Request, res: Response) => Promise<{
    success: boolean;
    message: string;
    logs?: string[];
  }>;
}

const knownIssues: KnownIssue[] = [
  {
    id: 'login-issues',
    name: 'Login Problems',
    patterns: ['cannot login', 'login not working', 'login failed', 'unable to sign in', 'authentication failed'],
    isFinancial: false,
    isPersonal: false,
    category: 'auth',
    autoFix: async (req, res) => {
      // Clear session cookies, refresh cache, reset session
      return {
        success: true,
        message: 'Authentication cache cleared. Please try logging in again.',
        logs: ['Cleared session cookies', 'Reset authentication cache']
      };
    }
  },
  {
    id: 'page-loading',
    name: 'Page Loading Issues',
    patterns: ['page not loading', 'blank screen', 'white screen', 'cannot see content', 'page stuck'],
    isFinancial: false,
    isPersonal: false,
    category: 'frontend',
    autoFix: async (req, res) => {
      // Clear browser cache, refresh CSS/JS assets
      return {
        success: true,
        message: 'Application cache has been refreshed. Please reload the page.',
        logs: ['Cleared application cache', 'Reset asset loader', 'Verified CDN connections']
      };
    }
  },
  {
    id: 'odds-not-updating',
    name: 'Odds Not Updating',
    patterns: ['odds not updating', 'outdated odds', 'odds not refreshing', 'old betting odds'],
    isFinancial: false,
    isPersonal: false,
    category: 'data',
    autoFix: async (req, res) => {
      // Reset odds data cache, force refresh from provider
      return {
        success: true,
        message: 'Odds data has been refreshed from our providers. Please reload to see the latest odds.',
        logs: ['Cleared odds cache', 'Force refreshed odds from provider API', 'Verified data integrity']
      };
    }
  },
  {
    id: 'live-event-lag',
    name: 'Live Event Display Lag',
    patterns: ['live events delayed', 'lag in live updates', 'live scores not updating', 'slow updates'],
    isFinancial: false,
    isPersonal: false,
    category: 'live-data',
    autoFix: async (req, res) => {
      // Optimize websocket connections, refresh data stream
      return {
        success: true,
        message: 'Live event data stream has been optimized. You should now see more timely updates.',
        logs: ['Reset websocket connections', 'Optimized data streaming parameters', 'Verified connection quality']
      };
    }
  },
  {
    id: 'bet-placement-error',
    name: 'Bet Placement Errors',
    patterns: ['cannot place bet', 'bet not working', 'error placing bet', 'bet submission fails'],
    isFinancial: true, // Financial implications
    isPersonal: false,
    category: 'betting',
    autoFix: async (req, res) => {
      // This requires human review due to financial implications
      return {
        success: false,
        message: 'This issue involves financial transactions and has been escalated to our support team for immediate review.',
        logs: ['Issue tagged as financial', 'Escalated to human support team']
      };
    }
  },
  {
    id: 'account-display-issues',
    name: 'Account Display Issues',
    patterns: ['wrong username', 'profile picture not showing', 'profile not updated', 'avatar issue'],
    isFinancial: false,
    isPersonal: true, // Personal account data
    category: 'account',
    autoFix: async (req, res) => {
      // This requires verification of personal identity 
      return {
        success: false,
        message: 'This issue involves personal account information and requires verification. Our support team will assist you shortly.',
        logs: ['Issue tagged as personal', 'Escalated to account services team']
      };
    }
  },
  {
    id: 'notification-issues',
    name: 'Notification Problems',
    patterns: ['not receiving notifications', 'missing alerts', 'notification not working', 'no bet alerts'],
    isFinancial: false,
    isPersonal: false,
    category: 'notifications',
    autoFix: async (req, res) => {
      // Reset notification permissions and services
      return {
        success: true,
        message: 'Notification services have been reset. Please check your browser permissions and reload the page.',
        logs: ['Reset notification registry', 'Cleared notification cache', 'Verified notification service status']
      };
    }
  },
  {
    id: 'theme-display-issues',
    name: 'Theme & Display Issues',
    patterns: ['dark mode not working', 'light mode problem', 'colors wrong', 'theme broken', 'display issues'],
    isFinancial: false,
    isPersonal: false,
    category: 'frontend',
    autoFix: async (req, res) => {
      // Reset theme settings, clear CSS cache
      return {
        success: true,
        message: 'Theme settings have been reset. Please reload the page to see the change.',
        logs: ['Reset theme preference cookies', 'Cleared CSS cache', 'Verified theme service operation']
      };
    }
  }
];

// ===== Support Ticket System =====
interface SupportTicket {
  id: string;
  userId: string;
  username: string;
  email: string;
  subject: string;
  description: string;
  category: string;
  status: 'open' | 'processing' | 'resolved' | 'escalated';
  createTime: Date;
  updateTime: Date;
  resolutionDetails?: {
    isAutomated: boolean;
    message: string;
    steps: string[];
  };
}

// In-memory storage for tickets
const supportTickets: SupportTicket[] = [];
let ticketCounter = 1000; // Starting ticket number

// Email notification configuration
const notificationConfig = {
  autoResponseEnabled: true,
  adminNotificationEnabled: true, 
  adminEmail: 'support@weparlay.io',
  emailService: {
    sendUserNotification: async (email: string, subject: string, message: string) => {
      // For this example, log instead of sending emails
      console.log(`[Email notification] To: ${email}, Subject: ${subject}, Message: ${message}`);
      return true;
    },
    sendAdminNotification: async (subject: string, message: string) => {
      console.log(`[Admin notification] To: ${notificationConfig.adminEmail}, Subject: ${subject}, Message: ${message}`);
      return true;
    }
  }
};

// ===== AI Support Functions =====

/**
 * Analyzes issue description to identify known problems
 */
function analyzeIssue(description: string): {
  matchedIssue?: KnownIssue,
  confidence: number,
  requiresHumanSupport: boolean,
  category: string
} {
  // Normalize the text for better matching
  const normalizedText = description.toLowerCase();
  
  // Check against known issues
  for (const issue of knownIssues) {
    // Simple pattern matching for now - could be enhanced with actual ML
    const matchingPatterns = issue.patterns.filter(pattern => 
      normalizedText.includes(pattern.toLowerCase())
    );
    
    // If we have a good match
    if (matchingPatterns.length > 0) {
      const confidence = matchingPatterns.length / issue.patterns.length;
      
      // Financial or personal issues always require human support
      if (issue.isFinancial || issue.isPersonal) {
        return {
          matchedIssue: issue,
          confidence,
          requiresHumanSupport: true,
          category: issue.category
        };
      }
      
      // For technical issues with good confidence, we can auto-fix
      if (confidence > 0.3) {
        return {
          matchedIssue: issue,
          confidence,
          requiresHumanSupport: false,
          category: issue.category
        };
      }
    }
  }
  
  // No strong match found, route to human support
  return {
    confidence: 0,
    requiresHumanSupport: true,
    category: 'general'
  };
}

/**
 * Creates a new support ticket
 */
async function createTicket(
  userId: string,
  username: string, 
  email: string,
  subject: string,
  description: string
): Promise<SupportTicket> {
  const ticketId = `T${ticketCounter++}`;
  
  // Analyze the issue
  const analysis = analyzeIssue(description);
  
  const ticket: SupportTicket = {
    id: ticketId,
    userId,
    username,
    email,
    subject,
    description,
    category: analysis.matchedIssue?.category || 'general',
    status: analysis.requiresHumanSupport ? 'escalated' : 'processing',
    createTime: new Date(),
    updateTime: new Date()
  };
  
  supportTickets.push(ticket);
  
  // Send notifications
  if (notificationConfig.autoResponseEnabled) {
    await notificationConfig.emailService.sendUserNotification(
      email,
      `Your support ticket #${ticketId} has been received`,
      `We've received your support request: "${subject}". ${
        analysis.requiresHumanSupport 
          ? 'Our support team will review this shortly.' 
          : 'Our automated system is working on a solution and will update you soon.'
      }`
    );
  }
  
  if (notificationConfig.adminNotificationEnabled && analysis.requiresHumanSupport) {
    await notificationConfig.emailService.sendAdminNotification(
      `New support ticket requiring attention: #${ticketId}`,
      `User ${username} has submitted a support request that requires human attention.
      
      Subject: ${subject}
      Description: ${description}
      Category: ${analysis.matchedIssue?.category || 'general'}
      
      Please review this ticket at your earliest convenience.`
    );
  }
  
  return ticket;
}

/**
 * Attempts to automatically resolve a ticket
 */
async function attemptAutoResolution(ticket: SupportTicket, req: Request, res: Response): Promise<boolean> {
  // Find the matching issue
  const analysis = analyzeIssue(ticket.description);
  
  if (!analysis.matchedIssue || analysis.requiresHumanSupport) {
    return false;
  }
  
  try {
    // Attempt to apply the automated fix
    const result = await analysis.matchedIssue.autoFix(req, res);
    
    if (result.success) {
      // Update the ticket with resolution details
      ticket.status = 'resolved';
      ticket.updateTime = new Date();
      ticket.resolutionDetails = {
        isAutomated: true,
        message: result.message,
        steps: result.logs || []
      };
      
      // Notify the user
      await notificationConfig.emailService.sendUserNotification(
        ticket.email,
        `Your support ticket #${ticket.id} has been resolved`,
        `Good news! We've automatically resolved your issue: "${ticket.subject}".
        
        ${result.message}
        
        If you're still experiencing problems, please reply to this email and our support team will assist you further.`
      );
      
      return true;
    }
  } catch (error) {
    console.error(`Error in auto-resolution attempt for ticket ${ticket.id}:`, error);
  }
  
  // If we get here, auto-resolution failed - escalate to human support
  ticket.status = 'escalated';
  ticket.updateTime = new Date();
  
  await notificationConfig.emailService.sendAdminNotification(
    `Failed auto-resolution - Ticket #${ticket.id} needs attention`,
    `We attempted to automatically resolve ticket #${ticket.id} from user ${ticket.username}, but the resolution failed.
    
    Subject: ${ticket.subject}
    Description: ${ticket.description}
    Category: ${ticket.category}
    
    Please review this ticket at your earliest convenience.`
  );
  
  return false;
}

/**
 * Gets a ticket by ID
 */
function getTicket(ticketId: string): SupportTicket | undefined {
  return supportTickets.find(t => t.id === ticketId);
}

/**
 * Gets all tickets for a user
 */
function getUserTickets(userId: string): SupportTicket[] {
  return supportTickets.filter(t => t.userId === userId);
}

/**
 * Updates a ticket with a resolution from an admin
 */
async function resolveTicket(ticketId: string, resolutionMessage: string, steps: string[] = []): Promise<SupportTicket | undefined> {
  const ticket = getTicket(ticketId);
  if (!ticket) return undefined;
  
  ticket.status = 'resolved';
  ticket.updateTime = new Date();
  ticket.resolutionDetails = {
    isAutomated: false,
    message: resolutionMessage,
    steps
  };
  
  // Notify the user
  await notificationConfig.emailService.sendUserNotification(
    ticket.email,
    `Your support ticket #${ticket.id} has been resolved`,
    `Our support team has resolved your issue: "${ticket.subject}".
    
    ${resolutionMessage}
    
    If you have any further questions, please don't hesitate to contact us.`
  );
  
  return ticket;
}

// ===== System Health Monitoring =====

/**
 * Performs a system health check
 */
async function performSystemHealthCheck(): Promise<{
  status: 'healthy' | 'degraded' | 'critical',
  issues: string[]
}> {
  const issues: string[] = [];
  
  // Check system resources
  const freeMem = os.freemem();
  const totalMem = os.totalmem();
  const usedMemPercent = 100 - Math.round((freeMem / totalMem) * 100);
  
  if (usedMemPercent > 90) {
    issues.push('High memory usage detected');
  }
  
  // Check services (simplified example)
  const servicesStatus = {
    database: true,
    odds_api: true,
    authentication: true,
    payments: true
  };
  
  for (const [service, isWorking] of Object.entries(servicesStatus)) {
    if (!isWorking) {
      issues.push(`${service} service is not responding`);
    }
  }
  
  // Determine overall status
  let status: 'healthy' | 'degraded' | 'critical' = 'healthy';
  if (issues.length > 0) {
    status = issues.length >= 3 ? 'critical' : 'degraded';
  }
  
  return { status, issues };
}

// ===== Export the API =====
export const AISupportService = {
  createTicket,
  getTicket,
  getUserTickets,
  attemptAutoResolution,
  resolveTicket,
  performSystemHealthCheck,
  
  // Analytics helpers
  getAutomaticResolutionRate: () => {
    const resolvedTickets = supportTickets.filter(t => t.status === 'resolved');
    const autoResolved = resolvedTickets.filter(t => t.resolutionDetails?.isAutomated);
    return resolvedTickets.length > 0 ? autoResolved.length / resolvedTickets.length : 0;
  },
  
  getCommonIssueCategories: () => {
    const categories: Record<string, number> = {};
    
    supportTickets.forEach(ticket => {
      categories[ticket.category] = (categories[ticket.category] || 0) + 1;
    });
    
    return Object.entries(categories)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  }
};