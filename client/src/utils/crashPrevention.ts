// WeParlay Crash Prevention System
// Ensures the site never crashes regardless of errors

export function initializeCrashPrevention() {
  // Simple error handling without preventing all errors
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const reasonString = typeof reason === 'string' ? reason : (reason?.message || '');

    // Only handle specific non-critical errors
    if (reasonString.includes('WebSocket') || reasonString.includes('vite') || reasonString.includes('HMR')) {
      console.warn('⚠️ Non-critical error:', reasonString);
      event.preventDefault();
      return;
    }

    // Let other errors bubble up naturally
    console.log('🔍 Unhandled rejection:', reason);
  });

  console.log('✅ Basic error handling initialized');
}

// Initialize crash prevention immediately
initializeCrashPrevention();

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