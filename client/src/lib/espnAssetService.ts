export class ESPNAssetService {
  private static readonly ESPN_TEAM_LOGO_BASE = 'https://a.espncdn.com/i/teamlogos';
  private static readonly ESPN_PLAYER_BASE = 'https://a.espncdn.com/i/headshots';
  private static readonly ESPN_SPORT_ICONS_BASE = 'https://a.espncdn.com/redesign/assets/img/icons';

  static getTeamLogo(teamName: string, league: string = 'nba'): string {
    const leagueCode = this.getLeagueCode(league);

    if (leagueCode === 'nba') {
      const teamAbbr = this.getNBATeamAbbreviation(teamName);
      return `${this.ESPN_TEAM_LOGO_BASE}/${leagueCode}/500/${teamAbbr}.png`;
    }

    if (leagueCode === 'nfl') {
      const teamAbbr = this.getNFLTeamAbbreviation(teamName);
      return `${this.ESPN_TEAM_LOGO_BASE}/${leagueCode}/500/${teamAbbr}.png`;
    }

    // For other leagues, use team slug
    const teamSlug = teamName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    return `${this.ESPN_TEAM_LOGO_BASE}/${leagueCode}/500/${teamSlug}.png`;
  }

  static getSportIcon(sport: string): string {
    const sportMapping: Record<string, string> = {
      'basketball': 'basketball',
      'football': 'football', 
      'american-football': 'football',
      'soccer': 'soccer',
      'baseball': 'baseball',
      'hockey': 'hockey',
      'tennis': 'tennis',
      'golf': 'golf',
      'boxing': 'boxing',
      'mma': 'mma',
      'nascar': 'nascar',
      'esports': 'esports'
    };

    const mappedSport = sportMapping[sport.toLowerCase()] || sport.toLowerCase();
    return `${this.ESPN_SPORT_ICONS_BASE}/ESPN-icon-${mappedSport}.png`;
  }

  static getPlayerImage(playerName: string, sport: string = 'nba'): string {
    // Use ESPN's generic player headshot that always loads
    return 'https://a.espncdn.com/combiner/i?img=/i/headshots/nophoto.png&w=350&h=254';
  }

  private static getLeagueCode(league: string): string {
    const leagueMapping: Record<string, string> = {
      'basketball': 'nba',
      'nba': 'nba',
      'football': 'nfl',
      'nfl': 'nfl',
      'soccer': 'soccer',
      'mls': 'soccer',
      'baseball': 'mlb',
      'mlb': 'mlb',
      'hockey': 'nhl',
      'nhl': 'nhl',
      'ncaa': 'ncaa',
      'ncaaf': 'ncaa',
      'ncaab': 'ncaa'
    };

    return leagueMapping[league.toLowerCase()] || 'nba';
  }

  private static getNBATeamAbbreviation(teamName: string): string {
    const nbaTeams: Record<string, string> = {
      'Boston Celtics': 'bos',
      'Atlanta Hawks': 'atl', 
      'Cleveland Cavaliers': 'cle',
      'New York Knicks': 'ny',
      'Milwaukee Bucks': 'mil',
      'Miami Heat': 'mia',
      'Philadelphia 76ers': 'phi',
      'Brooklyn Nets': 'bkn',
      'Los Angeles Lakers': 'lal',
      'Golden State Warriors': 'gs',
      'Phoenix Suns': 'phx',
      'Denver Nuggets': 'den',
      'Dallas Mavericks': 'dal',
      'San Antonio Spurs': 'sa',
      'Houston Rockets': 'hou',
      'Memphis Grizzlies': 'mem',
      'New Orleans Pelicans': 'no',
      'Minnesota Timberwolves': 'min',
      'Oklahoma City Thunder': 'okc',
      'Portland Trail Blazers': 'por',
      'Utah Jazz': 'utah',
      'Sacramento Kings': 'sac',
      'Los Angeles Clippers': 'lac',
      'Toronto Raptors': 'tor',
      'Chicago Bulls': 'chi',
      'Detroit Pistons': 'det',
      'Indiana Pacers': 'ind',
      'Washington Wizards': 'wsh',
      'Charlotte Hornets': 'cha',
      'Orlando Magic': 'orl',
      // Also handle abbreviations directly
      'GSW': 'gs',
      'CLE': 'cle',
      'BOS': 'bos',
      'MIL': 'mil',
      'DEN': 'den',
      'LAL': 'lal',
      'PHX': 'phx',
      'PHI': 'phi',
      'DAL': 'dal'
    };

    return nbaTeams[teamName] || teamName.toLowerCase().slice(0, 3);
  }

  private static getNFLTeamAbbreviation(teamName: string): string {
    const nflTeams: Record<string, string> = {
      'Arizona Cardinals': 'ari',
      'Atlanta Falcons': 'atl',
      'Baltimore Ravens': 'bal',
      'Buffalo Bills': 'buf',
      'Carolina Panthers': 'car',
      'Chicago Bears': 'chi',
      'Cincinnati Bengals': 'cin',
      'Cleveland Browns': 'cle',
      'Dallas Cowboys': 'dal',
      'Denver Broncos': 'den',
      'Detroit Lions': 'det',
      'Green Bay Packers': 'gb',
      'Houston Texans': 'hou',
      'Indianapolis Colts': 'ind',
      'Jacksonville Jaguars': 'jax',
      'Kansas City Chiefs': 'kc',
      'Las Vegas Raiders': 'lv',
      'Los Angeles Chargers': 'lac',
      'Los Angeles Rams': 'lar',
      'Miami Dolphins': 'mia',
      'Minnesota Vikings': 'min',
      'New England Patriots': 'ne',
      'New Orleans Saints': 'no',
      'New York Giants': 'nyg',
      'New York Jets': 'nyj',
      'Philadelphia Eagles': 'phi',
      'Pittsburgh Steelers': 'pit',
      'San Francisco 49ers': 'sf',
      'Seattle Seahawks': 'sea',
      'Tampa Bay Buccaneers': 'tb',
      'Tennessee Titans': 'ten',
      'Washington Commanders': 'wsh'
    };

    return nflTeams[teamName] || teamName.toLowerCase().slice(0, 3);
  }

  private static getPlayerESPNId(playerName: string, sport: string): string | null {
    // This would typically require a database lookup or API call
    // For now, return null to use default fallback
    return null;
  }
}