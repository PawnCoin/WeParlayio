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
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const login = async (credentials: LoginCredentials) => {
    setIsLoggingIn(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      
      if (!response.ok) {
        throw new Error("Login failed");
      }
      
      const data = await response.json();
      const user = data.user || data;
      
      setCurrentUser(user);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("weparlay-logged-in", "true");
      localStorage.setItem("weparlay-user-email", user.email);
      
      toast({
        title: "Logged in successfully",
        description: `Welcome back, ${user.username || user.firstName || 'User'}!`,
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
