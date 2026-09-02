// Token cleanup utility to fix malformed JWT issues
export function clearInvalidTokens() {
  const tokenKeys = [
    'auth-token',
    'weparlay-admin-token', 
    'user',
    'weparlay-is-admin',
    'weparlay-logged-in',
    'weparlay-admin-role'
  ];

  // Check if tokens exist and clear invalid ones
  tokenKeys.forEach(key => {
    const token = localStorage.getItem(key);
    if (token && (
      token === 'site-owner-admin-token' || 
      token === 'null' || 
      token === 'undefined' ||
      (key === 'auth-token' && !token.includes('.')) // JWT should have dots
    )) {
      localStorage.removeItem(key);
    }
  });
}

// Initialize token cleanup on app load
export function initializeTokenCleanup() {
  // Clear invalid tokens on page load
  clearInvalidTokens();
  
  // Monitor for invalid token changes
  window.addEventListener('storage', (e) => {
    if (e.key && ['auth-token', 'weparlay-admin-token'].includes(e.key)) {
      if (e.newValue === 'site-owner-admin-token' || 
          e.newValue === 'null' || 
          e.newValue === 'undefined') {
        localStorage.removeItem(e.key);
      }
    }
  });
}
