import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import VoiceActivatedBetting from "@/components/betting/VoiceActivatedBetting";
import FantasyPlatformSync from "@/components/fantasy/FantasyPlatformSync";
import YahooFootballFantasyIntegration from "@/components/fantasy/YahooFootballFantasyIntegration";
import FacebookIntegration from "@/components/social/FacebookIntegration";
import { Mic, Repeat, Share2, Gamepad2 } from "lucide-react";

const EnhancedFeatures: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  return (
    <div className="container max-w-7xl mx-auto py-6 px-4">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Enhanced Features</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Try out these advanced features to enhance your betting experience
          </p>
        </div>
        
        <Tabs defaultValue="voice" className="w-full">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="voice" className="flex items-center justify-center">
              <Mic className="h-4 w-4 mr-2" />
              Voice Betting
            </TabsTrigger>
            <TabsTrigger value="fantasy-sync" className="flex items-center justify-center">
              <Repeat className="h-4 w-4 mr-2" />
              Fantasy Sync
            </TabsTrigger>
            <TabsTrigger value="yahoo" className="flex items-center justify-center">
              <Gamepad2 className="h-4 w-4 mr-2" />
              Yahoo Fantasy
            </TabsTrigger>
            <TabsTrigger value="facebook" className="flex items-center justify-center">
              <Share2 className="h-4 w-4 mr-2" />
              Facebook
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="voice">
            <Card>
              <CardHeader>
                <CardTitle>Voice-Activated Betting</CardTitle>
                <CardDescription>
                  Use your voice to quickly place bets without typing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <VoiceActivatedBetting 
                  onBetPlaced={() => {
                    // Additional handling if needed
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="fantasy-sync">
            <Card>
              <CardHeader>
                <CardTitle>One-Click Fantasy Platform Sync</CardTitle>
                <CardDescription>
                  Synchronize your fantasy teams across multiple platforms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FantasyPlatformSync />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="yahoo">
            <Card>
              <CardHeader>
                <CardTitle>Yahoo Football Fantasy Integration</CardTitle>
                <CardDescription>
                  Connect, view, and manage your Yahoo Football Fantasy teams
                </CardDescription>
              </CardHeader>
              <CardContent>
                <YahooFootballFantasyIntegration />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="facebook">
            <Card>
              <CardHeader>
                <CardTitle>Facebook Integration</CardTitle>
                <CardDescription>
                  Use WeParlay within Facebook and share your bets with friends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FacebookIntegration 
                  onConnect={() => {
                    toast({
                      title: "Facebook Connected",
                      description: "You can now use WeParlay within Facebook"
                    });
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EnhancedFeatures;