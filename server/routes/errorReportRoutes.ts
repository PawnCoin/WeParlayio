import express from 'express';
import { z } from 'zod';
import { storage } from '../storage.js';
import { errorReports } from '../../shared/schema.js';
import { eq, desc } from 'drizzle-orm';
import nodemailer from 'nodemailer';

const router = express.Router();

// Schema for error report validation
const errorReportSchema = z.object({
  id: z.string(),
  type: z.enum(['error', 'feedback', 'bug']),
  message: z.string().min(1, 'Message is required'),
  details: z.string().optional(),
  userAgent: z.string(),
  url: z.string(),
  timestamp: z.string(),
  status: z.enum(['pending', 'submitted', 'resolved']),
  critical: z.boolean().optional(),
  userId: z.string().optional(),
  email: z.string().email().optional()
});

type ErrorReport = z.infer<typeof errorReportSchema>;

// Submit error report
router.post('/', async (req, res) => {
  try {
    const reportData = errorReportSchema.parse(req.body);
    
    // Save to database
    const report = await storage.createErrorReport({
      id: reportData.id,
      type: reportData.type,
      message: reportData.message,
      details: reportData.details || '',
      userAgent: reportData.userAgent,
      url: reportData.url,
      timestamp: new Date(reportData.timestamp),
      status: reportData.status,
      critical: reportData.critical || false,
      userId: reportData.userId,
      userEmail: reportData.email
    });

    // Send email notification for critical errors or bugs
    if (reportData.critical || reportData.type === 'error') {
      await sendErrorNotification(reportData);
    }

    // Send confirmation email to user if email provided
    if (reportData.email) {
      await sendUserConfirmation(reportData);
    }

    res.json({
      success: true,
      message: 'Report submitted successfully',
      reportId: report.id
    });

  } catch (error) {
    console.error('Error submitting report:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report data',
        errors: error.errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to submit report'
    });
  }
});

// Get error reports (admin only)
router.get('/', async (req, res) => {
  try {
    // Check if user is admin (you can implement proper auth check)
    const isAdmin = req.headers.authorization?.includes('admin'); // Simplified check
    
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { status, type, limit = 50 } = req.query;
    
    const reports = await storage.getErrorReports({ 
      status: status as string,
      limit: Number(limit) 
    });
    
    res.json({
      success: true,
      reports,
      count: reports.length
    });

  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports'
    });
  }
});

// Update report status (admin only)
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['pending', 'submitted', 'resolved'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    await storage.updateErrorReportStatus(id, status);

    res.json({
      success: true,
      message: 'Report status updated'
    });

  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update report'
    });
  }
});

// Send error notification to development team
async function sendErrorNotification(report: ErrorReport) {
  try {
    // Create transporter (use your existing email config)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const subject = report.critical 
      ? `🚨 CRITICAL ERROR - WeParlay Platform` 
      : `${report.type.toUpperCase()} Report - WeParlay`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: ${report.critical ? '#dc2626' : '#f97316'}; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">WeParlay ${report.type.toUpperCase()} Report</h2>
          ${report.critical ? '<p style="margin: 5px 0 0 0; font-weight: bold;">⚠️ CRITICAL ISSUE</p>' : ''}
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px;">
          <h3>Report Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; font-weight: bold;">Type:</td><td style="padding: 8px;">${report.type}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Time:</td><td style="padding: 8px;">${new Date(report.timestamp).toLocaleString()}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">URL:</td><td style="padding: 8px;">${report.url}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">User Agent:</td><td style="padding: 8px; font-size: 12px;">${report.userAgent}</td></tr>
          </table>
          
          <h3>Message</h3>
          <div style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #3498db;">
            ${report.message}
          </div>
          
          ${report.details ? `
            <h3>Technical Details</h3>
            <div style="background: #1f2937; color: #e5e7eb; padding: 15px; border-radius: 4px; font-family: monospace; font-size: 12px; overflow-x: auto;">
              <pre style="margin: 0; white-space: pre-wrap;">${report.details}</pre>
            </div>
          ` : ''}
          
          <div style="margin-top: 20px; padding: 15px; background: #dbeafe; border-radius: 4px;">
            <p style="margin: 0;"><strong>Report ID:</strong> ${report.id}</p>
            <p style="margin: 5px 0 0 0;"><strong>Status:</strong> ${report.status}</p>
          </div>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: '"WeParlay Error Reporter" <noreply@weparlay.io>',
      to: 'support@weparlay.io, dev@weparlay.io',
      subject,
      html: htmlContent
    });

    console.log('Error notification sent successfully');
    
  } catch (error) {
    console.error('Failed to send error notification:', error);
  }
}

// Send confirmation email to user
async function sendUserConfirmation(report: ErrorReport) {
  try {
    if (!report.email) return;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #3498db; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">Thank you for your ${report.type}!</h2>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px;">
          <p>Hi there,</p>
          
          <p>We've received your ${report.type} report and wanted to let you know that we take all feedback seriously. Here's what happens next:</p>
          
          <ul style="line-height: 1.6;">
            <li><strong>Review:</strong> Our team will review your report within 24 hours</li>
            <li><strong>Investigation:</strong> If it's a bug or error, we'll investigate and work on a fix</li>
            <li><strong>Updates:</strong> We'll keep you informed of any progress</li>
            <li><strong>Resolution:</strong> You'll be notified when the issue is resolved</li>
          </ul>
          
          <div style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #3498db; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0;">Your Report Summary</h4>
            <p style="margin: 0;"><strong>Report ID:</strong> ${report.id}</p>
            <p style="margin: 5px 0 0 0;"><strong>Type:</strong> ${report.type}</p>
            <p style="margin: 5px 0 0 0;"><strong>Submitted:</strong> ${new Date(report.timestamp).toLocaleString()}</p>
          </div>
          
          <p>Thank you for helping us improve WeParlay!</p>
          
          <p style="margin-top: 30px;">
            Best regards,<br>
            <strong>The WeParlay Team</strong>
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
            <p>WeParlay - Premier Sports Betting Platform</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: '"WeParlay Support" <support@weparlay.io>',
      to: report.email,
      subject: `WeParlay - ${report.type} Report Received`,
      html: htmlContent
    });

    console.log('User confirmation sent successfully');
    
  } catch (error) {
    console.error('Failed to send user confirmation:', error);
  }
}

export default router;