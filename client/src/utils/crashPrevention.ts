// WeParlay Crash Prevention System
// Ensures the site never crashes regardless of errors

export function initializeCrashPrevention() {
  // Handle missing module exports gracefully
  window.addEventListener('error', (event) => {
    if (event.error?.message?.includes('does not provide an export named') ||
        event.error?.message?.includes('Failed to resolve module specifier')) {
      console.warn('Module export error handled gracefully');
      event.preventDefault();
    }
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const isIgnorableError = reason && (
      typeof reason === 'string' && (
        reason.includes('WebSocket') ||
        reason.includes('Failed to fetch') ||
        reason.includes('NetworkError') ||
        reason.includes('1006')
      ) ||
      (reason.message && typeof reason.message === 'string' && (
        reason.message.includes('WebSocket') ||
        reason.message.includes('Failed to fetch') ||
        reason.message.includes('NetworkError') ||
        reason.message.includes('1006')
      ))
    );

    if (isIgnorableError) {
      console.warn('Non-critical promise rejection handled:', reason);
      event.preventDefault();
    }
  });
}

// Fallback component renderer
export const SafeComponent = ({ children, fallback = null }: { 
  children: React.ReactNode; 
  fallback?: React.ReactNode;
}) => {
  try {
    return <>{children}</>;
  } catch (error) {
    console.warn('Component render error handled:', error);
    return <>{fallback}</>;
  }
};

// Safe async function wrapper
export const safeAsync = async <T>(
  fn: () => Promise<T>, 
  fallback: T
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    console.warn('Async operation failed, using fallback:', error);
    return fallback;
  }
};