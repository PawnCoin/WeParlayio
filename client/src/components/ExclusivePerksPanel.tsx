import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Zap, 
  Mic, 
  TrendingUp, 
  Shield, 
  Crown,
  Target,
  Brain,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';

export const ExclusivePerksPanel: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [oddsBoost, setOddsBoost] = useState([2.5]);
  const [isListening, setIsListening] = useState(false);
  const [voiceCommand, setVoiceCommand] = useState('');

  const tierLimits = {
    bronze: { oddsBoost: 2.5, voiceBets: 5, aiSuggestions: 3 },
    silver: { oddsBoost: 5.0, voiceBets: 15, aiSuggestions: 10 },
    gold: { oddsBoost: 7.5, voiceBets: 50, aiSuggestions: 25 },
    platinum: { oddsBoost: 10.0, voiceBets: 'unlimited', aiSuggestions: 'unlimited' }
  };

  const userTier = user?.tier || 'bronze';
  const limits = tierLimits[userTier as keyof typeof tierLimits];

  const applyOddsBoost = async () => {
    try {
      const response = await apiRequest('POST', '/api/perks/odds-boost', {
        boostPercentage: oddsBoost[0]
      });
      
      toast({
        title: "Odds Boost Applied! ⚡",
        description: `${oddsBoost[0]}% boost activated on your next bet`,
      });
    } catch (error: any) {
      toast({
        title: "Boost Failed",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive"
      });
    }
  };

  const startVoiceBetting = async () => {
    setIsListening(true);
    
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = async (event: any) => {
        const command = event.results[0][0].transcript;
        setVoiceCommand(command);
        
        try {
          const response = await apiRequest('POST', '/api/perks/voice-betting', {
            voiceCommand: command,
            confidence: event.results[0][0].confidence
          });
          
          toast({
            title: "Voice Bet Processed! 🎤",
            description: `"${command}" - Bet details processed`,
          });
        } catch (error) {
          toast({
            title: "Voice Processing Failed",
            description: "Please try speaking more clearly",
            variant: "destructive"
          });
        }
        
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
        toast({
          title: "Voice Recognition Error",
          description: "Please check microphone permissions",
          variant: "destructive"
        });
      };

      recognition.start();
    } else {
      toast({
        title: "Voice Not Supported",
        description: "Your browser doesn't support voice recognition",
        variant: "destructive"
      });
      setIsListening(false);
    }
  };

  const getAiSuggestions = async () => {
    try {
      const response = await apiRequest('GET', '/api/ai/betting-suggestions');
      
      toast({
        title: "AI Suggestions Ready! 🤖",
        description: "Check your notifications for personalized betting tips",
      });
    } catch (error) {
      toast({
        title: "AI Suggestions Unavailable",
        description: "Please try again in a moment",
        variant: "destructive"
      });
    }
  };

  const activateInsuranceBet = async () => {
    try {
      const response = await apiRequest('POST', '/api/perks/bet-insurance', {
        coverage: 50 // 50% insurance
      });
      
      toast({
        title: "Bet Insurance Activated! 🛡️",
        description: "Your next bet is 50% insured against losses",
      });
    } catch (error) {
      toast({
        title: "Insurance Unavailable",
        description: "Upgrade your tier for bet insurance",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-purple-600" />
            Exclusive Perks
            <Badge className="bg-purple-600 text-white">{userTier.toUpperCase()}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Odds Boost */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span className="font-medium">Odds Boost</span>
              </div>
              <Badge variant="outline">Max {limits.oddsBoost}%</Badge>
            </div>
            <Slider
              value={oddsBoost}
              onValueChange={setOddsBoost}
              max={limits.oddsBoost}
              min={0.5}
              step={0.5}
              className="w-full"
            />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Boost: {oddsBoost[0]}%
              </span>
              <Button onClick={applyOddsBoost} size="sm">
                Apply Boost
              </Button>
            </div>
          </div>

          {/* Voice Betting */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Voice Betting</span>
              </div>
              <Badge variant="outline">
                {typeof limits.voiceBets === 'string' ? limits.voiceBets : `${limits.voiceBets}/day`}
              </Badge>
            </div>
            <Button 
              onClick={startVoiceBetting}
              disabled={isListening}
              className="w-full"
              variant={isListening ? "secondary" : "default"}
            >
              {isListening ? (
                <>
                  <div className="animate-pulse w-2 h-2 bg-red-500 rounded-full mr-2" />
                  Listening...
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4 mr-2" />
                  Start Voice Betting
                </>
              )}
            </Button>
            {voiceCommand && (
              <div className="text-sm text-muted-foreground">
                Last command: "{voiceCommand}"
              </div>
            )}
          </div>

          {/* AI Suggestions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-green-500" />
                <span className="font-medium">AI Betting Suggestions</span>
              </div>
              <Badge variant="outline">
                {typeof limits.aiSuggestions === 'string' ? limits.aiSuggestions : `${limits.aiSuggestions}/day`}
              </Badge>
            </div>
            <Button onClick={getAiSuggestions} className="w-full" variant="outline">
              <Sparkles className="h-4 w-4 mr-2" />
              Get AI Suggestions
            </Button>
          </div>

          {/* Bet Insurance */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span className="font-medium">Bet Insurance</span>
              </div>
              <Badge variant="outline">
                {userTier === 'bronze' ? 'Upgrade' : '50% Coverage'}
              </Badge>
            </div>
            <Button 
              onClick={activateInsuranceBet} 
              className="w-full" 
              variant="outline"
              disabled={userTier === 'bronze'}
            >
              <Shield className="h-4 w-4 mr-2" />
              Activate Insurance
            </Button>
          </div>

          {/* Premium Analytics */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                <span className="font-medium">Premium Analytics</span>
              </div>
              <Badge variant="outline">Real-time</Badge>
            </div>
            <Button className="w-full" variant="outline">
              <Target className="h-4 w-4 mr-2" />
              View Analytics Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};