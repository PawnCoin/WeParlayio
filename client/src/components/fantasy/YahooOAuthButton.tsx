import React from 'react';
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface YahooOAuthButtonProps {
  onSuccess?: () => void;
}

const YahooOAuthButton: React.FC<YahooOAuthButtonProps> = ({ onSuccess }) => {
  const handleYahooLogin = () => {
    // Open Yahoo OAuth in same window to maintain session
    window.location.href = '/api/yahoo/login';
  };

  return (
    <Button 
      onClick={handleYahooLogin}
      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
    >
      <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center mr-2">
        <span className="text-purple-600 text-xs font-bold">Y!</span>
      </div>
      Connect Yahoo Fantasy
      <ExternalLink className="w-4 h-4 ml-2" />
    </Button>
  );
};

export default YahooOAuthButton;