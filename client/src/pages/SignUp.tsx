import React, { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import CryptoWalletConnect from "@/components/auth/CryptoWalletConnect";
import { apiRequest } from "@/lib/queryClient";

const SignUp: React.FC = () => {
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  
  // Form states
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [walletType, setWalletType] = useState("");
  
  // Handle traditional signup
  const handleTraditionalSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please ensure your passwords match.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real app, this would call an API to create the user
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Account created",
        description: "Your account has been created successfully. You can now log in.",
      });
      
      setLocation("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error creating your account. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle wallet connect
  const handleWalletConnect = (address: string, type: string) => {
    setWalletAddress(address);
    setWalletType(type);
    
    toast({
      title: "Wallet Connected",
      description: "Please complete your registration details.",
    });
  };
  
  // Handle wallet signup
  const handleWalletSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!walletAddress) {
      toast({
        title: "No wallet connected",
        description: "Please connect your crypto wallet first.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real app, this would call an API to create the user with wallet
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Account created",
        description: "Your account has been created with your crypto wallet. You can now log in.",
      });
      
      setLocation("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error creating your account. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-neutral-light dark:bg-neutral-dark">
      <Card className="w-full max-w-md bg-card text-card-foreground">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-foreground">Create an Account</CardTitle>
          <CardDescription>
            Sign up to start betting on WeParlay.io
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="traditional" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="traditional">Email & Password</TabsTrigger>
              <TabsTrigger value="wallet">Crypto Wallet</TabsTrigger>
            </TabsList>
            
            <TabsContent value="traditional">
              <form onSubmit={handleTraditionalSignUp}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-foreground">Username</Label>
                    <Input 
                      id="username" 
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="bg-background text-foreground"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-background text-foreground"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-foreground">Password</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-background text-foreground"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
                    <Input 
                      id="confirmPassword" 
                      type="password" 
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="bg-background text-foreground"
                    />
                  </div>
                </div>
                
                <Button className="w-full mt-6" type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Creating Account...
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="wallet">
              <div className="space-y-4">
                {!walletAddress ? (
                  <>
                    <div className="text-center mb-6">
                      <p className="text-sm text-muted-foreground mb-4">
                        Connect your cryptocurrency wallet to sign up and start betting with crypto.
                      </p>
                      <CryptoWalletConnect onConnect={handleWalletConnect} />
                    </div>
                  </>
                ) : (
                  <form onSubmit={handleWalletSignUp}>
                    <div className="bg-muted p-3 rounded-md mb-6">
                      <div className="text-sm font-medium text-foreground mb-1">Wallet Connected</div>
                      <div className="text-xs text-muted-foreground mb-1">
                        {walletType} - {walletAddress.substring(0, 8)}...{walletAddress.substring(walletAddress.length - 6)}
                      </div>
                    </div>
                  
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="wallet-username" className="text-foreground">Username</Label>
                        <Input 
                          id="wallet-username" 
                          placeholder="Enter your username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                          className="bg-background text-foreground"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="wallet-email" className="text-foreground">Email (Optional)</Label>
                        <Input 
                          id="wallet-email" 
                          type="email" 
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="bg-background text-foreground"
                        />
                        <p className="text-xs text-muted-foreground">
                          Your email is used for account recovery and notifications
                        </p>
                      </div>
                    </div>
                    
                    <Button className="w-full mt-6" type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                          Creating Account...
                        </div>
                      ) : (
                        "Create Account with Wallet"
                      )}
                    </Button>
                  </form>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col items-center justify-center gap-2">
          <div className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Button 
              variant="link" 
              className="p-0 h-auto text-primary" 
              onClick={() => setLocation("/login")}
            >
              Log in
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">
            By signing up, you agree to our{" "}
            <Button variant="link" className="p-0 h-auto text-primary text-xs">
              Terms of Service
            </Button>{" "}
            and{" "}
            <Button variant="link" className="p-0 h-auto text-primary text-xs">
              Privacy Policy
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignUp;