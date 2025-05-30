
export const isDevelopment = () => {
  return window.location.hostname === 'localhost' || 
         window.location.hostname.includes('replit.dev') ||
         import.meta.env.DEV;
};

export const isProduction = () => {
  return !isDevelopment();
};

export const shouldEnableWebSocket = () => {
  // Only enable WebSocket in production or when explicitly needed
  return isProduction() || localStorage.getItem('force-websocket') === 'true';
};

export const shouldReportErrors = () => {
  // Only report errors in production
  return isProduction();
};
