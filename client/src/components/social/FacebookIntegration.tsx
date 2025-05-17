import React, { useState, useEffect } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { 
  Share2, Users, Award, Bell, Facebook, Shield, 
  Settings, Check, AlertTriangle, ArrowRight, Star, 
  UserPlus, Gamepad2, Link as LinkIcon, MessageSquare,
  PanelLeft
} from "lucide-react";
import { FaFacebookSquare, FaFacebookMessenger } from "react-icons/fa";

interface FacebookIntegrationProps {
  onConnect?: () => void;
}

const FacebookIntegration: React.FC<FacebookIntegrationProps> = ({ onConnect }) => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [facebookSettings, setFacebookSettings] = useState({
    autoShare: false,
    notifyFriends: true,
    allowInvites: true,
    showBetsInProfile: false
  });
  
  const handleConnectFacebook = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to connect Facebook integration",
        variant: "destructive"
      });
      return;
    }
    
    setIsConnecting(true);
    
    // In a real implementation, this would initiate the Facebook OAuth flow
    // For demo, we'll simulate a successful connection after a delay
    setTimeout(() => {
      setIsConnected(true);
      setIsConnecting(false);
      
      toast({
        title: "Facebook Connected!",
        description: "Your WeParlay account is now connected to Facebook"
      });
      
      if (onConnect) {
        onConnect();
      }
    }, 2000);
  };
  
  const handleDisconnectFacebook = () => {
    setIsConnected(false);
    
    toast({
      title: "Facebook Disconnected",
      description: "Your WeParlay account has been disconnected from Facebook"
    });
  };
  
  const handleSettingChange = (setting: keyof typeof facebookSettings) => {
    setFacebookSettings({
      ...facebookSettings,
      [setting]: !facebookSettings[setting]
    });
    
    toast({
      title: "Setting Updated",
      description: `Facebook integration setting has been updated`
    });
  };
  
  const handleShareOnFacebook = (content: string) => {
    // In a real implementation, this would use the Facebook SDK to share content
    toast({
      title: "Shared on Facebook",
      description: `Your ${content} has been shared on your Facebook timeline`
    });
  };
  
  const handleInviteFriends = () => {
    // In a real implementation, this would open the Facebook friend selector
    toast({
      title: "Invite Friends",
      description: "Opening Facebook friend selector dialog..."
    });
  };
  
  if (!isAuthenticated) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex justify-center mb-2">
            <FaFacebookSquare className="h-12 w-12 text-[#1877F2]" />
          </div>
          <CardTitle className="text-center">Facebook Integration</CardTitle>
          <CardDescription className="text-center">
            Connect WeParlay to Facebook to share bets, invite friends, and more
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6">
          <Shield className="h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium mb-2">Authentication Required</h3>
          <p className="text-sm text-gray-500 text-center mb-4">
            Please log in to access Facebook integration
          </p>
          <Link href="/login">
            <Button>
              Log In to Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex justify-center mb-2">
          <FaFacebookSquare className="h-12 w-12 text-[#1877F2]" />
        </div>
        <CardTitle className="text-center">Facebook Integration</CardTitle>
        <CardDescription className="text-center">
          Connect WeParlay to Facebook to share bets, invite friends, and more
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {!isConnected ? (
          <div className="flex flex-col items-center justify-center p-6 mb-2">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
              <Facebook className="h-8 w-8 text-[#1877F2]" />
            </div>
            <h3 className="text-lg font-medium mb-2">Connect to Facebook</h3>
            <p className="text-gray-500 dark:text-gray-400 text-center mb-4">
              Connect your Facebook account to use WeParlay inside Facebook, share bets with friends, and participate in social betting groups
            </p>
            <Button 
              onClick={handleConnectFacebook} 
              className="bg-[#1877F2] hover:bg-[#166FE5]"
              disabled={isConnecting}
            >
              {isConnecting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="mr-2"
                  >
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </motion.div>
                  Connecting...
                </>
              ) : (
                <>
                  <FaFacebookSquare className="h-4 w-4 mr-2" />
                  Connect with Facebook
                </>
              )}
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="main" className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="main" className="flex items-center justify-center">
                <PanelLeft className="h-4 w-4 mr-2" />
                App
              </TabsTrigger>
              <TabsTrigger value="friends" className="flex items-center justify-center">
                <Users className="h-4 w-4 mr-2" />
                Friends
              </TabsTrigger>
              <TabsTrigger value="share" className="flex items-center justify-center">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center justify-center">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="main">
              <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-3">
                <div className="flex items-center text-green-700 dark:text-green-400 font-medium mb-1">
                  <Check className="h-4 w-4 mr-2" />
                  Facebook Connected
                </div>
                <p className="text-sm text-green-600 dark:text-green-500">
                  Your WeParlay account is now connected to Facebook.
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-md p-4">
                  <h3 className="font-medium mb-2 flex items-center">
                    <Gamepad2 className="h-5 w-5 mr-2 text-blue-500" />
                    WeParlay Facebook App
                  </h3>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    You can now use WeParlay directly inside Facebook. Add our app to your Facebook experience!
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-3">
                    <a href="https://facebook.com/gaming/play/weparlay" target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" className="w-full justify-start">
                        <FaFacebookSquare className="h-4 w-4 mr-2 text-[#1877F2]" />
                        Open in Facebook
                      </Button>
                    </a>
                    
                    <a href="https://m.me/weparlay" target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" className="w-full justify-start">
                        <FaFacebookMessenger className="h-4 w-4 mr-2 text-[#00B2FF]" />
                        Open in Messenger
                      </Button>
                    </a>
                  </div>
                </div>
                
                <div className="rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-medium">Quick Actions</h3>
                  </div>
                  
                  <div className="p-4 grid gap-3">
                    <Button variant="outline" className="justify-start" onClick={() => handleShareOnFacebook('latest bet')}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Latest Bet
                    </Button>
                    
                    <Button variant="outline" className="justify-start" onClick={handleInviteFriends}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite Friends
                    </Button>
                    
                    <Button variant="outline" className="justify-start" onClick={() => handleShareOnFacebook('betting profile')}>
                      <LinkIcon className="h-4 w-4 mr-2" />
                      Share Profile
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="friends">
              <div className="mb-4">
                <Label htmlFor="search-friends" className="text-sm font-medium">
                  Find Facebook Friends on WeParlay
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="search-friends"
                    placeholder="Search friends..."
                    className="pr-10"
                  />
                  <button className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500">
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="rounded-md border border-gray-200 dark:border-gray-700 mb-4">
                <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <h3 className="font-medium">Facebook Friends on WeParlay</h3>
                  <Button variant="ghost" size="sm">
                    <UserPlus className="h-4 w-4 mr-1" />
                    Invite
                  </Button>
                </div>
                
                <div className="p-4 space-y-3">
                  {/* Sample friends list */}
                  {[
                    { id: 1, name: 'Michael Chen', avatar: 'https://i.pravatar.cc/150?img=11', mutual: 3 },
                    { id: 2, name: 'Sarah Johnson', avatar: 'https://i.pravatar.cc/150?img=5', mutual: 5 },
                    { id: 3, name: 'James Wilson', avatar: 'https://i.pravatar.cc/150?img=12', mutual: 2 }
                  ].map((friend) => (
                    <div key={friend.id} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
                          <img src={friend.avatar} alt={friend.name} className="h-full w-full object-cover" />
                        </div>
                        <div>
                          <h4 className="font-medium">{friend.name}</h4>
                          <p className="text-xs text-gray-500">
                            {friend.mutual} mutual betting groups
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Star className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border border-blue-100 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10 rounded-md p-4">
                <h3 className="font-medium mb-2 flex items-center text-blue-700 dark:text-blue-400">
                  <Users className="h-5 w-5 mr-2" />
                  Facebook Betting Groups
                </h3>
                <p className="text-sm text-blue-600 dark:text-blue-500 mb-3">
                  Join or create private betting groups with your Facebook friends
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="justify-start">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Join Group
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Create Group
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="share">
              <div className="mb-6 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-medium">Share on Facebook</h3>
                </div>
                
                <div className="p-4 space-y-3">
                  <div className="rounded-md border border-gray-200 dark:border-gray-700 p-3">
                    <h4 className="font-medium mb-1">Share Your Bets</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      Share your bets with friends on Facebook to show off your picks
                    </p>
                    <Button className="w-full bg-[#1877F2] hover:bg-[#166FE5]" onClick={() => handleShareOnFacebook('active bets')}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Active Bets
                    </Button>
                  </div>
                  
                  <div className="rounded-md border border-gray-200 dark:border-gray-700 p-3">
                    <h4 className="font-medium mb-1">Share Big Wins</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      Celebrate and share your biggest wins with your Facebook friends
                    </p>
                    <Button className="w-full bg-[#1877F2] hover:bg-[#166FE5]" onClick={() => handleShareOnFacebook('recent win')}>
                      <Award className="h-4 w-4 mr-2" />
                      Share Recent Win
                    </Button>
                  </div>
                  
                  <div className="rounded-md border border-gray-200 dark:border-gray-700 p-3">
                    <h4 className="font-medium mb-1">Invite Friends to Bet</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      Challenge your Facebook friends to match your bet
                    </p>
                    <Button className="w-full bg-[#1877F2] hover:bg-[#166FE5]" onClick={handleInviteFriends}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Challenge Friends
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="border border-blue-100 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10 rounded-md p-4">
                <h3 className="font-medium mb-2 text-blue-700 dark:text-blue-400">Share Tips</h3>
                <ul className="text-sm text-blue-600 dark:text-blue-500 space-y-1 list-disc list-inside">
                  <li>Add context to your shared bets to engage your friends</li>
                  <li>Share your betting strategy to help others learn</li>
                  <li>Use hashtags like #WeParlay to reach more people</li>
                  <li>Tag friends who might be interested in your bets</li>
                </ul>
              </div>
            </TabsContent>
            
            <TabsContent value="settings">
              <div className="space-y-6">
                <div className="rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-medium">Facebook Integration Settings</h3>
                  </div>
                  
                  <div className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="auto-share" className="text-sm font-medium">Auto-Share Wins</Label>
                        <p className="text-xs text-gray-500">
                          Automatically share wins over $50 on your Facebook timeline
                        </p>
                      </div>
                      <Switch 
                        id="auto-share"
                        checked={facebookSettings.autoShare}
                        onCheckedChange={() => handleSettingChange('autoShare')}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="notify-friends" className="text-sm font-medium">Friend Notifications</Label>
                        <p className="text-xs text-gray-500">
                          Allow friends to be notified when you place new bets
                        </p>
                      </div>
                      <Switch 
                        id="notify-friends"
                        checked={facebookSettings.notifyFriends}
                        onCheckedChange={() => handleSettingChange('notifyFriends')}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="allow-invites" className="text-sm font-medium">Allow Bet Invites</Label>
                        <p className="text-xs text-gray-500">
                          Allow friends to invite you to match their bets
                        </p>
                      </div>
                      <Switch 
                        id="allow-invites"
                        checked={facebookSettings.allowInvites}
                        onCheckedChange={() => handleSettingChange('allowInvites')}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="show-bets" className="text-sm font-medium">Show Bets in Profile</Label>
                        <p className="text-xs text-gray-500">
                          Display your active bets on your Facebook profile
                        </p>
                      </div>
                      <Switch 
                        id="show-bets"
                        checked={facebookSettings.showBetsInProfile}
                        onCheckedChange={() => handleSettingChange('showBetsInProfile')}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="rounded-md border border-red-200 dark:border-red-900 p-4">
                  <h3 className="font-medium text-red-600 dark:text-red-400 mb-2">Disconnect Facebook</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    Disconnecting will remove WeParlay from your Facebook account and prevent sharing
                  </p>
                  <Button variant="outline" className="text-red-600 border-red-200" onClick={handleDisconnectFacebook}>
                    Disconnect Facebook
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-center border-t border-gray-200 dark:border-gray-700 pt-4">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          This integration uses Facebook's Platform API.
          <br />
          See our <Link href="/privacy"><span className="text-blue-500 hover:underline">Privacy Policy</span></Link> for how we handle your data.
        </p>
      </CardFooter>
    </Card>
  );
};

export default FacebookIntegration;