import React from 'react';
import { ErrorReportingBoundary } from './ErrorReporting';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export default function ErrorBoundary({ children }: ErrorBoundaryProps) {
  return (
    <ErrorReportingBoundary>
      {children}
    </ErrorReportingBoundary>
  );
}