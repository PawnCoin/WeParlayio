import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { TrophyIcon, Users, CalendarDays, Flame, UserPlus, CheckCircle2, DollarSign } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface BettingChallengeProps {
  userId: string;
  userName: string;
  userAvatar?: string;
}

// Example challenge types
const CHALLENGE_TYPES = [
  { id: 'head-to-head', name: 'Head-to-Head', description: 'Challenge a single friend to a betting duel' },
  { id: 'group', name: 'Group Challenge', description: 'Create a betting pool with multiple friends' },
  { id: 'tournament', name: 'Tournament', description: 'Bracket-style competition with multiple rounds' },
  { id: 'season-long', name: 'Season-Long', description: 'Extended challenge for an entire sports season' }
];

// Mock current challenges for display
const MOCK_CURRENT_CHALLENGES = [
  {
    id: 'c1',
    type: 'head-to-head',
    name: 'NBA Finals Showdown',
    creator: { id: 'u1', name: 'Alex', avatar: '' },
    opponent: { id: 'u2', name: 'Jordan', avatar: '' },
    status: 'active',
    endDate: '2025-06-15',
    pot: 100,
    userScore: 3,
    opponentScore: 2
  },
  {
    id: 'c2',
    type: 'group',
    name: 'MLB Regular Season Pool',
    creator: { id: 'u3', name: 'Taylor', avatar: '' },
    members: [
      { id: 'u1', name: 'You', avatar: '', score: 120 },
      { id: 'u3', name: 'Taylor', avatar: '', score: 145 },
      { id: 'u4', name: 'Casey', avatar: '', score: 95 },
      { id: 'u5', name: 'Morgan', avatar: '', score: 130 }
    ],
    status: 'active',
    endDate: '2025-10-05',
    pot: 400
  }
];

// Mock challenge invites
const MOCK_CHALLENGE_INVITES = [
  {
    id: 'i1',
    type: 'head-to-head',
    name: 'UFC Title Fight',
    creator: { id: 'u6', name: 'Riley', avatar: '' },
    status: 'pending',
    endDate: '2025-05-30',
    pot: 50
  },
  {
    id: 'i2',
    type: 'tournament',
    name: 'March Madness Bracket',
    creator: { id: 'u7', name: 'Quinn', avatar: '' },
    status: 'pending',
    endDate: '2025-04-08',
    pot: 200,
    participants: 16
  }
];

