import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Crown } from "lucide-react";
import { useLocation } from "wouter";
import YahooFantasyDashboard from "@/components/fantasy/YahooFantasyDashboard";

export default function YahooFantasyPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-sm border-b border-white/10 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => setLocation('/fantasy')}
                className="text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Fantasy Hub
              </Button>
              <div className="flex items-center gap-2">
                <Crown className="w-6 h-6 text-purple-500" />
                <h1 className="text-xl font-bold text-white">Yahoo Fantasy Dashboard</h1>
              </div>
            </div>
            <Badge variant="outline" className="border-purple-500/50 text-purple-400">
              WeParlay Native Interface
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <YahooFantasyDashboard />
      </div>
    </div>
  );
}