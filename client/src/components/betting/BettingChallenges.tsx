import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Bell, Users, Clock, DollarSign, ShieldCheck, Award, Gamepad2 } from "lucide-react";
import BetResultAnimation from "./BetResultAnimation";

// Sample bet challenges data (in a real app, this would come from an API)
const sampleChallenges = [
  {
    id: 1,
    sender: {
      id: 2,
      username: "JohnDoe",
      avatar: null
    },
    game: "League of Legends",
    betType: "Match Winner",
    team1: "T1",
    team2: "DRX",
    odds: { team1: -120, team2: 100 },
    pick: "T1",
    amount: 50,
    currency: "weparlay",
    isVirtual: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    status: "pending"
  },
  {
    id: 2,
    sender: {
      id: 3,
      username: "CryptoKing",
      avatar: null
    },
    game: "Fortnite",
    betType: "Tournament Winner",
    team1: "NRG",
    team2: "FaZe",
    odds: { team1: -150, team2: 130 },
    pick: "FaZe",
    amount: 0.005,
    currency: "btc",
    isVirtual: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    status: "pending"
  },
  {
    id: 3,
    sender: {
      id: 4,
      username: "SportsFan88",
      avatar: null
    },
    game: "NBA 2K",
    betType: "Match Winner",
    team1: "Lakers",
    team2: "Celtics",
    odds: { team1: 110, team2: -130 },
    pick: "Lakers",
    amount: 25,
    currency: "weparlay",
    isVirtual: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    status: "pending"
  }
];

// Previously sent challenges
const sentChallenges = [
  {
    id: 101,
    recipient: {
      id: 5,
      username: "GamerPro",
      avatar: null
    },
    game: "Valorant",
    betType: "Match Winner",
    team1: "Sentinels",
    team2: "100 Thieves",
    odds: { team1: -110, team2: -110 },
    pick: "Sentinels",
    amount: 100,
    currency: "weparlay",
    isVirtual: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    status: "accepted"
  },
  {
    id: 102,
    recipient: {
      id: 6,
      username: "CryptoQueen",
      avatar: null
    },
    game: "CS:GO",
    betType: "Total Kills",
    team1: "Over 45.5",
    team2: "Under 45.5",
    odds: { team1: -115, team2: -105 },
    pick: "Over 45.5",
    amount: 0.01,
    currency: "eth",
    isVirtual: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    status: "pending"
  }
];

// Format bet amount with currency symbol
const formatAmount = (amount: number, currency: string) => {
  switch (currency) {
    case "usd":
      return `$${amount}`;
    case "weparlay":
      return `🎮 ${amount}`;
    case "btc":
      return `₿ ${amount}`;
    case "eth":
      return `Ξ ${amount}`;
    case "sol":
      return `◎ ${amount}`;
    case "wept":
      return `🎯 ${amount}`;
    default:
      return `${amount}`;
  }
};

// Get time elapsed since timestamp
const getTimeElapsed = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  
  if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffMins < 1440) {
    return `${Math.floor(diffMins / 60)}h ago`;
  } else {
    return `${Math.floor(diffMins / 1440)}d ago`;
  }
};

// Component to display a single betting challenge
const ChallengeCard = ({ 
  challenge, 
  type = "received", 
  onAccept, 
  onDecline 
}: { 
  challenge: any; 
  type?: "received" | "sent";
  onAccept?: (id: number) => void;
  onDecline?: (id: number) => void;
}) => {
  return (
    <Card className="mb-4 overflow-hidden border-muted bg-card">
      <CardHeader className="p-4 bg-muted/30">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              {type === "received" ? (
                challenge.sender.avatar ? (
                  <AvatarImage src={challenge.sender.avatar} alt={challenge.sender.username} />
                ) : (
                  <AvatarFallback>{challenge.sender.username.charAt(0).toUpperCase()}</AvatarFallback>
                )
              ) : (
                challenge.recipient.avatar ? (
                  <AvatarImage src={challenge.recipient.avatar} alt={challenge.recipient.username} />
                ) : (
                  <AvatarFallback>{challenge.recipient.username.charAt(0).toUpperCase()}</AvatarFallback>
                )
              )}
            </Avatar>
            <div>
              <CardTitle className="text-base">
                {type === "received" ? challenge.sender.username : challenge.recipient.username}
              </CardTitle>
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                {getTimeElapsed(challenge.timestamp)}
              </div>
            </div>
          </div>
          
          <Badge variant={challenge.isVirtual ? "outline" : "default"} className="ml-auto">
            {challenge.isVirtual ? "Virtual" : "Real Money"}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <Gamepad2 className="h-4 w-4 mr-2 text-primary" />
            <span className="font-medium">{challenge.game}</span>
          </div>
          
          <div className="flex items-center text-sm">
            <Award className="h-4 w-4 mr-2 text-primary" />
            <span>{challenge.betType}: {challenge.team1} vs {challenge.team2}</span>
          </div>
          
          <div className="flex items-center text-sm">
            <DollarSign className="h-4 w-4 mr-2 text-primary" />
            <span>
              {formatAmount(challenge.amount, challenge.currency)} on {challenge.pick} ({challenge.odds.team1 > 0 ? '+' : ''}{challenge.odds.team1})
            </span>
          </div>
        </div>
      </CardContent>
      
      {type === "received" && challenge.status === "pending" && (
        <CardFooter className="p-4 pt-0 flex gap-2">
          <Button 
            onClick={() => onAccept && onAccept(challenge.id)} 
            className="flex-1"
            variant="default"
          >
            Accept
          </Button>
          <Button 
            onClick={() => onDecline && onDecline(challenge.id)} 
            className="flex-1"
            variant="outline"
          >
            Decline
          </Button>
        </CardFooter>
      )}
      
      {challenge.status === "accepted" && (
        <CardFooter className="p-4 pt-0">
          <Badge variant="success" className="w-full flex justify-center py-1">
            Challenge Accepted
          </Badge>
        </CardFooter>
      )}
    </Card>
  );
};

