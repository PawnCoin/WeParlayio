import React from 'react';
import { useLocation } from 'wouter';
import SocialLogin from '@/components/auth/SocialLogin';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const Login: React.FC = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Get redirect path from URL params if available
  const urlParams = new URLSearchParams(window.location.search);
  const redirectPath = urlParams.get('redirect') || '/';
  
  const handleLoginSuccess = () => {
    // In real implementation, this would handle post-login logic
    toast({
      title: "Successfully logged in",
      description: "Welcome back to WeParlay!",
    });
    
    setTimeout(() => {
      navigate(redirectPath);
    }, 2000);
  };
  
  return (
    <div className="container max-w-7xl mx-auto py-12 px-4">
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-8">Welcome to WeParlay</h1>
          
          <Tabs defaultValue="social" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="social">Social Login</TabsTrigger>
              <TabsTrigger value="wallet">Wallet Connect</TabsTrigger>
            </TabsList>
            
            <TabsContent value="social">
              <SocialLogin 
                onSuccess={handleLoginSuccess}
                redirectPath={redirectPath}
                showTitle={false}
              />
            </TabsContent>
            
            <TabsContent value="wallet">
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Connect Your Wallet</CardTitle>
                  <CardDescription className="text-center">
                    Use your crypto wallet to sign in
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  {/* Placeholder for wallet connect buttons - this would be implemented with real wallet providers */}
                  <button 
                    className="w-full py-3 px-4 rounded-md bg-gradient-to-r from-purple-500 to-purple-700 text-white font-medium flex items-center justify-center"
                    onClick={() => {
                      toast({
                        title: "Wallet Connect",
                        description: "Wallet connection functionality will be implemented here."
                      });
                    }}
                  >
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M199.5 400C309.799 400 400 309.799 400 199.5C400 89.201 309.799 -1 199.5 -1C89.201 -1 -1 89.201 -1 199.5C-1 309.799 89.201 400 199.5 400Z" fill="white"/>
                      <path d="M254.664 185.723C297.789 185.723 332.639 165.768 332.639 141.028C332.639 116.288 297.789 96.333 254.664 96.333C211.538 96.333 176.689 116.288 176.689 141.028C176.689 165.768 211.538 185.723 254.664 185.723Z" fill="#3396FF"/>
                      <path d="M144.807 219.223C187.933 219.223 222.782 199.268 222.782 174.528C222.782 149.788 187.933 129.833 144.807 129.833C101.682 129.833 66.832 149.788 66.832 174.528C66.832 199.268 101.682 219.223 144.807 219.223Z" fill="#3396FF"/>
                      <path d="M254.664 252.333C297.789 252.333 332.639 232.378 332.639 207.638C332.639 182.898 297.789 162.944 254.664 162.944C211.538 162.944 176.689 182.898 176.689 207.638C176.689 232.378 211.538 252.333 254.664 252.333Z" fill="#3396FF"/>
                    </svg>
                    Connect with WalletConnect
                  </button>
                  
                  <button 
                    className="w-full py-3 px-4 rounded-md bg-[#3b5998] text-white font-medium flex items-center justify-center"
                    onClick={() => {
                      toast({
                        title: "MetaMask",
                        description: "MetaMask connection functionality will be implemented here."
                      });
                    }}
                  >
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 35 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M32.9582 1L19.8241 10.7183L22.2541 5.12254L32.9582 1Z" fill="#E17726" stroke="#E17726" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2.04183 1L15.0564 10.809L12.7454 5.12256L2.04183 1Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M28.2036 23.5335L24.7136 28.8408L32.022 30.8633L34.125 23.6482L28.2036 23.5335Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M0.875 23.6482L2.97053 30.8633L10.2695 28.8408L6.7889 23.5335L0.875 23.6482Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9.90906 14.5149L7.85156 17.5815L15.0654 17.8915L14.832 10.0459L9.90906 14.5149Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M25.0907 14.5149L20.0991 9.95508L19.8242 17.8915L27.0474 17.5815L25.0907 14.5149Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M10.2695 28.8408L14.6036 26.7085L10.8413 23.6914L10.2695 28.8408Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M20.3965 26.7085L24.7138 28.8408L24.1506 23.6914L20.3965 26.7085Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Connect with MetaMask
                  </button>
                  
                  <button 
                    className="w-full py-3 px-4 rounded-md bg-[#627eea] text-white font-medium flex items-center justify-center"
                    onClick={() => {
                      toast({
                        title: "Coinbase Wallet",
                        description: "Coinbase Wallet connection functionality will be implemented here."
                      });
                    }}
                  >
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z" fill="white"/>
                      <path fillRule="evenodd" clipRule="evenodd" d="M11.8497 4C7.4097 4 4 7.42297 4 11.8497C4 16.2897 7.42297 19.6994 11.8497 19.6994C16.2897 19.6994 19.6994 16.2765 19.6994 11.8497C19.6994 7.4097 16.2765 4 11.8497 4ZM11.8497 17.496C8.68144 17.496 6.20367 15.018 6.20367 11.8497C6.20367 8.68144 8.68144 6.20367 11.8497 6.20367C15.018 6.20367 17.496 8.68144 17.496 11.8497C17.496 15.018 15.018 17.496 11.8497 17.496ZM10.3092 9.57507H13.39V14.1243H10.3092V9.57507Z" fill="#1652F0"/>
                    </svg>
                    Connect with Coinbase Wallet
                  </button>
                </CardContent>
                <CardFooter className="flex flex-col">
                  <p className="text-xs text-center text-gray-500 mt-2">
                    By connecting your wallet, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
          
          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account? No problem! Sign in using any of the methods above to create one.
          </p>
          <p className="text-center text-xs text-gray-500 mt-3">
            By logging in, you agree to our <a href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</a> and Terms of Service.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;