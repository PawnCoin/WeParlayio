import React, { useState } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { 
  Repeat, Shield, Check, AlertTriangle, Download, 
  RefreshCw, LogOut, Inbox, ArrowRight 
} from "lucide-react";
import { FaFootballBall, FaGamepad } from "react-icons/fa";
import { SiEa } from "react-icons/si";

interface FantasyPlatform {
  id: string;
  name: string;
  icon: React.ReactNode;
  connected: boolean;
  teamsCount: number;
}

const FantasyPlatformSync: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [platforms, setPlatforms] = useState<FantasyPlatform[]>([

    { 
      id: 'espn', 
      name: 'ESPN Fantasy', 
      icon: <FaFootballBall className="h-6 w-6 text-red-600" />, 
      connected: false,
      teamsCount: 0
    },
    { 
      id: 'draftkings', 
      name: 'DraftKings', 
      icon: <FaGamepad className="h-6 w-6 text-green-600" />, 
      connected: false,
      teamsCount: 0
    },
    { 
      id: 'fanduel', 
      name: 'FanDuel', 
      icon: <SiEa className="h-6 w-6 text-blue-600" />, 
      connected: false,
      teamsCount: 0
    },
    { 
      id: 'nfl', 
      name: 'NFL Fantasy', 
      icon: <FaFootballBall className="h-6 w-6 text-gray-800 dark:text-gray-200" />, 
      connected: false,
      teamsCount: 0
    }
  ]);
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncComplete, setSyncComplete] = useState(false);
  const [syncOptions, setSyncOptions] = useState({
    syncPlayers: true,
    syncStats: true,
    syncTrades: false,
    autoSync: false
  });
  
  const handleConnect = (platformId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to connect your fantasy platforms.",
        variant: "destructive"
      });
      return;
    }
    
    // In a real implementation, this would initiate OAuth flow with the platform
    toast({
      title: "Connecting to Platform",
      description: `Initiating connection to ${platforms.find(p => p.id === platformId)?.name}...`,
    });
    
    // Simulate connection
    setTimeout(() => {
      setPlatforms(platforms.map(platform => 
        platform.id === platformId 
          ? { ...platform, connected: true, teamsCount: Math.floor(Math.random() * 5) + 1 } 
          : platform
      ));
      
      toast({
        title: "Platform Connected!",
        description: `Successfully connected to ${platforms.find(p => p.id === platformId)?.name}`,
      });
    }, 1500);
  };
  
  const handleDisconnect = (platformId: string) => {
    setPlatforms(platforms.map(platform => 
      platform.id === platformId 
        ? { ...platform, connected: false, teamsCount: 0 } 
        : platform
    ));
    
    toast({
      title: "Platform Disconnected",
      description: `Successfully disconnected from ${platforms.find(p => p.id === platformId)?.name}`,
    });
  };
  
  const handleOneClickSync = () => {
    const connectedPlatforms = platforms.filter(p => p.connected);
    
    if (connectedPlatforms.length < 2) {
      toast({
        title: "Sync Error",
        description: "Please connect at least two platforms to sync between them.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSyncing(true);
    
    // Simulate sync process
    setTimeout(() => {
      setIsSyncing(false);
      setSyncComplete(true);
      
      toast({
        title: "Sync Complete!",
        description: `Successfully synchronized data between ${connectedPlatforms.length} platforms.`,
      });
      
      // Reset sync complete status after a delay
      setTimeout(() => setSyncComplete(false), 3000);
    }, 3000);
  };
  
  const handleOptionChange = (option: keyof typeof syncOptions) => {
    setSyncOptions({
      ...syncOptions,
      [option]: !syncOptions[option]
    });
  };
  
  if (!isAuthenticated) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-center">Fantasy Platform Sync</CardTitle>
          <CardDescription className="text-center">
            Connect and synchronize your teams across multiple fantasy sports platforms
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6">
          <Shield className="h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium mb-2">Authentication Required</h3>
          <p className="text-sm text-gray-500 text-center mb-4">
            Please log in to access the fantasy platform sync feature
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
        <CardTitle className="flex items-center justify-center gap-2">
          <Repeat className="h-5 w-5 text-primary" />
          Fantasy Platform Sync
        </CardTitle>
        <CardDescription className="text-center">
          Connect and synchronize your teams across multiple fantasy sports platforms
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="grid gap-4">
          {platforms.map((platform) => (
            <div 
              key={platform.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                platform.connected 
                  ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/10" 
                  : "border-gray-200 dark:border-gray-700"
              }`}
            >
              <div className="flex items-center space-x-3">
                {platform.icon}
                <div>
                  <h4 className="font-medium">{platform.name}</h4>
                  {platform.connected && (
                    <p className="text-xs text-green-600 dark:text-green-400">
                      {platform.teamsCount} {platform.teamsCount === 1 ? 'team' : 'teams'} connected
                    </p>
                  )}
                </div>
              </div>
              
              {platform.connected ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDisconnect(platform.id)}
                  className="flex items-center"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Disconnect
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleConnect(platform.id)}
                  className="flex items-center"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Connect
                </Button>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-6 space-y-3">
          <h3 className="font-medium text-sm mb-2">Sync Options</h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sync-players">Sync Players</Label>
              <p className="text-xs text-gray-500">Synchronize all player data between platforms</p>
            </div>
            <Switch 
              id="sync-players"
              checked={syncOptions.syncPlayers}
              onCheckedChange={() => handleOptionChange('syncPlayers')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sync-stats">Sync Statistics</Label>
              <p className="text-xs text-gray-500">Keep player stats consistent across platforms</p>
            </div>
            <Switch 
              id="sync-stats"
              checked={syncOptions.syncStats}
              onCheckedChange={() => handleOptionChange('syncStats')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sync-trades">Sync Trades</Label>
              <p className="text-xs text-gray-500">Automatically reflect trades across all platforms</p>
            </div>
            <Switch 
              id="sync-trades"
              checked={syncOptions.syncTrades}
              onCheckedChange={() => handleOptionChange('syncTrades')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-sync">Auto-Sync</Label>
              <p className="text-xs text-gray-500">Automatically sync every 6 hours</p>
            </div>
            <Switch 
              id="auto-sync"
              checked={syncOptions.autoSync}
              onCheckedChange={() => handleOptionChange('autoSync')}
            />
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col">
        <Button 
          onClick={handleOneClickSync}
          className="w-full"
          disabled={platforms.filter(p => p.connected).length < 2 || isSyncing}
        >
          {isSyncing ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mr-2"
              >
                <RefreshCw className="h-4 w-4" />
              </motion.div>
              Syncing Platforms...
            </>
          ) : syncComplete ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Sync Complete!
            </>
          ) : (
            <>
              <Repeat className="h-4 w-4 mr-2" />
              One-Click Team Sync
            </>
          )}
        </Button>
        
        {platforms.filter(p => p.connected).length < 2 && (
          <p className="text-xs text-amber-500 mt-2 flex items-center justify-center">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Connect at least two platforms to enable sync
          </p>
        )}
      </CardFooter>
    </Card>
  );
};

export default FantasyPlatformSync;