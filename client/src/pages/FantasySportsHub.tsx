import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { 
  Trophy, 
  Users, 
  Target, 
  ExternalLink, 
  Settings, 
  BarChart3, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Crown, 
  Maximize2,
  Star,
  Calendar,
  Zap,
  Shield,
  DollarSign,
  Clock
} from "lucide-react";
import { useLocation } from "wouter";
import ESPNLinkCard from "@/components/fantasy/ESPNLinkCard";
import YahooLinkCard from "@/components/fantasy/YahooLinkCard";


const FantasySportsHub: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedSport, setSelectedSport] = useState<string>('nfl');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('both');
  
  const [espnStatus, setEspnStatus] = useState<'loading' | 'connected' | 'disconnected'>('loading');
  const [yahooStatus, setYahooStatus] = useState<'loading' | 'connected' | 'disconnected'>('loading');
  const [espnData, setEspnData] = useState<any>(null);
  const [yahooData, setYahooData] = useState<any>(null);

  // Query ESPN fantasy data
  const { data: espnLeagues, isLoading: espnLoading, error: espnError } = useQuery({
    queryKey: ['/api/espn-fantasy/leagues', selectedSport],
    enabled: !!user && (selectedPlatform === 'espn' || selectedPlatform === 'both')
  });

  // Query Yahoo fantasy data
  const { data: yahooLeagues, isLoading: yahooLoading, error: yahooError } = useQuery({
    queryKey: ['/api/yahoo-fantasy/leagues'],
    enabled: !!user && (selectedPlatform === 'yahoo' || selectedPlatform === 'both')
  });

  // Query unified dashboard data (ESPN + Yahoo combined)
  const { data: unifiedData, isLoading: unifiedLoading } = useQuery({
    queryKey: ['/api/yahoo-fantasy/unified/dashboard'],
    enabled: !!user && selectedPlatform === 'both'
  });

  // Test ESPN Fantasy connection
  const testEspnConnection = async () => {
    try {
      const response = await fetch('/api/espn-fantasy/league/test');
      const data = await response.json();
      if (data.success) {
        setEspnStatus('connected');
        setEspnData(data.data);
      } else {
        setEspnStatus('disconnected');
      }
    } catch (error) {
      setEspnStatus('disconnected');
    }
  };

  // Test Yahoo Fantasy connection
  const testYahooConnection = async () => {
    try {
      const response = await fetch('/api/yahoo-fantasy/leagues');
      const data = await response.json();
      if (data.success) {
        setYahooStatus('connected');
        setYahooData(data);
      } else {
        setYahooStatus('disconnected');
      }
    } catch (error) {
      setYahooStatus('disconnected');
    }
  };

  // Test connections on mount
  useEffect(() => {
    testEspnConnection();
    testYahooConnection();
  }, []);

  // Fetch fantasy overview data
  const { data: fantasyPlayers } = useQuery({
    queryKey: ['/api/fantasy/players'],
    refetchInterval: 30000,
  });
  
  const { data: userTeams } = useQuery({
    queryKey: ['/api/fantasy/teams'],
  });



  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'disconnected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <RefreshCw className="w-5 h-5 text-yellow-500 animate-spin" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'disconnected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  return (
        <div className="min-h-screen bg-gradient-to-br from-green-900 via-blue-900 to-purple-900 p-4">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-white flex items-center justify-center gap-2">
                <Trophy className="h-8 w-8 text-yellow-400" />
                Fantasy Sports Hub
              </h1>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Your unified fantasy sports dashboard connecting ESPN and Yahoo with advanced analytics and betting integration
              </p>
            </div>

            {/* Quick Access Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ESPNLinkCard />
              <YahooLinkCard />
            </div>








      </div>
    </div>
  );
};

export default FantasySportsHub;