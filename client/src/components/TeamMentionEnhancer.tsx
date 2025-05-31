import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

interface TeamData {
  name: string;
  logo: string;
  colors: string[];
  abbreviation: string;
}

interface TeamMentionEnhancerProps {
  children: React.ReactNode;
  className?: string;
}

// Component that automatically enhances any team mentions with ESPN data
export function TeamMentionEnhancer({ children, className = '' }: TeamMentionEnhancerProps) {
  const [enhancedContent, setEnhancedContent] = useState<React.ReactNode>(children);

  // Load ESPN team data
  const { data: espnTeams } = useQuery({
    queryKey: ['/api/espn/teams/football'],
    staleTime: 60 * 60 * 1000, // Cache for 1 hour
  });

  useEffect(() => {
    if (!espnTeams?.success || typeof children !== 'string') {
      setEnhancedContent(children);
      return;
    }

    // Comprehensive team name patterns for ALL major sports teams
    const teamPatterns = [
      // NFL Teams - ALL 32 Teams
      { pattern: /\barizona cardinals?\b/gi, name: 'Arizona Cardinals' },
      { pattern: /\batlanta falcons?\b/gi, name: 'Atlanta Falcons' },
      { pattern: /\bbaltimore ravens?\b/gi, name: 'Baltimore Ravens' },
      { pattern: /\bbuffalo bills?\b/gi, name: 'Buffalo Bills' },
      { pattern: /\bcarolina panthers?\b/gi, name: 'Carolina Panthers' },
      { pattern: /\bchicago bears?\b/gi, name: 'Chicago Bears' },
      { pattern: /\bcincinnati bengals?\b/gi, name: 'Cincinnati Bengals' },
      { pattern: /\bcleveland browns?\b/gi, name: 'Cleveland Browns' },
      { pattern: /\bdallas cowboys?\b/gi, name: 'Dallas Cowboys' },
      { pattern: /\bdenver broncos?\b/gi, name: 'Denver Broncos' },
      { pattern: /\bdetroit lions?\b/gi, name: 'Detroit Lions' },
      { pattern: /\bgreen bay packers?\b/gi, name: 'Green Bay Packers' },
      { pattern: /\bhouston texans?\b/gi, name: 'Houston Texans' },
      { pattern: /\bindianapolis colts?\b/gi, name: 'Indianapolis Colts' },
      { pattern: /\bjacksonville jaguars?\b/gi, name: 'Jacksonville Jaguars' },
      { pattern: /\bkansas city chiefs?\b/gi, name: 'Kansas City Chiefs' },
      { pattern: /\blas vegas raiders?\b/gi, name: 'Las Vegas Raiders' },
      { pattern: /\blos angeles chargers?\b/gi, name: 'Los Angeles Chargers' },
      { pattern: /\blos angeles rams?\b/gi, name: 'Los Angeles Rams' },
      { pattern: /\bmiami dolphins?\b/gi, name: 'Miami Dolphins' },
      { pattern: /\bminnesota vikings?\b/gi, name: 'Minnesota Vikings' },
      { pattern: /\bnew england patriots?\b/gi, name: 'New England Patriots' },
      { pattern: /\bnew orleans saints?\b/gi, name: 'New Orleans Saints' },
      { pattern: /\bnew york giants?\b/gi, name: 'New York Giants' },
      { pattern: /\bnew york jets?\b/gi, name: 'New York Jets' },
      { pattern: /\bphiladelphia eagles?\b/gi, name: 'Philadelphia Eagles' },
      { pattern: /\bpittsburgh steelers?\b/gi, name: 'Pittsburgh Steelers' },
      { pattern: /\bsan francisco 49ers?\b/gi, name: 'San Francisco 49ers' },
      { pattern: /\bseattle seahawks?\b/gi, name: 'Seattle Seahawks' },
      { pattern: /\btampa bay buccaneers?\b/gi, name: 'Tampa Bay Buccaneers' },
      { pattern: /\btennessee titans?\b/gi, name: 'Tennessee Titans' },
      { pattern: /\bwashington commanders?\b/gi, name: 'Washington Commanders' },

      // NBA Teams - ALL 30 Teams
      { pattern: /\batlanta hawks?\b/gi, name: 'Atlanta Hawks' },
      { pattern: /\bboston celtics?\b/gi, name: 'Boston Celtics' },
      { pattern: /\bbrooklyn nets?\b/gi, name: 'Brooklyn Nets' },
      { pattern: /\bcharlotte hornets?\b/gi, name: 'Charlotte Hornets' },
      { pattern: /\bchicago bulls?\b/gi, name: 'Chicago Bulls' },
      { pattern: /\bcleveland cavaliers?\b/gi, name: 'Cleveland Cavaliers' },
      { pattern: /\bdallas mavericks?\b/gi, name: 'Dallas Mavericks' },
      { pattern: /\bdenver nuggets?\b/gi, name: 'Denver Nuggets' },
      { pattern: /\bdetroit pistons?\b/gi, name: 'Detroit Pistons' },
      { pattern: /\bgolden state warriors?\b/gi, name: 'Golden State Warriors' },
      { pattern: /\bhouston rockets?\b/gi, name: 'Houston Rockets' },
      { pattern: /\bindiana pacers?\b/gi, name: 'Indiana Pacers' },
      { pattern: /\blos angeles clippers?\b/gi, name: 'Los Angeles Clippers' },
      { pattern: /\blos angeles lakers?\b/gi, name: 'Los Angeles Lakers' },
      { pattern: /\bmemphis grizzlies?\b/gi, name: 'Memphis Grizzlies' },
      { pattern: /\bmiami heat\b/gi, name: 'Miami Heat' },
      { pattern: /\bmilwaukee bucks?\b/gi, name: 'Milwaukee Bucks' },
      { pattern: /\bminnesota timberwolves?\b/gi, name: 'Minnesota Timberwolves' },
      { pattern: /\bnew orleans pelicans?\b/gi, name: 'New Orleans Pelicans' },
      { pattern: /\bnew york knicks?\b/gi, name: 'New York Knicks' },
      { pattern: /\boklahoma city thunder\b/gi, name: 'Oklahoma City Thunder' },
      { pattern: /\borlando magic\b/gi, name: 'Orlando Magic' },
      { pattern: /\bphiladelphia 76ers?\b/gi, name: 'Philadelphia 76ers' },
      { pattern: /\bphoenix suns?\b/gi, name: 'Phoenix Suns' },
      { pattern: /\bportland trail blazers?\b/gi, name: 'Portland Trail Blazers' },
      { pattern: /\bsacramento kings?\b/gi, name: 'Sacramento Kings' },
      { pattern: /\bsan antonio spurs?\b/gi, name: 'San Antonio Spurs' },
      { pattern: /\btoronto raptors?\b/gi, name: 'Toronto Raptors' },
      { pattern: /\butah jazz\b/gi, name: 'Utah Jazz' },
      { pattern: /\bwashington wizards?\b/gi, name: 'Washington Wizards' },

      // MLB Teams - Major League Baseball
      { pattern: /\blos angeles dodgers?\b/gi, name: 'Los Angeles Dodgers' },
      { pattern: /\bnew york yankees?\b/gi, name: 'New York Yankees' },
      { pattern: /\bboston red sox\b/gi, name: 'Boston Red Sox' },
      { pattern: /\bhouston astros?\b/gi, name: 'Houston Astros' },
      { pattern: /\bchicago cubs?\b/gi, name: 'Chicago Cubs' },
      { pattern: /\bchicago white sox\b/gi, name: 'Chicago White Sox' },
      { pattern: /\bst\\.? louis cardinals?\b/gi, name: 'St. Louis Cardinals' },
      { pattern: /\bsan francisco giants?\b/gi, name: 'San Francisco Giants' },

      // NHL Teams - Major Teams
      { pattern: /\bboston bruins?\b/gi, name: 'Boston Bruins' },
      { pattern: /\bchicago blackhawks?\b/gi, name: 'Chicago Blackhawks' },
      { pattern: /\bdetroit red wings?\b/gi, name: 'Detroit Red Wings' },
      { pattern: /\bnew york rangers?\b/gi, name: 'New York Rangers' },
      { pattern: /\btoronto maple leafs?\b/gi, name: 'Toronto Maple Leafs' },
      { pattern: /\bmontreal canadiens?\b/gi, name: 'Montreal Canadiens' }
    ];

    let processedText = children as string;

    // Process each team pattern
    teamPatterns.forEach(({ pattern, name }) => {
      processedText = processedText.replace(pattern, (match) => {
        return `<span class="team-mention enhanced-team" data-team="${name}" title="Click to view ${name} info">${match}</span>`;
      });
    });

    // Convert enhanced HTML back to React elements
    if (processedText !== children) {
      setEnhancedContent(
        <div 
          dangerouslySetInnerHTML={{ __html: processedText }}
          className={`team-enhanced-content ${className}`}
        />
      );
    } else {
      setEnhancedContent(children);
    }
  }, [children, espnTeams, className]);

  return <>{enhancedContent}</>;
}

