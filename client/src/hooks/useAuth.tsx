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
      console.log('Backend login response:', data);
      
      const user = data.user || data;
      
      // Store JWT token if provided
      if (data.token) {
        localStorage.setItem("auth-token", data.token);
      }
      
      // Check admin status from backend response (highest priority)
      const isAdminFromBackend = data.isAdmin || user.isAdmin || user.role === 'admin';
      
      // Check if this is an admin login based on email (secondary check)
      const adminEmails = ['support@weparlay.io', 'admin@weparlay.io', 'weparlay@admin.com'];
      const loginEmail = credentials.username.includes('@') ? credentials.username : `${credentials.username}@weparlay.io`;
      const isAdminByEmail = adminEmails.includes(loginEmail) || adminEmails.includes(user.email);
      
      // Final admin status determination
      const isAdmin = isAdminFromBackend || isAdminByEmail;
      
      // Update user object with confirmed admin status
      user.isAdmin = isAdmin;
      user.role = isAdmin ? 'admin' : (user.role || 'user');
      
      setCurrentUser(user);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("weparlay-logged-in", "true");
      localStorage.setItem("weparlay-user-email", user.email || loginEmail);
      localStorage.setItem("weparlay-is-admin", isAdmin ? "true" : "false");
      if (isAdmin) {
        localStorage.setItem("weparlay-admin-email", user.email || loginEmail);
      }
      
      console.log('Admin login verification:', {
        backendResponse: data,
        userEmail: user.email,
        isAdminFromBackend,
        isAdminByEmail,
        finalIsAdmin: isAdmin,
        storedAdminStatus: localStorage.getItem("weparlay-is-admin")
      });
      
      toast({
        title: "Logged in successfully",
        description: `Welcome back, ${user.username || user.firstName || 'User'}!${isAdmin ? ' (Admin Access Granted)' : ''}`,
      });
      
      // Redirect to dashboard after successful login
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
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
  
  const logout = async () => {
    try {
      // Call logout endpoint
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
    
    // Clear all user data
    setCurrentUser(null);
    localStorage.clear(); // Clear all localStorage items
    sessionStorage.clear(); // Clear all sessionStorage items
    
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    
    // Force reload to ensure clean state
    window.location.reload();
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
