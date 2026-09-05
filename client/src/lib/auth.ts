// Auth utilities for managing admin state
export const setAdminAuth = (email: string, isAdmin: boolean) => {
  // Deprecated: the server is the only source of administrator authorization.
};

export const clearAdminAuth = () => {
  localStorage.removeItem('weparlay-is-admin');
  localStorage.removeItem('weparlay-admin-email');
  delete window.__weparlayAuthHeaders;
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem('auth-token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Extend window object
declare global {
  interface Window {
    __weparlayAuthHeaders?: Headers;
  }
}
