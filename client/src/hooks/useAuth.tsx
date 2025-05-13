import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
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
      const response = await apiRequest("POST", "/api/login", credentials);
      const user = await response.json();
      
      setCurrentUser(user);
      localStorage.setItem("user", JSON.stringify(user));
      
      toast({
        title: "Logged in successfully",
        description: `Welcome back, ${user.username}!`,
      });
      
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
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };
  
  return {
    user: currentUser,
    isAuthenticated: !!currentUser,
    isLoggingIn,
    login,
    logout,
  };
}
