import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Users, Trophy, Clock, DollarSign, Plus, CheckCircle, XCircle, AlertCircle, LockKeyhole, MessageCircle, RotateCcw } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface GameEvent {
  id: string;
  sport: string;
  homeTeam: { name: string; logo?: string };
  awayTeam: { name: string; logo?: string };
  startTime: string;
  status: string;
}

interface P2pChallenge {
  id: string;
  challengerId: string;
  challengeeId?: string;
  eventId: string;
  gameDetails: {
    homeTeam: string;
    awayTeam: string;
    startTime: string;
    sport: string;
  };
  challengerPick: string;
  challengeePick?: string;
  betAmount: number;
  currency: string;
  totalPot: number;
  status: string;
  isPublic: boolean;
  challengeMessage?: string;
  expiresAt: string;
  createdAt: string;
  challengerUsername?: string;
  challengeeUsername?: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'open': return 'bg-blue-500';
    case 'accepted': return 'bg-green-500';
    case 'pending_settlement': return 'bg-yellow-500';
    case 'settled': return 'bg-purple-500';
    case 'cancelled': return 'bg-gray-500';
    case 'expired': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

const formatTimeRemaining = (expiresAt: string) => {
  const timeLeft = new Date(expiresAt).getTime() - Date.now();
  if (timeLeft <= 0) return 'Expired';
  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
};

const P2pBetting = () => {
  const [selectedTab, setSelectedTab] = useState('available');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [category, setCategory] = useState('All');
  const [selectedGame, setSelectedGame] = useState<GameEvent | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch available games for betting
  const { data: gamesData } = useQuery({
    queryKey: ['/api/unified-sports/upcoming-events'],
    refetchInterval: 180000, // Update every 3 minutes
  });

  // Fetch available challenges
  const { data: availableChallenges, isLoading: loadingAvailable } = useQuery({
    queryKey: ['/api/p2p-betting/challenges/available'],
  });

  // Fetch user's challenges
  const { data: myChallenges, isLoading: loadingMine } = useQuery({
    queryKey: ['/api/p2p-betting/challenges/mine'],
  });

  // Fetch user's P2P stats
  const { data: p2pStats } = useQuery({
    queryKey: ['/api/p2p-betting/stats'],
  });

  // Create challenge mutation
  const createChallengeMutation = useMutation({
    mutationFn: async (challengeData: any) => {
      return apiRequest('POST', '/api/p2p-betting/challenges/create', challengeData);
    },
    onSuccess: () => {
      toast({
        title: 'Challenge Created!',
        description: 'Your challenge has been posted and funds deposited to escrow.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/p2p-betting/challenges/available'] });
      queryClient.invalidateQueries({ queryKey: ['/api/p2p-betting/challenges/mine'] });
      setShowCreateDialog(false);
      setSelectedGame(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to Create Challenge',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Accept challenge mutation
  const acceptChallengeMutation = useMutation({
    mutationFn: async ({ challengeId, challengeePick }: { challengeId: string; challengeePick: string }) => {
      return apiRequest('POST', `/api/p2p-betting/challenges/${challengeId}/accept`, { challengeePick });
    },
    onSuccess: () => {
      toast({
        title: 'Challenge Accepted!',
        description: 'Your funds have been deposited to escrow. Good luck!',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/p2p-betting/challenges/available'] });
      queryClient.invalidateQueries({ queryKey: ['/api/p2p-betting/challenges/mine'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to Accept Challenge',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    },
  });

  const games = (gamesData as any)?.data || [];
  const challenges = (availableChallenges as any)?.challenges || [];
  const categories = ['All', ...Array.from(new Set(challenges.map((item: P2pChallenge) => item.gameDetails?.sport).filter(Boolean))) as string[]];
  const visibleChallenges = category === 'All' ? challenges : challenges.filter((item: P2pChallenge) => item.gameDetails?.sport === category);
  const userChallenges = (myChallenges as any)?.challenges || [];
  const stats = (p2pStats as any)?.stats || {
    totalChallenges: 0,
    wonChallenges: 0,
    totalWinnings: 0,
    winRate: 0,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Custom Bet Rooms</h1>
        <p className="text-muted-foreground">User-to-user and user-to-group challenges using WeParlay Cash. No house betting outside the daily tournament.</p>
      </div>

      <div className="mb-6 grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border bg-card p-4"><LockKeyhole className="mb-2 h-5 w-5 text-emerald-500" /><div className="font-bold">Stake first</div><p className="text-xs text-muted-foreground">Funds are reserved before a room is published or joined.</p></div>
        <div className="rounded-xl border bg-card p-4"><RotateCcw className="mb-2 h-5 w-5 text-blue-500" /><div className="font-bold">Automatic refund</div><p className="text-xs text-muted-foreground">An open bet that reaches its join deadline is closed and refunded.</p></div>
        <div className="rounded-xl border bg-card p-4"><MessageCircle className="mb-2 h-5 w-5 text-amber-500" /><div className="font-bold">Pre-bet chat</div><p className="text-xs text-muted-foreground">Room messages are capped at 200 characters and close when the bet starts.</p></div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="flex items-center p-4">
            <Trophy className="h-8 w-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-sm font-medium">Total Challenges</p>
              <p className="text-2xl font-bold">{stats.totalChallenges}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-4">
            <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm font-medium">Won</p>
              <p className="text-2xl font-bold">{stats.wonChallenges}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-4">
            <DollarSign className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm font-medium">Total Winnings</p>
              <p className="text-2xl font-bold">${stats.totalWinnings}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-4">
            <Users className="h-8 w-8 text-purple-500 mr-3" />
            <div>
              <p className="text-sm font-medium">Win Rate</p>
              <p className="text-2xl font-bold">{(stats.winRate * 100).toFixed(1)}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="available">Available Challenges</TabsTrigger>
            <TabsTrigger value="mine">My Challenges</TabsTrigger>
          </TabsList>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Challenge
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New P2P Challenge</DialogTitle>
              </DialogHeader>
              <CreateChallengeForm 
                games={games}
                onSubmit={(data) => createChallengeMutation.mutate(data)}
                isLoading={createChallengeMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>

        <TabsContent value="available">
          <div className="mb-4 flex flex-wrap gap-2">
            {categories.map(room => <Button key={room} size="sm" variant={category === room ? 'default' : 'outline'} onClick={() => setCategory(room)}>{room}</Button>)}
          </div>
          <div className="space-y-4">
            {loadingAvailable ? (
              <div className="text-center py-8">Loading available challenges...</div>
            ) : challenges.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Available Challenges</h3>
                  <p className="text-muted-foreground mb-4">Be the first to create a challenge!</p>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Challenge
                  </Button>
                </CardContent>
              </Card>
            ) : (
              visibleChallenges.map((challenge: P2pChallenge) => (
                <ChallengeCard 
                  key={challenge.id}
                  challenge={challenge}
                  isOwn={false}
                  onAccept={(challengeId, pick) => acceptChallengeMutation.mutate({ challengeId, challengeePick: pick })}
                  acceptLoading={acceptChallengeMutation.isPending}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="mine">
          <div className="space-y-4">
            {loadingMine ? (
              <div className="text-center py-8">Loading your challenges...</div>
            ) : userChallenges.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Challenges Yet</h3>
                  <p className="text-muted-foreground mb-4">Create your first challenge to get started!</p>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Challenge
                  </Button>
                </CardContent>
              </Card>
            ) : (
              userChallenges.map((challenge: P2pChallenge) => (
                <ChallengeCard 
                  key={challenge.id}
                  challenge={challenge}
                  isOwn={true}
                  onAccept={() => {}}
                  acceptLoading={false}
                />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface CreateChallengeFormProps {
  games: GameEvent[];
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

const CreateChallengeForm = ({ games, onSubmit, isLoading }: CreateChallengeFormProps) => {
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const [selectedGame, setSelectedGame] = useState<GameEvent | null>(null);
  const [pick, setPick] = useState('');
  const [amount, setAmount] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGame || !pick || !amount) return;

    onSubmit({
      idempotencyKey,
      eventId: selectedGame.id,
      gameDetails: {
        homeTeam: selectedGame.homeTeam.name,
        awayTeam: selectedGame.awayTeam.name,
        startTime: selectedGame.startTime,
        sport: selectedGame.sport,
      },
      challengerPick: pick,
      betAmount: parseFloat(amount),
      currency: 'weparlay_cash',
      isPublic,
      challengeMessage: message || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="game">Select Game</Label>
        <Select onValueChange={(gameId) => {
          const game = games.find(g => g.id === gameId);
          setSelectedGame(game || null);
          setPick(''); // Reset pick when game changes
        }}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a game to bet on" />
          </SelectTrigger>
          <SelectContent>
            {games.slice(0, 20).map((game) => (
              <SelectItem key={game.id} value={game.id}>
                {game.homeTeam.name} vs {game.awayTeam.name} - {game.sport}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedGame && (
        <div>
          <Label htmlFor="pick">Your Pick</Label>
          <Select onValueChange={setPick}>
            <SelectTrigger>
              <SelectValue placeholder="Choose your team" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={selectedGame.homeTeam.name}>
                {selectedGame.homeTeam.name} (Home)
              </SelectItem>
              <SelectItem value={selectedGame.awayTeam.name}>
                {selectedGame.awayTeam.name} (Away)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <Label htmlFor="amount">Bet Amount (WeParlay Cash)</Label>
        <Input
          id="amount"
          type="number"
          min="1"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter bet amount"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch id="public" checked={isPublic} onCheckedChange={setIsPublic} />
        <Label htmlFor="public">Public Challenge (anyone can accept)</Label>
      </div>

      <div>
        <Label htmlFor="message">Challenge Message (Optional)</Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, 200))}
          placeholder="Add a message to your challenge..."
          rows={3}
          maxLength={200}
        />
        <div className="mt-1 text-right text-xs text-muted-foreground">{message.length}/200</div>
      </div>

      <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm">
        <strong>{amount ? `${amount} WeParlay Cash` : 'Your stake'} will be reserved immediately.</strong> It returns automatically if nobody accepts before the join deadline.
      </div>

      <Button type="submit" disabled={!selectedGame || !pick || !amount || isLoading} className="w-full">
        {isLoading ? 'Creating...' : `Create Challenge for $${amount || '0'}`}
      </Button>
    </form>
  );
};

interface ChallengeCardProps {
  challenge: P2pChallenge;
  isOwn: boolean;
  onAccept: (challengeId: string, pick: string) => void;
  acceptLoading: boolean;
}

const ChallengeCard = ({ challenge, isOwn, onAccept, acceptLoading }: ChallengeCardProps) => {
  const [selectedPick, setSelectedPick] = useState('');
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);

  const isExpired = new Date(challenge.expiresAt) <= new Date();
  const canAccept = challenge.status === 'open' && !isExpired && !isOwn;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <Clock className="h-4 w-4" />;
      case 'accepted': return <CheckCircle className="h-4 w-4" />;
      case 'settled': return <Trophy className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const handleAccept = () => {
    if (selectedPick) {
      onAccept(challenge.id, selectedPick);
      setShowAcceptDialog(false);
      setSelectedPick('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">
              {challenge.gameDetails.homeTeam} vs {challenge.gameDetails.awayTeam}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {challenge.gameDetails.sport} • {new Date(challenge.gameDetails.startTime).toLocaleDateString()}
            </p>
          </div>
          <Badge className={getStatusColor(challenge.status)}>
            {getStatusIcon(challenge.status)}
            <span className="ml-1 capitalize">{challenge.status}</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Challenger Picks</p>
              <p className="text-lg">{challenge.challengerPick}</p>
              {challenge.challengerUsername && (
                <p className="text-xs text-muted-foreground">by {challenge.challengerUsername}</p>
              )}
            </div>
            <div>
              <p className="text-sm font-medium">Bet Amount</p>
              <p className="text-lg font-bold">${challenge.betAmount}</p>
              <p className="text-xs text-muted-foreground">Total Pot: ${challenge.totalPot}</p>
            </div>
          </div>

          {challenge.challengeMessage && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm italic">"{challenge.challengeMessage}"</p>
            </div>
          )}

          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>Join deadline: {challenge.expiresAt ? formatTimeRemaining(challenge.expiresAt) : 'No expiration'}</span>
            <span>{challenge.isPublic ? `Open ${challenge.gameDetails.sport} room` : 'Private room'}</span>
          </div>

          {challenge.status === 'open' && <PreBetChat challengeId={challenge.id} />}

          {canAccept && (
            <Dialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  Accept Challenge - ${challenge.betAmount}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Accept Challenge</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold">{challenge.gameDetails.homeTeam} vs {challenge.gameDetails.awayTeam}</h4>
                    <p className="text-sm text-muted-foreground">
                      Challenger picked: {challenge.challengerPick}
                    </p>
                    <p className="text-sm">Bet Amount: ${challenge.betAmount}</p>
                  </div>
                  
                  <div>
                    <Label>Choose Your Pick</Label>
                    <Select onValueChange={setSelectedPick}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your team" />
                      </SelectTrigger>
                      <SelectContent>
                        {challenge.challengerPick !== challenge.gameDetails.homeTeam && (
                          <SelectItem value={challenge.gameDetails.homeTeam}>
                            {challenge.gameDetails.homeTeam}
                          </SelectItem>
                        )}
                        {challenge.challengerPick !== challenge.gameDetails.awayTeam && (
                          <SelectItem value={challenge.gameDetails.awayTeam}>
                            {challenge.gameDetails.awayTeam}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button 
                    onClick={handleAccept} 
                    disabled={!selectedPick || acceptLoading}
                    className="w-full"
                  >
                    {acceptLoading ? 'Accepting...' : `Accept Challenge - ${selectedPick}`}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {isExpired && challenge.status === 'open' && (
            <div className="text-center py-2 text-red-500 text-sm">
              This challenge has expired
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const PreBetChat = ({ challengeId }: { challengeId: string }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const detailsKey = ['/api/p2p-betting/challenges', challengeId];
  const { data } = useQuery<any>({
    queryKey: detailsKey,
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/p2p-betting/challenges/${challengeId}`);
      return response.json();
    },
    enabled: open,
    refetchInterval: open ? 10_000 : false,
  });
  const send = useMutation({
    mutationFn: () => apiRequest('POST', `/api/p2p-betting/challenges/${challengeId}/chat`, { message }),
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: detailsKey });
    },
    onError: (error: Error) => toast({ title: 'Message not sent', description: error.message, variant: 'destructive' }),
  });
  const messages = (data?.activity || []).filter((item: any) => item.activityType === 'pre_bet_chat');

  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild><Button variant="outline" size="sm" className="w-full"><MessageCircle className="mr-2 h-4 w-4" />Pre-bet chat</Button></DialogTrigger>
    <DialogContent><DialogHeader><DialogTitle>Bet room chat</DialogTitle></DialogHeader>
      <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border p-3">
        {messages.length ? messages.map((item: any) => <div key={item.id} className="rounded-lg bg-muted p-2 text-sm"><strong>{item.metadata?.username || 'User'}:</strong> {item.message}</div>) : <p className="text-sm text-muted-foreground">No messages yet. Keep it friendly and focused on the bet.</p>}
      </div>
      <Textarea value={message} maxLength={200} rows={3} onChange={(event) => setMessage(event.target.value.slice(0, 200))} placeholder="Message this bet room…" />
      <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">{message.length}/200</span><Button onClick={() => send.mutate()} disabled={!message.trim() || send.isPending}>Send</Button></div>
    </DialogContent>
  </Dialog>;
};

export default P2pBetting;
