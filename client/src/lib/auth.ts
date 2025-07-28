// Auth utilities for managing admin state
export const setAdminAuth = (email: string, isAdmin: boolean) => {
  const adminEmails = ['support@weparlay.io', 'admin@weparlay.io', 'weparlay@admin.com'];
  
  if (adminEmails.includes(email)) {
    localStorage.setItem('weparlay-is-admin', 'true');
    localStorage.setItem('weparlay-admin-email', email);
    
    // Update auth header for API calls
    const headers = new Headers();
    headers.set('X-User-Email', email);
    
    // Store headers for future API calls
    window.__weparlayAuthHeaders = headers;
  }
};

export const clearAdminAuth = () => {
  localStorage.removeItem('weparlay-is-admin');
  localStorage.removeItem('weparlay-admin-email');
  delete window.__weparlayAuthHeaders;
};

export const getAuthHeaders = () => {
  const adminEmail = localStorage.getItem('weparlay-admin-email');
  if (adminEmail) {
    return { 'X-User-Email': adminEmail };
  }
  return {};
};

// Extend window object
declare global {
  interface Window {
    __weparlayAuthHeaders?: Headers;
  }
}