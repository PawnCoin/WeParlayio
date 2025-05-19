import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { FaGoogle, FaFacebook, FaTwitter, FaApple, FaDiscord } from 'react-icons/fa';

interface SocialLoginProps {
  onSuccess?: () => void;
  onError?: (error: any) => void;
  redirectPath?: string;
  showTitle?: boolean;
}

export const SocialLogin: React.FC<SocialLoginProps> = ({
  onSuccess,
  onError,
  redirectPath = '/',
  showTitle = true,
}) => {
  const { toast } = useToast();

  const handleSocialLogin = async (provider: string) => {
    try {
      // In a real implementation, this would redirect to the OAuth flow
      const url = `/api/auth/${provider}?redirect=${encodeURIComponent(redirectPath)}`;
      window.location.href = url;
      
      // For demo purposes, show success toast
      toast({
        title: `Logging in with ${provider}`,
        description: "Redirecting to authentication service...",
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error(`Error during ${provider} login:`, error);
      
      toast({
        title: "Login Failed",
        description: `Unable to login with ${provider}. Please try again.`,
        variant: "destructive",
      });
      
      if (onError) {
        onError(error);
      }
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      {showTitle && (
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Sign in</CardTitle>
          <CardDescription className="text-center">
            Choose your preferred social login method
          </CardDescription>
        </CardHeader>
      )}
      
      <CardContent className="grid gap-4">
        <Button 
          variant="outline" 
          className="bg-white hover:bg-gray-50 border-gray-300 text-black"
          onClick={() => handleSocialLogin('google')}
        >
          <FaGoogle className="h-4 w-4 mr-2 text-red-500" />
          Continue with Google
        </Button>
        
        <Button 
          variant="outline" 
          className="bg-[#1877F2] hover:bg-[#166FE5] border-[#1877F2] text-white"
          onClick={() => handleSocialLogin('facebook')}
        >
          <FaFacebook className="h-4 w-4 mr-2" />
          Continue with Facebook
        </Button>
        
        <Button 
          variant="outline" 
          className="bg-[#1DA1F2] hover:bg-[#0d95e8] border-[#1DA1F2] text-white"
          onClick={() => handleSocialLogin('twitter')}
        >
          <FaTwitter className="h-4 w-4 mr-2" />
          Continue with Twitter
        </Button>
        
        <Button 
          variant="outline" 
          className="bg-black hover:bg-gray-900 border-black text-white"
          onClick={() => handleSocialLogin('apple')}
        >
          <FaApple className="h-4 w-4 mr-2" />
          Continue with Apple
        </Button>
        
        <Button 
          variant="outline" 
          className="bg-[#5865F2] hover:bg-[#4752c4] border-[#5865F2] text-white"
          onClick={() => handleSocialLogin('discord')}
        >
          <FaDiscord className="h-4 w-4 mr-2" />
          Continue with Discord
        </Button>
      </CardContent>
      
      <CardFooter className="flex flex-col">
        <p className="text-xs text-center text-gray-500 mt-2">
          By continuing, you agree to WeParlay's Terms of Service and <a href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</a>.
        </p>
      </CardFooter>
    </Card>
  );
};

export default SocialLogin;