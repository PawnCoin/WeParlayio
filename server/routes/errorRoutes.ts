
import { Router } from 'express';
import { z } from 'zod';

const router = Router();

const ErrorReportSchema = z.object({
  message: z.string(),
  stack: z.string().optional(),
  componentStack: z.string().optional(),
  timestamp: z.string(),
  url: z.string(),
  userAgent: z.string(),
  userId: z.string().optional(),
  sessionId: z.string(),
  errorType: z.enum(['javascript', 'promise', 'component', 'network', 'security']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  context: z.record(z.any()).optional()
});

const ErrorBatchSchema = z.object({
  errors: z.array(ErrorReportSchema)
});

// Report errors endpoint
router.post('/report', async (req, res) => {
  try {
    const { errors } = ErrorBatchSchema.parse(req.body);
    
    console.log(`🚨 Received ${errors.length} error reports:`);
    
    errors.forEach((error, index) => {
      console.error(`Error ${index + 1}:`, {
        message: error.message,
        type: error.errorType,
        severity: error.severity,
        url: error.url,
        timestamp: error.timestamp,
        userId: error.userId || 'anonymous',
        sessionId: error.sessionId
      });
      
      // Log stack trace for high/critical errors
      if (error.severity === 'high' || error.severity === 'critical') {
        if (error.stack) {
          console.error('Stack trace:', error.stack);
        }
        if (error.componentStack) {
          console.error('Component stack:', error.componentStack);
        }
      }
    });

    // Filter critical errors for immediate admin notification
    const criticalErrors = errors.filter(e => e.severity === 'critical');
    if (criticalErrors.length > 0) {
      // Send immediate admin notification
      try {
        const { sendEmail } = await import('../services/emailService');
        await sendEmail('admin@weparlay.io', 'critical_system_error', {
          errorCount: criticalErrors.length,
          errors: criticalErrors.map(e => ({
            message: e.message,
            url: e.url,
            timestamp: e.timestamp,
            userId: e.userId
          }))
        });
      } catch (emailError) {
        console.error('Failed to send critical error notification:', emailError);
      }
    }

    res.json({ 
      success: true, 
      received: errors.length,
      critical: criticalErrors.length 
    });

  } catch (error) {
    console.error('Error processing error reports:', error);
    res.status(400).json({ 
      success: false, 
      message: 'Invalid error report format' 
    });
  }
});

// Get error statistics (admin only)
router.get('/stats', async (req, res) => {
  // TODO: Implement error statistics from database
  res.json({
    message: 'Error statistics endpoint - TODO: implement with database'
  });
});

export default router;
