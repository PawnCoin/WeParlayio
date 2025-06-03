// Authentic ESPN League Logos for Professional Sports
export const getLeagueLogo = (leagueKey: string): string => {
  const leagueLogos: { [key: string]: string } = {
    // Major Professional Leagues - ESPN CDN
    'americanfootball_nfl': 'https://a.espncdn.com/i/teamlogos/leagues/500/nfl.png',
    'basketball_nba': 'https://a.espncdn.com/i/teamlogos/leagues/500/nba.png',
    'baseball_mlb': 'https://a.espncdn.com/i/teamlogos/leagues/500/mlb.png',
    'icehockey_nhl': 'https://a.espncdn.com/i/teamlogos/leagues/500/nhl.png',
    'soccer_usa_mls': 'https://a.espncdn.com/i/teamlogos/leagues/500/mls.png',
    'soccer_epl': 'https://logos-world.net/wp-content/uploads/2020/06/Premier-League-Logo.png',
    'americanfootball_ncaaf': 'https://a.espncdn.com/i/teamlogos/leagues/500/college-football.png',
    'basketball_ncaab': 'https://a.espncdn.com/i/teamlogos/leagues/500/mens-college-basketball.png',
    'mma_ufc': 'https://logoeps.com/wp-content/uploads/2013/03/ufc-vector-logo.png',
    'boxing_main': 'https://static.vecteezy.com/system/resources/previews/020/975/567/original/boxing-logo-template-free-vector.jpg',
    'motorsport_nascar': 'https://logoeps.com/wp-content/uploads/2013/12/nascar-vector-logo.png',
    'tennis_atp': 'https://logoeps.com/wp-content/uploads/2014/09/atp-vector-logo.png',
    
    // Generic sport fallbacks
    'NFL': 'https://a.espncdn.com/i/teamlogos/leagues/500/nfl.png',
    'NBA': 'https://a.espncdn.com/i/teamlogos/leagues/500/nba.png',
    'MLB': 'https://a.espncdn.com/i/teamlogos/leagues/500/mlb.png',
    'NHL': 'https://a.espncdn.com/i/teamlogos/leagues/500/nhl.png',
    'MLS': 'https://a.espncdn.com/i/teamlogos/leagues/500/mls.png',
    'Premier League': 'https://logos-world.net/wp-content/uploads/2020/06/Premier-League-Logo.png',
    'College Football': 'https://a.espncdn.com/i/teamlogos/leagues/500/college-football.png',
    'College Basketball': 'https://a.espncdn.com/i/teamlogos/leagues/500/mens-college-basketball.png',
    'UFC': 'https://logoeps.com/wp-content/uploads/2013/03/ufc-vector-logo.png',
    'Boxing': 'https://static.vecteezy.com/system/resources/previews/020/975/567/original/boxing-logo-template-free-vector.jpg',
    'NASCAR': 'https://logoeps.com/wp-content/uploads/2013/12/nascar-vector-logo.png',
    'ATP': 'https://logoeps.com/wp-content/uploads/2014/09/atp-vector-logo.png'
  };

  return leagueLogos[leagueKey] || 'https://via.placeholder.com/50x50?text=SPORT';
};

// Helper function to get league display name
export const getLeagueDisplayName = (leagueKey: string): string => {
  const leagueNames: { [key: string]: string } = {
    'americanfootball_nfl': 'NFL',
    'basketball_nba': 'NBA',
    'baseball_mlb': 'MLB',
    'icehockey_nhl': 'NHL',
    'soccer_usa_mls': 'MLS',
    'soccer_epl': 'Premier League',
    'americanfootball_ncaaf': 'NCAA Football',
    'basketball_ncaab': 'NCAA Basketball',
    'mma_ufc': 'UFC',
    'boxing_main': 'Boxing',
    'motorsport_nascar': 'NASCAR',
    'tennis_atp': 'ATP Tennis'
  };

  return leagueNames[leagueKey] || leagueKey.toUpperCase();
};