const BettingChallenge: React.FC<BettingChallengeProps> = ({ userId, userName, userAvatar }) => {
  const { toast } = useToast();
  const [challengeType, setChallengeType] = useState<string>('head-to-head');
  const [challengeName, setChallengeName] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [betAmount, setBetAmount] = useState<string>('25');
  const [inviteEmails, setInviteEmails] = useState<string>('');
  const [privateChallenge, setPrivateChallenge] = useState<boolean>(true);
  const [selectedSport, setSelectedSport] = useState<string>('basketball_nba');

  // Handle challenge creation
  const handleCreateChallenge = () => {
    if (!challengeName) {
      toast({
        title: "Challenge Name Required",
        description: "Please provide a name for your challenge.",
        variant: "destructive"
      });
      return;
    }

    if (!endDate) {
      toast({
        title: "End Date Required",
        description: "Please select an end date for the challenge.",
        variant: "destructive"
      });
      return;
    }

    // Handle different challenge types
    if (challengeType === 'head-to-head' && !inviteEmails) {
      toast({
        title: "Opponent Required",
        description: "Please enter your opponent's email address.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Challenge Created!",
      description: `Your ${challengeType} challenge "${challengeName}" has been created.`
    });

    // Reset form
    setChallengeName('');
    setEndDate('');
    setBetAmount('25');
    setInviteEmails('');
  };

  // Handle accepting a challenge
  const handleAcceptChallenge = (challenge: any) => {
    toast({
      title: "Challenge Accepted",
      description: `You've joined "${challenge.name}" created by ${challenge.creator.name}.`
    });
  };

  // Handle declining a challenge
  const handleDeclineChallenge = (challenge: any) => {
    toast({
      title: "Challenge Declined",
      description: `You've declined "${challenge.name}" created by ${challenge.creator.name}.`
    });
  };

  // Get leaderboard position text
  const getLeaderboardPosition = (challenge: any) => {
    if (challenge.type === 'head-to-head') {
      return challenge.userScore > challenge.opponentScore 
        ? 'Leading' 
        : challenge.userScore < challenge.opponentScore 
          ? 'Trailing' 
          : 'Tied';
    } else if (challenge.type === 'group') {
      // Sort members by score and find user's position
      const sortedMembers = [...challenge.members].sort((a, b) => b.score - a.score);
      const userIndex = sortedMembers.findIndex(member => member.id === userId);
      return `${userIndex + 1}/${sortedMembers.length}`;
    }
    return 'Active';
  };

  // Get position color for badges
  const getPositionColor = (position: string) => {
    switch(position) {
      case 'Leading': return 'text-green-600';
      case 'Trailing': return 'text-red-600';
      case 'Tied': return 'text-amber-600';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Card className="w-full bg-card text-card-foreground">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <TrophyIcon className="h-5 w-5 text-yellow-500" />
            Betting Challenges
          </CardTitle>

          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                New Challenge
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Create a Betting Challenge</DialogTitle>
                <DialogDescription>
                  Challenge friends to see who has the best sports prediction skills.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-3">
                <div className="grid grid-cols-4 gap-3">
                  <div className="col-span-4">
                    <Label htmlFor="challengeName">Challenge Name</Label>
                    <Input 
                      id="challengeName" 
                      value={challengeName}
                      onChange={(e) => setChallengeName(e.target.value)} 
                      placeholder="E.g., NBA Playoffs Showdown"
                      className="mt-1"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="challengeType">Challenge Type</Label>
                    <Select 
                      value={challengeType} 
                      onValueChange={setChallengeType}
                    >
                      <SelectTrigger id="challengeType" className="mt-1">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {CHALLENGE_TYPES.map(type => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="sport">Sport</Label>
                    <Select 
                      value={selectedSport} 
                      onValueChange={setSelectedSport}
                    >
                      <SelectTrigger id="sport" className="mt-1">
                        <SelectValue placeholder="Select sport" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basketball_nba">NBA</SelectItem>
                        <SelectItem value="basketball_ncaab">NCAAB</SelectItem>
                        <SelectItem value="football_nfl">NFL</SelectItem>
                        <SelectItem value="baseball_mlb">MLB</SelectItem>
                        <SelectItem value="icehockey_nhl">NHL</SelectItem>
                        <SelectItem value="soccer_epl">Premier League</SelectItem>
                        <SelectItem value="boxing_main">Boxing</SelectItem>
                        <SelectItem value="mma_ufc">UFC</SelectItem>
                        <SelectItem value="motorsport_nascar">NASCAR</SelectItem>
                        <SelectItem value="tennis_atp">Tennis (ATP)</SelectItem>
                        <SelectItem value="tennis_wta">Tennis (WTA)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input 
                      id="endDate" 
                      type="date" 
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="betAmount">Entry Amount ($)</Label>
                    <Input 
                      id="betAmount" 
                      type="number" 
                      min="5"
                      value={betAmount}
                      onChange={(e) => setBetAmount(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div className="col-span-4">
                    <Label htmlFor="inviteEmails">
                      {challengeType === 'head-to-head' 
                        ? "Opponent's Email" 
                        : "Invite Friends (comma separated emails)"}
                    </Label>
                    <Input 
                      id="inviteEmails" 
                      value={inviteEmails}
                      onChange={(e) => setInviteEmails(e.target.value)}
                      placeholder="friend@example.com, another@example.com"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button onClick={handleCreateChallenge}>
                  Create Challenge
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <CardDescription>
          Create and join betting challenges with friends to test your prediction skills
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="active">
          <TabsList className="w-full">
            <TabsTrigger value="active" className="flex-1">
              <Flame className="h-4 w-4 mr-2" />
              Active Challenges
            </TabsTrigger>
            <TabsTrigger value="invites" className="flex-1">
              <UserPlus className="h-4 w-4 mr-2" />
              Challenge Invites
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-4 space-y-4">
            {MOCK_CURRENT_CHALLENGES.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <TrophyIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>You don't have any active challenges</p>
                <p className="text-sm mt-1">Create one to get started!</p>
              </div>
            ) : (
              MOCK_CURRENT_CHALLENGES.map(challenge => (
                <Card key={challenge.id} className="overflow-hidden">
                  <div className="bg-muted px-4 py-2 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {challenge.type === 'head-to-head' ? (
                        <Users className="h-4 w-4 text-blue-500" />
                      ) : challenge.type === 'group' ? (
                        <Users className="h-4 w-4 text-green-500" />
                      ) : challenge.type === 'tournament' ? (
                        <TrophyIcon className="h-4 w-4 text-amber-500" />
                      ) : (
                        <CalendarDays className="h-4 w-4 text-purple-500" />
                      )}
                      <span className="font-semibold">{challenge.name}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {challenge.type === 'head-to-head' ? 'Head-to-Head' : 
                       challenge.type === 'group' ? 'Group' :
                       challenge.type === 'tournament' ? 'Tournament' : 'Season-Long'}
                    </Badge>
                  </div>
                  
                  <CardContent className="p-4">
                    {challenge.type === 'head-to-head' && (
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <Avatar className="h-12 w-12 mx-auto">
                              <AvatarImage src={userAvatar} />
                              <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="mt-1 font-medium">You</div>
                            <div className="text-2xl font-bold">{challenge.userScore}</div>
                          </div>
                          
                          <div className="text-muted-foreground">vs</div>
                          
                          <div className="text-center">
                            <Avatar className="h-12 w-12 mx-auto">
                              <AvatarImage src={challenge.opponent?.avatar || ''} />
                              <AvatarFallback>{challenge.opponent?.name.charAt(0) || '?'}</AvatarFallback>
                            </Avatar>
                            <div className="mt-1 font-medium">{challenge.opponent?.name || 'Opponent'}</div>
                            <div className="text-2xl font-bold">{challenge.opponentScore}</div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Status</div>
                          <div className={`font-semibold ${getPositionColor(getLeaderboardPosition(challenge))}`}>
                            {getLeaderboardPosition(challenge)}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">Pot</div>
                          <div className="font-semibold">${challenge.pot}</div>
                        </div>
                      </div>
                    )}
                    
                    {challenge.type === 'group' && (
                      <div>
                        <div className="flex justify-between mb-3">
                          <div>
                            <div className="text-sm text-muted-foreground">Leaderboard</div>
                            <div className={`font-semibold ${getPositionColor(getLeaderboardPosition(challenge))}`}>
                              Position: {getLeaderboardPosition(challenge)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground">Pot</div>
                            <div className="font-semibold">${challenge.pot}</div>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mt-3">
                          {challenge.members?.sort((a, b) => b.score - a.score).map((member, idx) => (
                            <div key={member.id} className="flex justify-between items-center p-2 rounded-md bg-muted/50">
                              <div className="flex items-center gap-2">
                                <div className="w-5 text-center font-semibold text-muted-foreground">
                                  {idx + 1}
                                </div>
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={member.avatar} />
                                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className={member.id === userId ? "font-semibold" : ""}>
                                  {member.id === userId ? "You" : member.name}
                                </span>
                              </div>
                              <div className="font-mono font-medium">{member.score}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                  
                  <CardFooter className="bg-muted/30 px-4 py-2 flex justify-between text-xs text-muted-foreground">
                    <div>Created by: {challenge.creator.name}</div>
                    <div>Ends: {new Date(challenge.endDate).toLocaleDateString()}</div>
                  </CardFooter>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="invites" className="mt-4 space-y-4">
            {MOCK_CHALLENGE_INVITES.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <UserPlus className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No pending challenge invites</p>
                <p className="text-sm mt-1">When friends invite you, they'll appear here</p>
              </div>
            ) : (
              MOCK_CHALLENGE_INVITES.map(invite => (
                <Card key={invite.id} className="overflow-hidden">
                  <div className="bg-muted px-4 py-2 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {invite.type === 'head-to-head' ? (
                        <Users className="h-4 w-4 text-blue-500" />
                      ) : invite.type === 'group' ? (
                        <Users className="h-4 w-4 text-green-500" />
                      ) : invite.type === 'tournament' ? (
                        <TrophyIcon className="h-4 w-4 text-amber-500" />
                      ) : (
                        <CalendarDays className="h-4 w-4 text-purple-500" />
                      )}
                      <span className="font-semibold">{invite.name}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-500">
                      Pending
                    </Badge>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="flex justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={invite.creator.avatar} />
                            <AvatarFallback>{invite.creator.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span>From: <span className="font-medium">{invite.creator.name}</span></span>
                        </div>
                        
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-muted-foreground" />
                            <span>Ends {new Date(invite.endDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span>Entry: ${invite.pot / (invite.participants || 2)}</span>
                          </div>
                          {invite.participants && (
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span>{invite.participants} participants</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Button onClick={() => handleAcceptChallenge(invite)} className="flex-1">
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Accept
                        </Button>
                        <Button variant="outline" onClick={() => handleDeclineChallenge(invite)} className="flex-1">
                          Decline
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default BettingChallenge;