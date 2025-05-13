import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ArrowUpRight, ArrowDownRight } from "lucide-react";

// Sample player data
const players = [
  { id: 1, name: "Stephen Curry", team: "GSW" },
  { id: 2, name: "LeBron James", team: "LAL" },
  { id: 3, name: "Kevin Durant", team: "PHX" },
  { id: 4, name: "Giannis Antetokounmpo", team: "MIL" }
];

// Sample prop types
const propTypes = [
  { id: 1, name: "Points" },
  { id: 2, name: "Rebounds" },
  { id: 3, name: "Assists" },
  { id: 4, name: "3-Pointers" },
  { id: 5, name: "Steals + Blocks" }
];

// Sample sportsbooks
const sportsbooks = [
  { id: 1, name: "DraftKings", line: 28.5, overOdds: -115, underOdds: -105 },
  { id: 2, name: "FanDuel", line: 28.5, overOdds: -110, underOdds: -110 },
  { id: 3, name: "BetMGM", line: 27.5, overOdds: -130, underOdds: 110 },
  { id: 4, name: "Caesars", line: 28.5, overOdds: -112, underOdds: -108 }
];

// Sample historical performance
const historicalPerformance = [32, 29, 24, 34, 31];

const PlayerPropsTable: React.FC = () => {
  const { toast } = useToast();
  const [selectedPlayer, setSelectedPlayer] = useState<string>("1");
  const [selectedPropType, setSelectedPropType] = useState<string>("1");
  
  const handleAddToBetSlip = (sportsbook: string, side: string, line: number, odds: number) => {
    const player = players.find(p => p.id.toString() === selectedPlayer);
    const propType = propTypes.find(p => p.id.toString() === selectedPropType);
    
    if (player && propType) {
      toast({
        title: "Added to Bet Slip",
        description: `${player.name} ${side} ${line} ${propType.name} (${sportsbook}) at ${odds > 0 ? '+' : ''}${odds}`,
      });
    }
  };
  
  // Calculate average historical performance
  const averagePerformance = historicalPerformance.reduce((a, b) => a + b, 0) / historicalPerformance.length;
  
  return (
    <>
      {/* Player and Prop Selection */}
      <div className="flex space-x-2 mb-4">
        <div className="flex-1">
          <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
            <SelectTrigger>
              <SelectValue placeholder="Select Player" />
            </SelectTrigger>
            <SelectContent>
              {players.map(player => (
                <SelectItem key={player.id} value={player.id.toString()}>
                  {player.name} ({player.team})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Select value={selectedPropType} onValueChange={setSelectedPropType}>
            <SelectTrigger>
              <SelectValue placeholder="Select Prop Type" />
            </SelectTrigger>
            <SelectContent>
              {propTypes.map(propType => (
                <SelectItem key={propType.id} value={propType.id.toString()}>
                  {propType.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Props Table */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden mb-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Sportsbook</TableHead>
              <TableHead className="text-center w-[80px]">Line</TableHead>
              <TableHead className="text-center">Over</TableHead>
              <TableHead className="text-center">Under</TableHead>
              <TableHead className="w-[40px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sportsbooks.map((book) => (
              <TableRow key={book.id}>
                <TableCell className="font-medium">{book.name}</TableCell>
                <TableCell className="text-center">{book.line}</TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center">
                    <span 
                      className={book.id === 1 ? "text-secondary font-medium" : ""}
                      onClick={() => handleAddToBetSlip(book.name, "Over", book.line, book.overOdds)}
                    >
                      {book.overOdds > 0 ? `+${book.overOdds}` : book.overOdds}
                    </span>
                    {book.id === 1 && <ArrowUpRight className="ml-1 h-4 w-4 text-secondary" />}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center">
                    <span 
                      className={book.id === 3 ? "text-secondary font-medium" : ""}
                      onClick={() => handleAddToBetSlip(book.name, "Under", book.line, book.underOdds)}
                    >
                      {book.underOdds > 0 ? `+${book.underOdds}` : book.underOdds}
                    </span>
                    {book.id === 3 && <ArrowDownRight className="ml-1 h-4 w-4 text-secondary" />}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-primary hover:text-primary/80"
                    onClick={() => handleAddToBetSlip(book.name, "Over", book.line, book.overOdds)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Historical Performance */}
      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-medium text-sm">Historical Performance</h4>
          <span className="text-xs text-gray-500 dark:text-gray-400">Last 5 Games</span>
        </div>
        <div className="flex space-x-2">
          {historicalPerformance.map((score, index) => (
            <div 
              key={index} 
              className={`score-badge flex-1 ${score >= 28.5 ? 'bg-secondary text-white' : 'bg-danger text-white'} text-center py-1 px-2 rounded text-sm`}
            >
              {score}
            </div>
          ))}
        </div>
        <div className="text-center text-xs mt-2 text-gray-500 dark:text-gray-400">
          Average: <span className="font-medium text-neutral-dark dark:text-neutral-light">{averagePerformance.toFixed(1)} points</span>
        </div>
      </div>
      
      {/* Best Bet Recommendation */}
      <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
        <h4 className="font-medium text-sm mb-2">Best Bet Recommendation</h4>
        <div className="bg-primary/10 rounded-md p-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Based on historical data and odds</span>
              <div className="font-medium text-primary">
                {averagePerformance >= 28.5 ? 'Over' : 'Under'} 27.5 Points on BetMGM ({averagePerformance >= 28.5 ? '-130' : '+110'})
              </div>
            </div>
            <Button 
              size="sm" 
              onClick={() => handleAddToBetSlip("BetMGM", averagePerformance >= 28.5 ? "Over" : "Under", 27.5, averagePerformance >= 28.5 ? -130 : 110)}
            >
              Add to Slip
            </Button>
          </div>
        </div>
      </div>
      
      {/* Edge Analysis */}
      <div className="mt-4">
        <h4 className="font-medium text-sm mb-2">Edge Analysis</h4>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <p>
            The average performance of {averagePerformance.toFixed(1)} points 
            {averagePerformance > 28.5 
              ? ` is above the standard line of 28.5, suggesting potential value on the Over.`
              : ` is below the standard line of 28.5, suggesting potential value on the Under.`
            }
          </p>
          <p className="mt-1">
            BetMGM offers a lower line at 27.5, which may provide additional edge when betting the
            {averagePerformance > 27.5 ? ' Over.' : ' Under.'}
          </p>
        </div>
      </div>
    </>
  );
};

export default PlayerPropsTable;
