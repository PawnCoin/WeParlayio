import React from 'react';
import { useTeamTheme } from '@/contexts/TeamThemeContext';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const TeamThemeSelector: React.FC = () => {
  const { selectedTeam, setSelectedTeam, availableTeams } = useTeamTheme();

  // Define team lists for each league
  const nbaTeams = [
    'Boston Celtics', 'Los Angeles Lakers', 'Golden State Warriors', 
    'Miami Heat', 'Chicago Bulls', 'Brooklyn Nets', 'Milwaukee Bucks', 
    'New York Knicks', 'Philadelphia 76ers', 'Dallas Mavericks'
  ];
  
  const nflTeams = [
    'Kansas City Chiefs', 'Dallas Cowboys', 'New England Patriots',
    'Green Bay Packers', 'Philadelphia Eagles', 'Pittsburgh Steelers',
    'San Francisco 49ers', 'Buffalo Bills'
  ];
  
  const mlbTeams = [
    'New York Yankees', 'Los Angeles Dodgers', 'Boston Red Sox',
    'Chicago Cubs', 'San Francisco Giants', 'Houston Astros'
  ];
  
  const nhlTeams = [
    'Toronto Maple Leafs', 'Montreal Canadiens', 'Boston Bruins',
    'Chicago Blackhawks', 'New York Rangers', 'Vegas Golden Knights'
  ];
  
  const soccerTeams = [
    'Barcelona', 'Real Madrid', 'Manchester United', 
    'Liverpool', 'Chelsea', 'Arsenal'
  ];
  
  const otherTeams = availableTeams.filter(team => 
    team === 'default'
  );

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="team-theme">Favorite Team Theme</Label>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Personalize WeParlay with your favorite team's colors
        </p>
        
        <Select 
          value={selectedTeam} 
          onValueChange={(value) => setSelectedTeam(value)}
        >
          <SelectTrigger id="team-theme" className="w-full">
            <SelectValue placeholder="Select a team" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>WeParlay</SelectLabel>
              {otherTeams.map(team => (
                <SelectItem key={team} value={team}>
                  {team === 'default' ? 'WeParlay Default' : team}
                </SelectItem>
              ))}
            </SelectGroup>
            
            <SelectGroup>
              <SelectLabel>NBA Teams</SelectLabel>
              {nbaTeams.map(team => (
                <SelectItem key={team} value={team}>{team}</SelectItem>
              ))}
            </SelectGroup>
            
            <SelectGroup>
              <SelectLabel>NFL Teams</SelectLabel>
              {nflTeams.map(team => (
                <SelectItem key={team} value={team}>{team}</SelectItem>
              ))}
            </SelectGroup>
            
            <SelectGroup>
              <SelectLabel>MLB Teams</SelectLabel>
              {mlbTeams.map(team => (
                <SelectItem key={team} value={team}>{team}</SelectItem>
              ))}
            </SelectGroup>
            
            <SelectGroup>
              <SelectLabel>NHL Teams</SelectLabel>
              {nhlTeams.map(team => (
                <SelectItem key={team} value={team}>{team}</SelectItem>
              ))}
            </SelectGroup>
            
            <SelectGroup>
              <SelectLabel>Soccer Teams</SelectLabel>
              {soccerTeams.map(team => (
                <SelectItem key={team} value={team}>{team}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      
      {/* Color preview */}
      {selectedTeam && (
        <div className="mt-4">
          <Label className="mb-2">Theme Preview</Label>
          <div className="flex space-x-2">
            <div 
              className="h-8 w-16 rounded"
              style={{ backgroundColor: 'var(--team-primary)' }}
              title="Primary Color"
            />
            <div 
              className="h-8 w-16 rounded"
              style={{ backgroundColor: 'var(--team-secondary)' }}
              title="Secondary Color"
            />
            <div 
              className="h-8 w-16 rounded"
              style={{ backgroundColor: 'var(--team-accent)' }}
              title="Accent Color"
            />
          </div>
          <div className="flex space-x-2 mt-1">
            <span className="text-xs">Primary</span>
            <span className="text-xs ml-6">Secondary</span>
            <span className="text-xs ml-6">Accent</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamThemeSelector;