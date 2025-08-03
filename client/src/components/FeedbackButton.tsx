import React, { useState } from 'react';
import { MessageCircle, Bug, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import ErrorReporting from './ErrorReporting';

interface FeedbackButtonProps {
  variant?: 'default' | 'floating' | 'compact';
  className?: string;
}

export default function FeedbackButton({ variant = 'default', className = '' }: FeedbackButtonProps) {
  const [isReportingOpen, setIsReportingOpen] = useState(false);
  const [reportType, setReportType] = useState<'error' | 'feedback' | 'bug'>('feedback');

  const openReporting = (type: 'error' | 'feedback' | 'bug') => {
    setReportType(type);
    setIsReportingOpen(true);
  };

  if (variant === 'floating') {
    return (
      <>
        <div className={`fixed bottom-6 right-6 z-40 ${className}`}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="lg"
                className="rounded-full shadow-lg hover:shadow-xl transition-shadow"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Feedback
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => openReporting('feedback')}>
                <MessageCircle className="h-4 w-4 mr-2" />
                Send Feedback
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openReporting('bug')}>
                <Bug className="h-4 w-4 mr-2" />
                Report Bug
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openReporting('error')}>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Report Error
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => window.open('https://discord.gg/weparlay', '_blank')}
              >
                Join Discord Community
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <ErrorReporting
          isOpen={isReportingOpen}
          onClose={() => setIsReportingOpen(false)}
          reportType={reportType}
        />
      </>
    );
  }

  if (variant === 'compact') {
    return (
      <>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => openReporting('feedback')}
          className={className}
        >
          <MessageCircle className="h-4 w-4 mr-1" />
          Feedback
        </Button>

        <ErrorReporting
          isOpen={isReportingOpen}
          onClose={() => setIsReportingOpen(false)}
          reportType={reportType}
        />
      </>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className={className}>
            <MessageCircle className="h-4 w-4 mr-2" />
            Help & Feedback
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => openReporting('feedback')}>
            <MessageCircle className="h-4 w-4 mr-2" />
            Send Feedback
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openReporting('bug')}>
            <Bug className="h-4 w-4 mr-2" />
            Report Bug
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openReporting('error')}>
            <AlertTriangle className="h-4 w-4 mr-2" />
            Report Error
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ErrorReporting
        isOpen={isReportingOpen}
        onClose={() => setIsReportingOpen(false)}
        reportType={reportType}
      />
    </>
  );
}

// Quick feedback hooks for different scenarios
export const useQuickFeedback = () => {
  const [isReportingOpen, setIsReportingOpen] = useState(false);
  const [reportType, setReportType] = useState<'error' | 'feedback' | 'bug'>('feedback');
  const [currentError, setCurrentError] = useState<Error | null>(null);

  const reportError = (error: Error) => {
    setCurrentError(error);
    setReportType('error');
    setIsReportingOpen(true);
  };

  const reportBug = () => {
    setReportType('bug');
    setIsReportingOpen(true);
  };

  const sendFeedback = () => {
    setReportType('feedback');
    setIsReportingOpen(true);
  };

  const FeedbackModal = () => (
    <ErrorReporting
      isOpen={isReportingOpen}
      onClose={() => {
        setIsReportingOpen(false);
        setCurrentError(null);
      }}
      reportType={reportType}
      initialError={currentError}
    />
  );

  return {
    reportError,
    reportBug,
    sendFeedback,
    FeedbackModal
  };
};