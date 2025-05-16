import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface WordPressLoginButtonProps {
  onLogin?: () => void;
  className?: string;
}

const WordPressLoginButton: React.FC<WordPressLoginButtonProps> = ({ 
  onLogin, 
  className = "" 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Handle one-click WordPress login
  const handleWordPressLogin = () => {
    setIsLoading(true);
    
    // In production, this would redirect to the WordPress site's OAuth endpoint
    // For this prototype, just simulate the login process
    setTimeout(() => {
      setIsLoading(false);
      
      if (onLogin) {
        onLogin();
      }
      
      toast({
        title: "WordPress Login",
        description: "Redirecting to weparlay.io for WordPress login...",
      });
      
      // Redirect to WordPress login page
      window.location.href = "https://weparlay.io/login";
    }, 1000);
  };

  return (
    <Button
      onClick={handleWordPressLogin}
      disabled={isLoading}
      className={`relative overflow-hidden ${className}`}
    >
      {isLoading ? (
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-blue-600 to-green-500"
          animate={{ 
            x: ["0%", "100%"], 
            background: [
              "linear-gradient(to right, #2563eb, #10b981)", 
              "linear-gradient(to right, #10b981, #2563eb)"
            ] 
          }}
          transition={{ 
            duration: 1, 
            repeat: Infinity, 
            repeatType: "reverse" 
          }}
          style={{ opacity: 0.3 }}
        />
      ) : null}
      
      <div className="flex items-center justify-center gap-2">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          width="18" 
          height="18" 
          fill="currentColor"
        >
          <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 19.5c-5.247 0-9.5-4.253-9.5-9.5S6.753 2.5 12 2.5s9.5 4.253 9.5 9.5-4.253 9.5-9.5 9.5z"/>
          <path d="M12 4.25a7.75 7.75 0 100 15.5 7.75 7.75 0 000-15.5zM12 17a5 5 0 110-10 5 5 0 010 10z"/>
          <circle cx="12" cy="12" r="2.25"/>
        </svg>
        {isLoading ? "Connecting..." : "Login with WordPress"}
      </div>
    </Button>
  );
};

export default WordPressLoginButton;