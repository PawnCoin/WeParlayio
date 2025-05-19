import { Router, Request, Response } from 'express';
import { AISupportService } from '../services/aiSupportService';
import { isAuthenticated } from '../replitAuth';
import { z } from 'zod';

const router = Router();

// Validation schema for support ticket creation
const createTicketSchema = z.object({
  subject: z.string().min(5).max(100),
  description: z.string().min(10).max(2000),
  priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
});

/**
 * Create a new support ticket
 * POST /api/support/tickets
 */
router.post('/tickets', isAuthenticated, async (req: any, res: Response) => {
  try {
    const validation = createTicketSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        message: 'Invalid request data', 
        errors: validation.error.format() 
      });
    }
    
    const { subject, description, priority } = validation.data;
    const userId = req.user?.claims?.sub || 'anonymous';
    const username = req.user?.claims?.first_name || 'Guest User';
    const email = req.user?.claims?.email || 'support@weparlay.io';
    
    const ticket = await AISupportService.createTicket(
      userId,
      username,
      email,
      subject,
      description
    );
    
    // If the ticket doesn't require human support, attempt automatic resolution
    if (ticket.status === 'processing') {
      await AISupportService.attemptAutoResolution(ticket, req, res);
    }
    
    return res.status(201).json({
      ticketId: ticket.id,
      status: ticket.status,
      message: ticket.status === 'resolved' 
        ? ticket.resolutionDetails?.message 
        : 'Your ticket has been submitted and is being processed.'
    });
  } catch (error) {
    console.error('Error creating support ticket:', error);
    return res.status(500).json({ 
      message: 'An error occurred while creating your support ticket. Please try again later.' 
    });
  }
});

/**
 * Get user tickets
 * GET /api/support/tickets
 */
router.get('/tickets', isAuthenticated, async (req: any, res: Response) => {
  try {
    const userId = req.user?.claims?.sub || 'anonymous';
    const tickets = AISupportService.getUserTickets(userId);
    
    return res.status(200).json({ 
      tickets: tickets.map(ticket => ({
        id: ticket.id,
        subject: ticket.subject,
        category: ticket.category,
        status: ticket.status,
        createTime: ticket.createTime,
        updateTime: ticket.updateTime,
        isResolved: ticket.status === 'resolved',
        resolution: ticket.resolutionDetails?.message
      }))
    });
  } catch (error) {
    console.error('Error fetching user tickets:', error);
    return res.status(500).json({ 
      message: 'An error occurred while fetching your support tickets. Please try again later.' 
    });
  }
});

/**
 * Get a specific ticket
 * GET /api/support/tickets/:ticketId
 */
router.get('/tickets/:ticketId', isAuthenticated, async (req: any, res: Response) => {
  try {
    const userId = req.user?.claims?.sub || 'anonymous';
    const ticketId = req.params.ticketId;
    
    const ticket = AISupportService.getTicket(ticketId);
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    // Only allow access to the user's own tickets, or admin users
    if (ticket.userId !== userId && req.user?.claims?.role !== 'admin') {
      return res.status(403).json({ message: 'You do not have permission to view this ticket' });
    }
    
    return res.status(200).json({
      id: ticket.id,
      subject: ticket.subject,
      description: ticket.description,
      category: ticket.category,
      status: ticket.status,
      createTime: ticket.createTime,
      updateTime: ticket.updateTime,
      isResolved: ticket.status === 'resolved',
      resolution: ticket.resolutionDetails
    });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return res.status(500).json({ 
      message: 'An error occurred while fetching the support ticket. Please try again later.' 
    });
  }
});

/**
 * Perform a system health check - Admin only
 * GET /api/support/system-health
 */
router.get('/system-health', isAuthenticated, async (req: any, res: Response) => {
  try {
    // Check if user is admin
    if (req.user?.claims?.role !== 'admin') {
      return res.status(403).json({ message: 'You do not have permission to access system health data' });
    }
    
    const healthStatus = await AISupportService.performSystemHealthCheck();
    const resolutionRate = AISupportService.getAutomaticResolutionRate();
    const commonIssues = AISupportService.getCommonIssueCategories();
    
    return res.status(200).json({
      system: healthStatus,
      support: {
        automaticResolutionRate: resolutionRate,
        commonIssueCategories: commonIssues
      }
    });
  } catch (error) {
    console.error('Error checking system health:', error);
    return res.status(500).json({ 
      message: 'An error occurred while checking system health. Please try again later.' 
    });
  }
});

/**
 * Manually resolve a ticket - Admin only
 * POST /api/support/tickets/:ticketId/resolve
 */
router.post('/tickets/:ticketId/resolve', isAuthenticated, async (req: any, res: Response) => {
  try {
    // Check if user is admin
    if (req.user?.claims?.role !== 'admin') {
      return res.status(403).json({ message: 'You do not have permission to resolve tickets' });
    }
    
    const ticketId = req.params.ticketId;
    const { message, steps } = req.body;
    
    if (!message) {
      return res.status(400).json({ message: 'Resolution message is required' });
    }
    
    const ticket = await AISupportService.resolveTicket(ticketId, message, steps);
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    return res.status(200).json({
      id: ticket.id,
      status: ticket.status,
      resolution: ticket.resolutionDetails
    });
  } catch (error) {
    console.error('Error resolving ticket:', error);
    return res.status(500).json({ 
      message: 'An error occurred while resolving the ticket. Please try again later.' 
    });
  }
});

export default router;