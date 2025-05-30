
// Sports Icons Mapping
// This file maps sport keys to their icon file paths in the assets folder

export const sportsIconPaths = {
  // Major North American Sports
  basketball: '/src/assets/sports/basketball.svg',
  nba: '/src/assets/sports/nba-logo.svg',
  football: '/src/assets/sports/football.svg', 
  nfl: '/src/assets/sports/nfl-logo.svg',
  baseball: '/src/assets/sports/baseball.svg',
  mlb: '/src/assets/sports/mlb-logo.svg',
  hockey: '/src/assets/sports/hockey.svg',
  nhl: '/src/assets/sports/nhl-logo.svg',
  
  // Soccer/Football Worldwide
  soccer: '/src/assets/sports/soccer.svg',
  mls: '/src/assets/sports/mls-logo.svg',
  premier_league: '/src/assets/sports/premier-league.svg',
  la_liga: '/src/assets/sports/la-liga.svg',
  serie_a: '/src/assets/sports/serie-a.svg',
  bundesliga: '/src/assets/sports/bundesliga.svg',
  champions_league: '/src/assets/sports/champions-league.svg',
  fifa: '/src/assets/sports/fifa.svg',
  
  // Combat Sports
  boxing: '/src/assets/sports/boxing.svg',
  mma: '/src/assets/sports/mma.svg',
  ufc: '/src/assets/sports/ufc-logo.svg',
  
  // Motorsports
  f1: '/src/assets/sports/formula1.svg',
  nascar: '/src/assets/sports/nascar-logo.svg',
  
  // Tennis
  tennis: '/src/assets/sports/tennis.svg',
  atp: '/src/assets/sports/atp-logo.svg',
  wta: '/src/assets/sports/wta-logo.svg',
  
  // Golf
  golf: '/src/assets/sports/golf.svg',
  pga: '/src/assets/sports/pga-logo.svg',
  
  // College Sports
  ncaa: '/src/assets/sports/ncaa-logo.svg',
  ncaaf: '/src/assets/sports/ncaa-football.svg',
  ncaab: '/src/assets/sports/ncaa-basketball.svg',
  
  // Women's Sports
  wnba: '/src/assets/sports/wnba-logo.svg',
  
  // International Sports
  cricket: '/src/assets/sports/cricket.svg',
  rugby: '/src/assets/sports/rugby.svg',
  olympics: '/src/assets/sports/olympics.svg',
  
  // Esports
  esports: '/src/assets/sports/esports.svg',
  lol: '/src/assets/sports/league-of-legends.svg',
  csgo: '/src/assets/sports/csgo.svg',
  dota2: '/src/assets/sports/dota2.svg',
  valorant: '/src/assets/sports/valorant.svg',
  overwatch: '/src/assets/sports/overwatch.svg'
};

// Function to get sport icon path
export const getSportIconPath = (sportKey: string): string => {
  return sportsIconPaths[sportKey as keyof typeof sportsIconPaths] || sportsIconPaths.basketball;
};
