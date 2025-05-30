
interface ErrorReport {
  message: string;
  timestamp: string;
  url: string;
  userAgent: string;
  sessionId: string;
  errorType: string;
  severity: string;
  stack?: string;
  componentStack?: string;
  userId?: string;
  context?: any;
}

class ErrorReportingService {
  private sessionId: string;
  private errorQueue: ErrorReport[] = [];
  private isReporting: boolean = false;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupGlobalErrorHandlers();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupGlobalErrorHandlers() {
    // Handle unhandled JavaScript errors
    window.addEventListener('error', (event) => {
      this.reportError({
        message: event.error?.message || event.message,
        stack: event.error?.stack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        sessionId: this.sessionId,
        errorType: 'javascript',
        severity: 'high',
        context: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      // Filter out known benign errors
      const reason = event.reason;
      const isNetworkError = reason && (
        typeof reason === 'string' && (
          reason.includes('WebSocket') ||
          reason.includes('Failed to fetch') ||
          reason.includes('NetworkError') ||
          reason.includes('1006') ||
          reason.includes('WebSocket closed without opened')
        ) ||
        (reason && reason.message && typeof reason.message === 'string' && (
          reason.message.includes('WebSocket') ||
          reason.message.includes('Failed to fetch') ||
          reason.message.includes('NetworkError') ||
          reason.message.includes('1006') ||
          reason.message.includes('WebSocket closed without opened')
        ))
      );

      if (isNetworkError) {
        console.log('Non-critical promise rejection handled:', reason);
        event.preventDefault();
        return;
      }

      this.reportError({
        message: event.reason?.message || 'Unhandled Promise Rejection',
        stack: event.reason?.stack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        sessionId: this.sessionId,
        errorType: 'promise',
        severity: 'medium',
        context: {
          reason: event.reason
        }
      });
    });

    // Handle network errors
    window.addEventListener('offline', () => {
      this.reportError({
        message: 'Network connection lost',
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        sessionId: this.sessionId,
        errorType: 'network',
        severity: 'medium'
      });
    });
  }

  public reportError(error: Partial<ErrorReport>) {
    const completeError: ErrorReport = {
      message: error.message || 'Unknown error',
      timestamp: error.timestamp || new Date().toISOString(),
      url: error.url || window.location.href,
      userAgent: error.userAgent || navigator.userAgent,
      sessionId: this.sessionId,
      errorType: error.errorType || 'javascript',
      severity: error.severity || 'medium',
      ...error
    };

    this.errorQueue.push(completeError);

    // Debounce error reporting
    if (!this.isReporting) {
      this.isReporting = true;
      setTimeout(() => {
        this.flushErrors();
        this.isReporting = false;
      }, 1000);
    }
  }

  private async flushErrors() {
    if (this.errorQueue.length === 0) return;

    // Filter out known benign errors
    const filteredErrors = this.errorQueue.filter(errorItem => {
      const message = (errorItem.message || '').toLowerCase();
      return !message.includes('websocket') && 
             !message.includes('cors') && 
             !message.includes('metamask') &&
             !message.includes('unrecognized feature') &&
             !message.includes('invalid sandbox flag') &&
             !message.includes('websocket closed without opened') &&
             !message.includes('failed to connect to websocket') &&
             !message.includes('vite') &&
             !message.includes('1006');
    });

    if (filteredErrors.length === 0) {
      this.errorQueue = [];
      return;
    }

    const errors = [...filteredErrors];
    this.errorQueue = [];

    try {
      await fetch('/api/errors/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ errors })
      });

      console.log(`📊 Reported ${errors.length} errors to monitoring service`);
    } catch (reportingError) {
      console.error('Failed to report errors:', reportingError);
      // Put errors back in queue for retry
      this.errorQueue.unshift(...errors);
    }
  }

  public setUserId(userId: string) {
    this.errorQueue.forEach(error => {
      error.userId = userId;
    });
  }
}

export const errorReporting = new ErrorReportingService();

// Export a safe error reporter that won't throw
export const safeErrorReporting = {
  reportError: (error: Error | string, context?: string) => {
    try {
      const errorData = {
        message: typeof error === 'string' ? error : error.message,
        stack: typeof error === 'object' ? error.stack : undefined,
        context,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      };

      console.error('📊 Reported error to monitoring service:', errorData);

      // In production, send to your error tracking service
      if (import.meta.env.PROD) {
        errorReporting.reportError(errorData);
      }
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  }
};
