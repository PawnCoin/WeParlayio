import React, { useState } from 'react';
import { useBetSlip, SavedBetSlip } from '@/contexts/BetSlipContext';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bookmark, Clock, Trash2, Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const SavedBetSlips: React.FC = () => {
  const { savedBetSlips, loadSavedBetSlip, deleteSavedBetSlip } = useBetSlip();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSlip, setSelectedSlip] = useState<SavedBetSlip | null>(null);

  // Filter saved slips based on search term
  const filteredSlips = savedBetSlips.filter(slip => 
    slip.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort by most recent first
  const sortedSlips = [...filteredSlips].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleLoadSlip = (id: string) => {
    loadSavedBetSlip(id);
  };

  const handleDeleteSlip = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteSavedBetSlip(id);
  };

  const formatDate = (date: Date) => {
    return format(new Date(date), 'MMM d, yyyy');
  };

  const formatOdds = (odds: number) => {
    return odds > 0 ? `+${odds}` : odds.toString();
  };

  const calculateBetType = (slip: SavedBetSlip): string => {
    return slip.bets.length > 1 ? 'Parlay' : 'Single';
  };

  const getMainSport = (slip: SavedBetSlip): string => {
    const sportCounts: Record<number, number> = {};
    
    slip.bets.forEach(bet => {
      sportCounts[bet.sportId] = (sportCounts[bet.sportId] || 0) + 1;
    });
    
    // Find the most common sport
    let maxCount = 0;
    let mainSportId = 0;
    
    Object.entries(sportCounts).forEach(([sportId, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mainSportId = Number(sportId);
      }
    });
    
    // Map sportId to sport name
    const sportMap: Record<number, string> = {
      1: 'Basketball',
      2: 'Football',
      3: 'Baseball',
      4: 'Hockey',
      5: 'Soccer',
      6: 'Tennis',
      7: 'MMA/UFC',
      8: 'Boxing',
      9: 'NASCAR',
      10: 'Golf',
      // Add more sports as needed
    };
    
    return sportMap[mainSportId] || 'Mixed';
  };

  const viewSlipDetails = (slip: SavedBetSlip) => {
    setSelectedSlip(slip);
  };

  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <Bookmark className="mr-2 h-5 w-5 text-primary" />
              Saved Bet Slips
            </CardTitle>
          </div>
          <CardDescription>
            Load your previously saved bet slips
          </CardDescription>
          <div className="relative mt-2">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search saved slips..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent>
          {sortedSlips.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? (
                <p>No saved bet slips matching "{searchTerm}"</p>
              ) : (
                <div>
                  <p>You haven't saved any bet slips yet</p>
                  <p className="text-sm mt-2">Save your bet slips for quick access later</p>
                </div>
              )}
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {sortedSlips.map((slip) => (
                  <div
                    key={slip.id}
                    className="border rounded-lg p-3 cursor-pointer hover:border-primary transition-colors"
                    onClick={() => viewSlipDetails(slip)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{slip.name}</h3>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDate(slip.createdAt)}
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Badge variant="outline" className="text-xs">
                          {calculateBetType(slip)}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {getMainSport(slip)}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-2 text-sm">
                      <p className="text-muted-foreground">{slip.bets.length} selection{slip.bets.length !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="flex justify-end mt-2 space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLoadSlip(slip.id);
                        }}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Load
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={(e) => handleDeleteSlip(slip.id, e)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Bet Slip Details Dialog */}
      <Dialog open={!!selectedSlip} onOpenChange={(open) => !open && setSelectedSlip(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedSlip?.name}</DialogTitle>
            <DialogDescription>
              Created on {selectedSlip && formatDate(selectedSlip.createdAt)}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Tabs defaultValue="selections">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="selections">Selections</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>
              <TabsContent value="selections" className="mt-4">
                <ScrollArea className="h-[300px] pr-2">
                  {selectedSlip?.bets.map((bet) => (
                    <div
                      key={bet.id}
                      className="border border-muted rounded-md p-3 mb-2"
                    >
                      <div className="font-medium">{bet.pick}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {bet.homeTeam} vs {bet.awayTeam}
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <div className="text-xs">
                          {bet.betType === 'moneyline' ? (
                            <span>Moneyline</span>
                          ) : bet.betType === 'spread' ? (
                            <span>Spread {bet.point && (bet.point > 0 ? '+' : '')}{bet.point}</span>
                          ) : (
                            <span>{bet.pick.includes("O/U") ? "Total" : bet.pick} {bet.point}</span>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {formatOdds(bet.odds)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </TabsContent>
              <TabsContent value="details" className="mt-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium">Type</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedSlip && calculateBetType(selectedSlip)}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Sport</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedSlip && getMainSport(selectedSlip)}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Number of Selections</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedSlip?.bets.length} selection{selectedSlip?.bets.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <DialogFooter className="flex justify-between">
            <Button
              variant="ghost"
              onClick={() => setSelectedSlip(null)}
              className="text-muted-foreground"
            >
              Close
            </Button>
            <div className="space-x-2">
              <Button
                variant="destructive"
                onClick={() => {
                  if (selectedSlip) {
                    deleteSavedBetSlip(selectedSlip.id);
                    setSelectedSlip(null);
                  }
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
              <Button
                onClick={() => {
                  if (selectedSlip) {
                    loadSavedBetSlip(selectedSlip.id);
                    setSelectedSlip(null);
                  }
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                Load Bet Slip
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SavedBetSlips;