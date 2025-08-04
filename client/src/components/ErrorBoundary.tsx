import React from 'react';
import SimpleErrorBoundary from './SimpleErrorBoundary';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export default function ErrorBoundary({ children }: ErrorBoundaryProps) {
  return (
    <SimpleErrorBoundary>
      {children}
    </SimpleErrorBoundary>
  );
}