// Main component for betting challenges
const BettingChallenges: React.FC = () => {
  const { toast } = useToast();
  const [receivedChallenges, setReceivedChallenges] = useState(sampleChallenges);
  const [mySentChallenges, setMySentChallenges] = useState(sentChallenges);
  
  // State for bet result animation
  const [showWinAnimation, setShowWinAnimation] = useState(false);
  const [currentBet, setCurrentBet] = useState<any>(null);
  
  // Accept a betting challenge
  const handleAcceptChallenge = (id: number) => {
    setReceivedChallenges(prev => 
      prev.map(challenge => 
        challenge.id === id 
          ? { ...challenge, status: "accepted" } 
          : challenge
      )
    );
    
    // Get the challenge details
    const challenge = receivedChallenges.find(c => c.id === id);
    
    if (challenge) {
      // Show toast notification
      toast({
        title: "Challenge Accepted!",
        description: `You accepted ${challenge.sender.username}'s bet on ${challenge.game}.`,
      });
      
      // For demo purposes: randomly decide if user won or lost 
      const isWin = Math.random() > 0.5;
      
      // Show win animation after a delay
      setTimeout(() => {
        setCurrentBet({
          isWin,
          amount: challenge.amount,
          odds: challenge.odds.team1,
          betType: challenge.betType,
          selection: challenge.pick,
          event: `${challenge.team1} vs ${challenge.team2}`
        });
        setShowWinAnimation(true);
      }, 3000);
    }
  };
  
  // Decline a betting challenge
  const handleDeclineChallenge = (id: number) => {
    setReceivedChallenges(prev => prev.filter(challenge => challenge.id !== id));
    
    toast({
      title: "Challenge Declined",
      description: "You declined the betting challenge."
    });
  };
  
  // Handle closing the win animation
  const handleCloseAnimation = () => {
    setShowWinAnimation(false);
    setCurrentBet(null);
  };

  return (
    <div className="container mx-auto py-8">
      {/* Show win animation if needed */}
      {showWinAnimation && currentBet && (
        <BetResultAnimation
          isWin={currentBet.isWin}
          amount={currentBet.amount}
          odds={currentBet.odds}
          betType={currentBet.betType}
          selection={currentBet.selection}
          event={currentBet.event}
          onClose={handleCloseAnimation}
        />
      )}
      
      <Card>
        <CardHeader className="bg-muted/50">
          <div className="flex items-center">
            <Bell className="h-6 w-6 mr-2 text-primary" />
            <CardTitle>Betting Challenges</CardTitle>
          </div>
          <CardDescription>
            View and respond to betting challenges from other users
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6">
          <Tabs defaultValue="received">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="received" className="relative">
                Received
                {receivedChallenges.filter(c => c.status === "pending").length > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {receivedChallenges.filter(c => c.status === "pending").length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="sent">
                Sent
                {mySentChallenges.filter(c => c.status === "accepted").length > 0 && (
                  <Badge variant="default" className="ml-2">
                    {mySentChallenges.filter(c => c.status === "accepted").length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="received" className="space-y-4">
              {receivedChallenges.length > 0 ? (
                receivedChallenges.map(challenge => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    onAccept={handleAcceptChallenge}
                    onDecline={handleDeclineChallenge}
                  />
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>No betting challenges received yet.</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="sent" className="space-y-4">
              {mySentChallenges.length > 0 ? (
                mySentChallenges.map(challenge => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    type="sent"
                  />
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>You haven't sent any betting challenges yet.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default BettingChallenges;