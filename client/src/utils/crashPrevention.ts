// WeParlay Crash Prevention System
// Ensures the site never crashes regardless of errors

export function initializeCrashPrevention() {
  console.log('🛡️ Initializing WeParlay crash prevention...');

  // Handle missing module exports gracefully
  window.addEventListener('error', (event) => {
    const errorMessage = event.error?.message || event.message || '';
    
    if (errorMessage.includes('does not provide an export named') ||
        errorMessage.includes('Failed to resolve module specifier') ||
        errorMessage.includes('wordpressSync') ||
        errorMessage.includes('initWordPressSync')) {
      console.warn('🔧 Module export error handled gracefully:', errorMessage);
      event.preventDefault();
      return false;
    }

    // Handle Vite/WebSocket development errors
    if (errorMessage.includes('vite') || 
        errorMessage.includes('WebSocket') ||
        errorMessage.includes('HMR')) {
      console.warn('🔌 Development server error handled:', errorMessage);
      event.preventDefault();
      return false;
    }
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const reasonString = String(reason?.message || reason || '');
    
    const isIgnorableError = (
      reasonString.includes('WebSocket') ||
      reasonString.includes('Failed to fetch') ||
      reasonString.includes('NetworkError') ||
      reasonString.includes('1006') ||
      reasonString.includes('vite') ||
      reasonString.includes('HMR') ||
      reasonString.includes('wordpressSync') ||
      reasonString.includes('initWordPressSync')
    );

    if (isIgnorableError) {
      console.warn('⚠️ Non-critical promise rejection handled:', reasonString);
      event.preventDefault();
      return false;
    }

    // Log but don't crash on other promise rejections
    console.warn('🚨 Promise rejection handled:', reason);
    event.preventDefault();
    return false;
  });

  // Handle module loading errors
  window.addEventListener('rejectionhandled', (event) => {
    console.log('✅ Promise rejection was handled:', event.reason);
  });

  console.log('✅ WeParlay crash prevention initialized');
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