// Enhanced team display component with logo
interface EnhancedTeamDisplayProps {
  teamName: string;
  showLogo?: boolean;
  showColors?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function EnhancedTeamDisplay({ 
  teamName, 
  showLogo = true, 
  showColors = false,
  size = 'md' 
}: EnhancedTeamDisplayProps) {
  const { data: teamLogo } = useQuery({
    queryKey: [`/api/espn/team-logo/${encodeURIComponent(teamName)}`],
    enabled: !!teamName && showLogo,
    staleTime: 60 * 60 * 1000,
  });

  const sizeClasses = {
    sm: 'h-4 w-4 text-sm',
    md: 'h-6 w-6 text-base',
    lg: 'h-8 w-8 text-lg'
  };

  const logoClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  };

  return (
    <div className={`inline-flex items-center gap-2 ${sizeClasses[size]}`}>
      {showLogo && teamLogo?.success && teamLogo.logoUrl && (
        <img 
          src={teamLogo.logoUrl}
          alt={`${teamName} logo`}
          className={`${logoClasses[size]} object-contain`}
          loading="lazy"
        />
      )}
      <span className="font-medium">{teamName}</span>
      {showColors && teamLogo?.colors && (
        <div className="flex gap-1">
          {teamLogo.colors.map((color: string, index: number) => (
            <div 
              key={index}
              className="w-3 h-3 rounded-full border border-gray-300"
              style={{ backgroundColor: color }}
              title={`Team color: ${color}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Global team detection hook for use throughout the app
export function useTeamDetection(text: string) {
  const [detectedTeams, setDetectedTeams] = useState<string[]>([]);

  useEffect(() => {
    if (!text) {
      setDetectedTeams([]);
      return;
    }

    const teamNames = [
      'Chicago Bears', 'Green Bay Packers', 'Dallas Cowboys', 'New England Patriots',
      'Pittsburgh Steelers', 'San Francisco 49ers', 'Kansas City Chiefs', 'Buffalo Bills',
      'Los Angeles Lakers', 'Boston Celtics', 'Golden State Warriors', 'Chicago Bulls'
    ];

    const found = teamNames.filter(team => 
      text.toLowerCase().includes(team.toLowerCase())
    );

    setDetectedTeams(found);
  }, [text]);

  return detectedTeams;
}