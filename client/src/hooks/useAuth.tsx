import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface LoginCredentials {
  username: string;
  password: string;
}

export function useAuth() {
  const { toast } = useToast();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // Mock user for now - in a real app, this would check for a session
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      // Check if admin status is stored separately
      const isAdmin = localStorage.getItem("weparlay-is-admin") === "true";
      if (isAdmin) {
        user.isAdmin = true;
        user.role = 'admin';
      }
      return user;
    }
    return null;
  });
  
  const login = async (credentials: LoginCredentials) => {
    setIsLoggingIn(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: credentials.username, // Use username as email for login
          password: credentials.password 
        }),
      });
      
      if (!response.ok) {
        throw new Error("Login failed");
      }
      
      const data = await response.json();
      const user = data.user || data;
      
      // Check if this is an admin login based on email
      const adminEmails = ['support@weparlay.io', 'admin@weparlay.io', 'weparlay@admin.com'];
      const isAdminLogin = adminEmails.includes(credentials.username);
      
      // Update user object with admin status if it's an admin login
      if (isAdminLogin) {
        user.isAdmin = true;
        user.role = 'admin';
      }
      
      setCurrentUser(user);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("weparlay-logged-in", "true");
      localStorage.setItem("weparlay-user-email", user.email);
      localStorage.setItem("weparlay-is-admin", isAdminLogin ? "true" : "false");
      
      toast({
        title: "Logged in successfully",
        description: `Welcome back, ${user.username || user.firstName || 'User'}!${isAdminLogin ? ' (Admin Access)' : ''}`,
      });
      
      // Redirect to dashboard after successful login
      window.location.href = '/';
      
      return user;
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoggingIn(false);
    }
  };
  
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("weparlay-logged-in");
    localStorage.removeItem("weparlay-user-email");
    localStorage.removeItem("weparlay-is-admin");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    // Redirect to homepage after logout
    window.location.href = '/';
  };

  const connectWallet = (address: string, type: string) => {
    console.log(`Connecting wallet: ${address} (${type})`);
    // Wallet connection logic would go here
  };
  
  return {
    user: currentUser,
    isAuthenticated: !!currentUser,
    isLoggingIn,
    login,
    logout,
    connectWallet,
  };
}
