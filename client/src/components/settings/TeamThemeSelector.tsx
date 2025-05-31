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

  // Group teams by leagues
  const nbaTeams = availableTeams.filter(team => 
    ['Lakers', 'Warriors', 'Celtics', 'Heat', 'Bulls', 'Bucks', 'Nets', 'Knicks'].includes(team)
  );
  
  const nflTeams = availableTeams.filter(team => 
    ['Chiefs', 'Eagles', 'Cowboys', 'Patriots', 'Packers', 'Steelers'].includes(team)
  );
  
  const mlbTeams = availableTeams.filter(team => 
    ['Yankees', 'Dodgers', 'Red Sox', 'Cubs', 'Giants'].includes(team)
  );
  
  const nhlTeams = availableTeams.filter(team => 
    ['Maple Leafs', 'Canadiens', 'Bruins', 'Blackhawks', 'Rangers'].includes(team)
  );
  
  const soccerTeams = availableTeams.filter(team => 
    ['Barcelona', 'Real Madrid', 'Manchester United', 'Liverpool', 'Chelsea'].includes(team)
  );
  
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
              <SelectLabel>NBA</SelectLabel>
              {nbaTeams.map(team => (
                <SelectItem key={team} value={team}>{team}</SelectItem>
              ))}
            </SelectGroup>
            
            <SelectGroup>
              <SelectLabel>NFL</SelectLabel>
              {nflTeams.map(team => (
                <SelectItem key={team} value={team}>{team}</SelectItem>
              ))}
            </SelectGroup>
            
            <SelectGroup>
              <SelectLabel>MLB</SelectLabel>
              {mlbTeams.map(team => (
                <SelectItem key={team} value={team}>{team}</SelectItem>
              ))}
            </SelectGroup>
            
            <SelectGroup>
              <SelectLabel>NHL</SelectLabel>
              {nhlTeams.map(team => (
                <SelectItem key={team} value={team}>{team}</SelectItem>
              ))}
            </SelectGroup>
            
            <SelectGroup>
              <SelectLabel>Soccer</SelectLabel>
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