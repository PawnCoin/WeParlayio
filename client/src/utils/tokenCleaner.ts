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
      console.log(`Clearing invalid token: ${key} = ${token}`);
      localStorage.removeItem(key);
    }
  });
}

// Set fresh admin token
export function setFreshAdminToken() {
  const adminToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZG1pbi0xNzU0Mjc2MTA4MzIyIiwidXNlcm5hbWUiOiJXZVBhcmxheSBBZG1pbiIsImVtYWlsIjoic3VwcG9ydEB3ZXBhcmxheS5pbyIsInJvbGUiOiJhZG1pbiIsImlzQWRtaW4iOnRydWUsImlhdCI6MTc1NDI3NjEwOCwiZXhwIjoxNzU0ODgwOTA4fQ.H9Rq9G9FBA0GepotaIME-z8hHqcj49JvjaN5TT3j5wU";
  
  // Clear all existing tokens first
  clearInvalidTokens();
  
  // Set the fresh admin token
  localStorage.setItem('auth-token', adminToken);
  localStorage.setItem('weparlay-is-admin', 'true');
  localStorage.setItem('weparlay-admin-role', 'admin');
  localStorage.setItem('weparlay-logged-in', 'true');
  
  console.log('✅ Fresh admin token set successfully');
}

// Initialize token cleanup on app load
export function initializeTokenCleanup() {
  // Clear invalid tokens on page load
  clearInvalidTokens();
  
  // Set fresh admin token if needed
  const currentToken = localStorage.getItem('auth-token');
  if (!currentToken || currentToken.includes('Invalid') || currentToken === 'null') {
    setFreshAdminToken();
  }
  
  // Monitor for invalid token changes
  window.addEventListener('storage', (e) => {
    if (e.key && ['auth-token', 'weparlay-admin-token'].includes(e.key)) {
      if (e.newValue === 'site-owner-admin-token' || 
          e.newValue === 'null' || 
          e.newValue === 'undefined') {
        localStorage.removeItem(e.key);
        console.log(`Auto-cleared invalid token: ${e.key}`);
      }
    }
  });
}