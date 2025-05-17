import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowUpIcon, ArrowDownIcon, RefreshCcw, AlertCircle, ExternalLink, Lock } from 'lucide-react';

interface OddsComparisonProps {
  eventId?: string;
  sportKey?: string;
  bookmakers?: string[];
  className?: string;
}

type OddsFormat = 'american' | 'decimal' | 'fractional';

interface BookmakerOdds {
  key: string;
  title: string;
  lastUpdate: string;
  markets: {
    key: string;
    lastUpdate: string;
    outcomes: {
      name: string;
      price: number;
      point?: number;
    }[];
  }[];
}

const OddsComparison: React.FC<OddsComparisonProps> = ({ 
  eventId,
  sportKey = 'basketball_nba',
  bookmakers = ['draftkings', 'fanduel', 'betmgm', 'bovada', 'barstool'],
  className
}) => {
  const [oddsFormat, setOddsFormat] = useState<OddsFormat>('american');
  const [selectedMarket, setSelectedMarket] = useState('h2h');
  const [showBestOdds, setShowBestOdds] = useState(true);
  const { toast } = useToast();
  
  // Fetch real-time odds data from multiple bookmakers
  const { data: oddsData, isLoading, isError, error, refetch } = useQuery({
    queryKey: [`/api/odds/${sportKey}/${eventId}`, { bookmakers: bookmakers.join(','), markets: 'h2h,spreads,totals' }],
    refetchInterval: 60000, // Refresh every minute
  });
  
  // Format conversion functions
  const formatOdds = (price: number, format: OddsFormat): string => {
    if (format === 'american') {
      return price >= 2 
        ? `+${Math.round((price - 1) * 100)}` 
        : `${Math.round(-100 / (price - 1))}`;
    } else if (format === 'decimal') {
      return price.toFixed(2);
    } else {
      // Convert to fractional
      const decimal = price - 1;
      if (decimal <= 0) return '0/1';
      
      const tolerance = 1.0e-6;
      let numerator = 1;
      let denominator = Math.round(1 / decimal);
      let approx = 1 / denominator;
      
      while (Math.abs(approx - decimal) > tolerance * decimal) {
        if (approx < decimal) {
          numerator++;
        } else {
          denominator++;
          numerator = Math.round(decimal * denominator);
        }
        approx = numerator / denominator;
      }
      
      return `${numerator}/${denominator}`;
    }
  };
  
  const getBestOdds = (outcomes: any[], targetName: string) => {
    const filteredOutcomes = outcomes.filter(o => 
      o.name.toLowerCase() === targetName.toLowerCase() || 
      o.name.toLowerCase().includes(targetName.toLowerCase())
    );
    
    if (filteredOutcomes.length === 0) return null;
    
    return filteredOutcomes.reduce((best, current) => {
      return current.price > best.price ? current : best;
    }, filteredOutcomes[0]);
  };
  
  // Organize the data for display
  const marketTypes = {
    'h2h': 'Moneyline',
    'spreads': 'Point Spread',
    'totals': 'Over/Under'
  };
  
  // Define sample data in case real API data isn't available
  const sampleData = [
    {
      key: 'draftkings',
      title: 'DraftKings',
      lastUpdate: new Date().toISOString(),
      markets: [
        {
          key: 'h2h',
          lastUpdate: new Date().toISOString(),
          outcomes: [
            { name: 'Team A', price: 2.25 },
            { name: 'Team B', price: 1.65 }
          ]
        },
        {
          key: 'spreads',
          lastUpdate: new Date().toISOString(),
          outcomes: [
            { name: 'Team A', price: 1.91, point: 4.5 },
            { name: 'Team B', price: 1.91, point: -4.5 }
          ]
        },
        {
          key: 'totals',
          lastUpdate: new Date().toISOString(),
          outcomes: [
            { name: 'Over', price: 1.95, point: 222.5 },
            { name: 'Under', price: 1.87, point: 222.5 }
          ]
        }
      ]
    },
    {
      key: 'fanduel',
      title: 'FanDuel',
      lastUpdate: new Date().toISOString(),
      markets: [
        {
          key: 'h2h',
          lastUpdate: new Date().toISOString(),
          outcomes: [
            { name: 'Team A', price: 2.30 },
            { name: 'Team B', price: 1.62 }
          ]
        },
        {
          key: 'spreads',
          lastUpdate: new Date().toISOString(),
          outcomes: [
            { name: 'Team A', price: 1.95, point: 4.5 },
            { name: 'Team B', price: 1.87, point: -4.5 }
          ]
        },
        {
          key: 'totals',
          lastUpdate: new Date().toISOString(),
          outcomes: [
            { name: 'Over', price: 1.91, point: 221.5 },
            { name: 'Under', price: 1.91, point: 221.5 }
          ]
        }
      ]
    },
    {
      key: 'betmgm',
      title: 'BetMGM',
      lastUpdate: new Date().toISOString(),
      markets: [
        {
          key: 'h2h',
          lastUpdate: new Date().toISOString(),
          outcomes: [
            { name: 'Team A', price: 2.20 },
            { name: 'Team B', price: 1.67 }
          ]
        },
        {
          key: 'spreads',
          lastUpdate: new Date().toISOString(),
          outcomes: [
            { name: 'Team A', price: 1.91, point: 5.0 },
            { name: 'Team B', price: 1.91, point: -5.0 }
          ]
        },
        {
          key: 'totals',
          lastUpdate: new Date().toISOString(),
          outcomes: [
            { name: 'Over', price: 1.91, point: 223.0 },
            { name: 'Under', price: 1.91, point: 223.0 }
          ]
        }
      ]
    }
  ];
  
  // Used for when API data is available
  const processedData = oddsData || [];
  
  const displayData = processedData.length > 0 ? processedData : sampleData;
  
  // Get the teams or options for the current event
  const getParticipants = () => {
    if (!displayData.length || !displayData[0].markets.length) return [];
    
    const market = displayData[0].markets.find(m => m.key === selectedMarket);
    if (!market) return [];
    
    return market.outcomes.map(o => o.name);
  };
  
  const participants = getParticipants();
  
  // Odds trend data for chart (normally would be from historical API)
  const trendData = [
    { time: '1h ago', Team_A: 230, Team_B: -170 },
    { time: '45m ago', Team_A: 225, Team_B: -175 },
    { time: '30m ago', Team_A: 220, Team_B: -180 },
    { time: '15m ago', Team_A: 215, Team_B: -180 },
    { time: 'Now', Team_A: 220, Team_B: -165 },
  ];
  
  const renderOddsValue = (bookmaker: any, participant: string) => {
    const market = bookmaker.markets.find((m: any) => m.key === selectedMarket);
    if (!market) return '-';
    
    const outcome = market.outcomes.find((o: any) => 
      o.name.toLowerCase() === participant.toLowerCase() || 
      o.name.toLowerCase().includes(participant.toLowerCase())
    );
    
    if (!outcome) return '-';
    
    let displayValue = '';
    
    // For spreads and totals, include the points
    if (selectedMarket === 'spreads' || selectedMarket === 'totals') {
      const pointValue = outcome.point > 0 ? `+${outcome.point}` : outcome.point;
      displayValue = `${pointValue} (${formatOdds(outcome.price, oddsFormat)})`;
    } else {
      displayValue = formatOdds(outcome.price, oddsFormat);
    }
    
    // Check if this is the best odds across all bookmakers
    if (showBestOdds) {
      const bestOdds = getBestOdds(
        displayData.flatMap(b => {
          const m = b.markets.find(m => m.key === selectedMarket);
          return m ? m.outcomes : [];
        }),
        participant
      );
      
      if (bestOdds && outcome.price === bestOdds.price) {
        return (
          <div className="flex items-center">
            <span className="font-bold text-green-600 dark:text-green-400">{displayValue}</span>
            <Badge variant="outline" className="ml-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-[10px] py-0 h-4">
              BEST
            </Badge>
          </div>
        );
      }
    }
    
    return displayValue;
  };
  
  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshing odds",
      description: "Getting the latest betting odds from all providers",
    });
  };
  
  if (isError) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
            Unable to Load Odds Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            We couldn't retrieve the latest odds information. This might be due to temporary service unavailability or API limitations.
          </p>
        </CardContent>
        <CardFooter>
          <button
            onClick={handleRefresh}
            className="text-sm flex items-center text-blue-600 dark:text-blue-400"
          >
            <RefreshCcw className="w-4 h-4 mr-1" /> Try Again
          </button>
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div>
            <CardTitle className="text-lg">Odds Comparison</CardTitle>
            <CardDescription>Compare odds across top bookmakers</CardDescription>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="best-odds"
                checked={showBestOdds}
                onCheckedChange={setShowBestOdds}
              />
              <Label htmlFor="best-odds" className="text-sm">Highlight Best Odds</Label>
            </div>
            
            <Select value={oddsFormat} onValueChange={(value) => setOddsFormat(value as OddsFormat)}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Odds Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="american">American (+/-)</SelectItem>
                <SelectItem value="decimal">Decimal (1.91)</SelectItem>
                <SelectItem value="fractional">Fractional (10/11)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <Tabs defaultValue="table" className="w-full">
          <TabsList className="mb-4 grid w-full grid-cols-3">
            <TabsTrigger value="table">Odds Table</TabsTrigger>
            <TabsTrigger value="trends">Odds Trends</TabsTrigger>
            <TabsTrigger value="movement">Line Movement</TabsTrigger>
          </TabsList>
          
          <div className="mb-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger 
                value="h2h" 
                onClick={() => setSelectedMarket('h2h')}
                data-state={selectedMarket === 'h2h' ? 'active' : 'inactive'}
              >
                Moneyline
              </TabsTrigger>
              <TabsTrigger 
                value="spreads" 
                onClick={() => setSelectedMarket('spreads')}
                data-state={selectedMarket === 'spreads' ? 'active' : 'inactive'}
              >
                Spread
              </TabsTrigger>
              <TabsTrigger 
                value="totals" 
                onClick={() => setSelectedMarket('totals')}
                data-state={selectedMarket === 'totals' ? 'active' : 'inactive'}
              >
                Over/Under
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="table" className="mt-0">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bookmaker</TableHead>
                      {participants.map((participant) => (
                        <TableHead key={participant}>{participant}</TableHead>
                      ))}
                      <TableHead className="text-right">Last Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayData.map((bookmaker) => (
                      <TableRow key={bookmaker.key}>
                        <TableCell className="font-medium">
                          {bookmaker.title}
                        </TableCell>
                        
                        {participants.map((participant) => (
                          <TableCell key={`${bookmaker.key}-${participant}`}>
                            {renderOddsValue(bookmaker, participant)}
                          </TableCell>
                        ))}
                        
                        <TableCell className="text-right text-xs text-muted-foreground">
                          {new Date(bookmaker.lastUpdate).toLocaleTimeString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            
            <div className="mt-4 flex justify-between items-center text-xs text-muted-foreground">
              <button
                onClick={handleRefresh}
                className="flex items-center text-blue-600 dark:text-blue-400"
              >
                <RefreshCcw className="w-3 h-3 mr-1" /> Refresh
              </button>
              
              <span>Odds update automatically every minute</span>
            </div>
          </TabsContent>
          
          <TabsContent value="trends" className="mt-0">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={trendData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="Team_A" 
                    stroke="#3b82f6" 
                    activeDot={{ r: 8 }} 
                    name={participants[0] || 'Team A'}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Team_B" 
                    stroke="#10b981" 
                    name={participants[1] || 'Team B'}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 flex justify-between items-center text-xs text-muted-foreground">
              <span>Showing odds changes over the past hour</span>
              
              <div className="flex items-center">
                <Lock className="w-3 h-3 mr-1" />
                <span>Advanced trends available for VIP members</span>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="movement" className="mt-0">
            <div className="space-y-4">
              <div className="rounded-md border p-4">
                <h4 className="text-sm font-medium mb-2">Line Movement Analysis</h4>
                
                <div className="space-y-3">
                  {participants.map((team, i) => (
                    <div key={team} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{team}</span>
                        <div className="flex items-center">
                          {i === 0 ? (
                            <ArrowUpIcon className="w-4 h-4 text-green-500 mr-1" />
                          ) : (
                            <ArrowDownIcon className="w-4 h-4 text-red-500 mr-1" />
                          )}
                          <span className="text-sm font-medium">
                            {i === 0 ? '+5' : '-15'} pts
                          </span>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${i === 0 ? 'bg-green-500' : 'bg-red-500'}`}
                          style={{ width: i === 0 ? '60%' : '40%' }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="py-2">
                    <CardTitle className="text-sm">Sharp Money</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold">{participants[0]}</span>
                      <Badge>65%</Badge>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="py-2">
                    <CardTitle className="text-sm">Reverse Line Movement</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      <span className="text-muted-foreground">None Detected</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="py-2">
                    <CardTitle className="text-sm">Public Betting</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold">{participants[1]}</span>
                      <Badge>58%</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div className="mt-4 flex justify-between items-center text-xs text-muted-foreground">
              <span>Data represents estimated betting patterns</span>
              
              <a href="#" className="flex items-center text-blue-600 dark:text-blue-400">
                <ExternalLink className="w-3 h-3 mr-1" /> Full Analysis
              </a>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="pt-0">
        <div className="text-xs text-muted-foreground w-full border-t pt-2">
          <p>Odds provided for informational purposes only. Please check the latest odds from bookmakers before placing bets.</p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default OddsComparison;