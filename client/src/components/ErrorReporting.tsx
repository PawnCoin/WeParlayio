import React, { useState, useEffect } from 'react';
import { AlertTriangle, Send, X, CheckCircle, Bug, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface ErrorReport {
  id: string;
  type: 'error' | 'feedback' | 'bug';
  message: string;
  details?: string;
  userAgent: string;
  url: string;
  timestamp: string;
  status: 'pending' | 'submitted' | 'resolved';
}

interface ErrorReportingProps {
  isOpen: boolean;
  onClose: () => void;
  initialError?: Error | null;
  reportType?: 'error' | 'feedback' | 'bug';
}

export default function ErrorReporting({ 
  isOpen, 
  onClose, 
  initialError, 
  reportType = 'feedback' 
}: ErrorReportingProps) {
  const [report, setReport] = useState<Partial<ErrorReport>>({
    type: reportType,
    message: '',
    details: initialError?.message || '',
    userAgent: navigator.userAgent,
    url: window.location.href,
    timestamp: new Date().toISOString(),
    status: 'pending'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (initialError) {
      setReport(prev => ({
        ...prev,
        type: 'error',
        details: `${initialError.message}\n\nStack trace:\n${initialError.stack}`
      }));
    }
  }, [initialError]);

  const handleSubmit = async () => {
    if (!report.message?.trim()) {
      toast({
        title: "Message Required",
        description: "Please describe the issue or provide feedback.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const reportData = {
        ...report,
        id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'submitted'
      };

      const response = await fetch('/api/error-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      });
      
      if (!response.ok) throw new Error('Failed to submit report');

      setIsSubmitted(true);
      toast({
        title: "Report Submitted",
        description: "Thank you for your feedback! We'll review it shortly.",
      });

      // Auto-close after 2 seconds
      setTimeout(() => {
        onClose();
        setIsSubmitted(false);
      }, 2000);

    } catch (error) {
      console.error('Failed to submit report:', error);
      toast({
        title: "Submission Failed",
        description: "Unable to submit report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getReportIcon = () => {
    switch (report.type) {
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'bug':
        return <Bug className="h-5 w-5 text-orange-500" />;
      default:
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
    }
  };

  const getReportTitle = () => {
    switch (report.type) {
      case 'error':
        return 'Report Error';
      case 'bug':
        return 'Report Bug';
      default:
        return 'Send Feedback';
    }
  };

  if (!isOpen) return null;

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Report Submitted</h3>
            <p className="text-muted-foreground">
              Thank you for helping us improve WeParlay!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            {getReportIcon()}
            {getReportTitle()}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Report Type Selection */}
          <div className="flex gap-2">
            {(['feedback', 'bug', 'error'] as const).map((type) => (
              <Badge
                key={type}
                variant={report.type === type ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setReport(prev => ({ ...prev, type }))}
              >
                {type === 'feedback' && <MessageSquare className="h-3 w-3 mr-1" />}
                {type === 'bug' && <Bug className="h-3 w-3 mr-1" />}
                {type === 'error' && <AlertTriangle className="h-3 w-3 mr-1" />}
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Badge>
            ))}
          </div>

          {/* Main Message */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              {report.type === 'feedback' ? 'Your Feedback' : 'Describe the Issue'}
            </label>
            <Textarea
              value={report.message}
              onChange={(e) => setReport(prev => ({ ...prev, message: e.target.value }))}
              placeholder={
                report.type === 'feedback' 
                  ? "Tell us what you think about WeParlay..."
                  : "What happened? Please describe the issue..."
              }
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Technical Details (for errors/bugs) */}
          {(report.type === 'error' || report.type === 'bug') && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                Technical Details (Optional)
              </label>
              <Textarea
                value={report.details}
                onChange={(e) => setReport(prev => ({ ...prev, details: e.target.value }))}
                placeholder="Additional technical information, steps to reproduce, etc."
                rows={2}
                className="resize-none text-xs font-mono"
              />
            </div>
          )}

          {/* System Info */}
          <div className="text-xs text-muted-foreground space-y-1">
            <div><strong>Page:</strong> {window.location.pathname}</div>
            <div><strong>Time:</strong> {new Date().toLocaleString()}</div>
            <div><strong>Browser:</strong> {navigator.userAgent.split(' ').slice(-2).join(' ')}</div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !report.message?.trim()}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Report
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Error Boundary Integration
export class ErrorReportingBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null; showReporting: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, showReporting: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Auto-submit critical errors
    this.submitCriticalError(error, errorInfo);
  }

  submitCriticalError = async (error: Error, errorInfo: React.ErrorInfo) => {
    try {
      await fetch('/api/error-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `critical_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'error',
          message: 'Critical application error occurred',
          details: `${error.message}\n\nStack: ${error.stack}\n\nComponent Stack: ${errorInfo.componentStack}`,
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: new Date().toISOString(),
          status: 'submitted',
          critical: true
        })
      });
    } catch (submitError) {
      console.error('Failed to submit critical error:', submitError);
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We've encountered an unexpected error. Our team has been notified automatically.
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                  className="flex-1"
                >
                  Reload Page
                </Button>
                <Button 
                  onClick={() => this.setState({ showReporting: true })}
                  className="flex-1"
                >
                  Report Issue
                </Button>
              </div>
              
              {this.state.showReporting && (
                <ErrorReporting
                  isOpen={true}
                  onClose={() => this.setState({ showReporting: false })}
                  initialError={this.state.error}
                  reportType="error"
                />
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}