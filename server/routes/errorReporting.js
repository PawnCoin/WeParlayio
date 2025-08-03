import express from 'express';

const router = express.Router();

// Simple error reporting endpoint
router.post('/api/error-reports', (req, res) => {
  try {
    const report = {
      id: req.body.id || `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: req.body.type || 'feedback',
      message: req.body.message || '',
      details: req.body.details || '',
      userAgent: req.body.userAgent || req.headers['user-agent'],
      url: req.body.url || req.headers.referer,
      timestamp: new Date().toISOString(),
      status: 'submitted'
    };
    
    console.log(`📧 Error Report Received:
Type: ${report.type}
Message: ${report.message}
URL: ${report.url}
Time: ${report.timestamp}
---`);

    res.json({
      success: true,
      message: 'Report submitted successfully',
      reportId: report.id
    });
  } catch (error) {
    console.error('Error processing report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit report'
    });
  }
});

router.get('/api/error-reports', (req, res) => {
  res.json({
    success: true,
    reports: [],
    count: 0,
    message: 'Error reports endpoint ready'
  });
});

export default router;