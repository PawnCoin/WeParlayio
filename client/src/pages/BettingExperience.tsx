import React, { useState } from "react";
import { BetSlipProvider } from '@/contexts/BetSlipContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Zap, Star } from "lucide-react";
import { Separator } from "@/components/ui/separator";

// Import enhanced betting components
import BettingManager from "@/pages/BettingManager";
import LiveOddsUpdates from "@/components/betting/LiveOddsUpdates";
import SavedBetSlips from "@/components/betting/SavedBetSlips";

// Main betting experience page with enhanced UI
const BettingExperience: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("live");
  
  return (
    <BetSlipProvider>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-foreground">WeParlay Betting</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <Tabs defaultValue="live" onValueChange={setActiveTab}>
              <TabsList className="w-full mb-4 grid grid-cols-3 bg-muted">
                <TabsTrigger value="live" className="tabs-trigger">
                  <Activity className="h-4 w-4 mr-2" /> Live Betting
                </TabsTrigger>
                <TabsTrigger value="trending" className="tabs-trigger">
                  <Zap className="h-4 w-4 mr-2" /> Trending
                </TabsTrigger>
                <TabsTrigger value="favorites" className="tabs-trigger">
                  <Star className="h-4 w-4 mr-2" /> My Favorites
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="live">
                <Card>
                  <CardHeader>
                    <CardTitle>Live Betting</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Place bets on live games happening right now. Add selections to your bet slip.
                    </p>
                    <div className="text-center py-6">
                      <p className="text-md font-medium">Enhanced betting experience is now available!</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Use the bet slip on the right to manage and place your bets.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="trending">
                <Card>
                  <CardHeader>
                    <CardTitle>Trending Bets</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      See the most popular bets across WeParlay right now.
                    </p>
                    <div className="mt-4 space-y-4">
                      {/* Trending bets content */}
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">Coming soon!</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="favorites">
                <Card>
                  <CardHeader>
                    <CardTitle>My Favorite Bets</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Your saved favorite betting markets appear here.
                    </p>
                    <div className="mt-4">
                      <SavedBetSlips />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <div>
            <BettingManager />
            
            <Separator className="my-4" />
            
            {activeTab === "live" && <LiveOddsUpdates />}
          </div>
        </div>
      </div>
    </BetSlipProvider>
  );
};

export default BettingExperience;