import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { LogIn, UserPlus, Eye, EyeOff, Shield, Mail, Lock, User, Phone, Calendar } from "lucide-react";

const AuthenticationHub: React.FC = () => {
  const [, navigate] = useLocation();
  const auth = useAuth();
  const login = auth.login || (() => Promise.resolve());
  const isLoggingIn = auth.isLoggingIn || false;
  const { toast } = useToast();

  // Login state
  const [loginData, setLoginData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });

  // Signup state
  const [signupData, setSignupData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    agreeToTerms: false,
    agreeToPrivacy: false,
    allowMarketing: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [signupStep, setSignupStep] = useState(1);

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginData.username || !loginData.password) {
      toast({
        title: "Missing Information",
        description: "Please enter both username and password",
        variant: "destructive",
      });
      return;
    }

    try {
      await login({
        username: loginData.username,
        password: loginData.password
      });
      
      toast({
        title: "Welcome back!",
        description: "Successfully logged into your WeParlay account",
      });

      navigate('/');
    } catch (error) {
      // Error handling is done in the login function
    }
  };

  // Handle signup
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!signupData.username || !signupData.email || !signupData.password) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (!signupData.agreeToTerms || !signupData.agreeToPrivacy) {
      toast({
        title: "Terms Required",
        description: "Please agree to Terms of Service and Privacy Policy",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData)
      });

      if (response.ok) {
        const data = await response.json();
        
        // Store user data
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('weparlay-logged-in', 'true');
        localStorage.setItem('weparlay-user-email', data.user.email);

        toast({
          title: "Welcome to WeParlay!",
          description: "Your account has been created successfully. You received $25 welcome bonus!",
        });

        navigate('/');
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "Please try again or contact support",
        variant: "destructive",
      });
    }
  };

  // Quick demo login
  const handleDemoLogin = () => {
    const demoUser = {
      id: 'demo-user',
      username: 'DemoUser',
      email: 'demo@weparlay.io',
      firstName: 'Demo',
      lastName: 'User',
      balance: 1000,
      tier: 'bronze',
      isAdmin: false
    };

    localStorage.setItem('user', JSON.stringify(demoUser));
    localStorage.setItem('weparlay-logged-in', 'true');
    localStorage.setItem('weparlay-user-email', demoUser.email);

    toast({
      title: "Demo Account Active",
      description: "Welcome to WeParlay! Explore with $1000 demo balance",
    });

    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">WeParlay</h1>
          <p className="text-slate-300">Your Premier Sports Betting Platform</p>
        </div>

        <Tabs defaultValue="login" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Login
            </TabsTrigger>
            <TabsTrigger value="signup" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Sign Up
            </TabsTrigger>
          </TabsList>

          {/* Login Tab */}
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  Welcome Back
                </CardTitle>
                <CardDescription>
                  Sign in to your WeParlay account to continue betting
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username or Email</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="username"
                        type="text"
                        placeholder="Enter username or email"
                        value={loginData.username}
                        onChange={(e) => setLoginData(prev => ({ ...prev, username: e.target.value }))}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter password"
                        value={loginData.password}
                        onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={loginData.rememberMe}
                      onCheckedChange={(checked) => 
                        setLoginData(prev => ({ ...prev, rememberMe: checked as boolean }))
                      }
                    />
                    <Label htmlFor="remember" className="text-sm">Remember me</Label>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-green-600 hover:bg-green-700" 
                    disabled={isLoggingIn}
                  >
                    {isLoggingIn ? "Signing In..." : "Sign In"}
                  </Button>
                </form>

                <div className="mt-4 space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={handleDemoLogin}
                  >
                    Try Demo Account
                  </Button>
                  
                  <div className="text-center">
                    <Button variant="link" className="text-sm text-muted-foreground">
                      Forgot Password?
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Signup Tab */}
          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-blue-600" />
                  Create Account
                </CardTitle>
                <CardDescription>
                  Join WeParlay and get $25 welcome bonus!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignup} className="space-y-4">
                  {signupStep === 1 && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            type="text"
                            placeholder="John"
                            value={signupData.firstName}
                            onChange={(e) => setSignupData(prev => ({ ...prev, firstName: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            type="text"
                            placeholder="Doe"
                            value={signupData.lastName}
                            onChange={(e) => setSignupData(prev => ({ ...prev, lastName: e.target.value }))}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signupUsername">Username</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signupUsername"
                            type="text"
                            placeholder="Choose username"
                            value={signupData.username}
                            onChange={(e) => setSignupData(prev => ({ ...prev, username: e.target.value }))}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signupEmail">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signupEmail"
                            type="email"
                            placeholder="john@example.com"
                            value={signupData.email}
                            onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <Button 
                        type="button"
                        onClick={() => setSignupStep(2)}
                        className="w-full"
                        disabled={!signupData.firstName || !signupData.lastName || !signupData.username || !signupData.email}
                      >
                        Continue
                      </Button>
                    </>
                  )}

                  {signupStep === 2 && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="signupPassword">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signupPassword"
                            type={showPassword ? "text" : "password"}
                            placeholder="Create password"
                            value={signupData.password}
                            onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                            className="pl-10 pr-10"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="Confirm password"
                            value={signupData.confirmPassword}
                            onChange={(e) => setSignupData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone (Optional)</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="+1 (555) 123-4567"
                            value={signupData.phone}
                            onChange={(e) => setSignupData(prev => ({ ...prev, phone: e.target.value }))}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="dateOfBirth"
                            type="date"
                            value={signupData.dateOfBirth}
                            onChange={(e) => setSignupData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-start space-x-2">
                          <Checkbox
                            id="terms"
                            checked={signupData.agreeToTerms}
                            onCheckedChange={(checked) => 
                              setSignupData(prev => ({ ...prev, agreeToTerms: checked as boolean }))
                            }
                            required
                          />
                          <div className="text-sm">
                            <Label htmlFor="terms">
                              I agree to the <Button variant="link" className="p-0 h-auto text-sm">Terms of Service</Button>
                            </Label>
                          </div>
                        </div>

                        <div className="flex items-start space-x-2">
                          <Checkbox
                            id="privacy"
                            checked={signupData.agreeToPrivacy}
                            onCheckedChange={(checked) => 
                              setSignupData(prev => ({ ...prev, agreeToPrivacy: checked as boolean }))
                            }
                            required
                          />
                          <div className="text-sm">
                            <Label htmlFor="privacy">
                              I agree to the <Button variant="link" className="p-0 h-auto text-sm">Privacy Policy</Button>
                            </Label>
                          </div>
                        </div>

                        <div className="flex items-start space-x-2">
                          <Checkbox
                            id="marketing"
                            checked={signupData.allowMarketing}
                            onCheckedChange={(checked) => 
                              setSignupData(prev => ({ ...prev, allowMarketing: checked as boolean }))
                            }
                          />
                          <div className="text-sm">
                            <Label htmlFor="marketing">
                              I want to receive promotional emails and betting tips
                            </Label>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                          Create Account & Get $25 Bonus
                        </Button>
                        <Button 
                          type="button"
                          variant="outline"
                          onClick={() => setSignupStep(1)}
                          className="w-full"
                        >
                          Back
                        </Button>
                      </div>
                    </>
                  )}
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 text-center text-sm text-slate-400">
          <p>Secure, encrypted, and trusted by thousands of users worldwide</p>
        </div>
      </div>
    </div>
  );
};

export default AuthenticationHub;