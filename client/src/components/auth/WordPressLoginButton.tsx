import React from 'react';
import { Button } from "@/components/ui/button";

interface WordPressLoginButtonProps {
  onLogin?: () => void;
  className?: string;
}

// This component is disabled as the app is not WordPress-based
const WordPressLoginButton: React.FC<WordPressLoginButtonProps> = ({ 
  onLogin, 
  className = "" 
}) => {
  return null; // Disabled - app is not WordPress-based
};

export default WordPressLoginButton;