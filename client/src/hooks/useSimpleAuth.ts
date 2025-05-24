import { useState, useEffect } from 'react';

export function useSimpleAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if user is logged in via localStorage (simple and reliable)
    const checkAuth = () => {
      try {
        const loggedIn = localStorage.getItem('weparlay-logged-in') === 'true';
        const email = localStorage.getItem('weparlay-user-email');
        
        setIsLoggedIn(loggedIn);
        setUserEmail(email);
        setIsLoading(false);
      } catch (error) {
        // If localStorage fails, assume not logged in
        setIsLoggedIn(false);
        setUserEmail(null);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (email: string) => {
    try {
      localStorage.setItem('weparlay-logged-in', 'true');
      localStorage.setItem('weparlay-user-email', email);
      setIsLoggedIn(true);
      setUserEmail(email);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('weparlay-logged-in');
      localStorage.removeItem('weparlay-user-email');
      setIsLoggedIn(false);
      setUserEmail(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return {
    isLoggedIn,
    userEmail,
    isLoading,
    login,
    logout
  };
}