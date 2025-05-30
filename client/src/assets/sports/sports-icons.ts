
// Sports Icons Mapping
// This file maps sport keys to their icon file paths in the assets folder

export const sportsIconPaths = {
  // Major North American Sports
  basketball: '/src/assets/sports/basketball.svg',
  nba: '/src/assets/sports/nba-logo.svg',
  wnba: '/src/assets/sports/wnba-logo.svg',
  ncaab: '/src/assets/sports/ncaa-basketball.svg',
  
  football: '/src/assets/sports/football.svg', 
  nfl: '/src/assets/sports/nfl-logo.svg',
  ncaaf: '/src/assets/sports/ncaa-football.svg',
  cfl: '/src/assets/sports/cfl-logo.svg',
  
  baseball: '/src/assets/sports/baseball.svg',
  mlb: '/src/assets/sports/mlb-logo.svg',
  milb: '/src/assets/sports/milb-logo.svg',
  npb: '/src/assets/sports/npb-logo.svg', // Japan
  kbo: '/src/assets/sports/kbo-logo.svg', // Korea
  
  hockey: '/src/assets/sports/hockey.svg',
  nhl: '/src/assets/sports/nhl-logo.svg',
  khl: '/src/assets/sports/khl-logo.svg', // Russia
  shl: '/src/assets/sports/shl-logo.svg', // Sweden
  del: '/src/assets/sports/del-logo.svg', // Germany
  
  // Soccer/Football Worldwide
  soccer: '/src/assets/sports/soccer.svg',
  football_international: '/src/assets/sports/soccer.svg',
  
  // Major Soccer Leagues
  mls: '/src/assets/sports/mls-logo.svg',
  premier_league: '/src/assets/sports/premier-league.svg',
  epl: '/src/assets/sports/premier-league.svg',
  la_liga: '/src/assets/sports/la-liga.svg',
  serie_a: '/src/assets/sports/serie-a.svg',
  bundesliga: '/src/assets/sports/bundesliga.svg',
  ligue_1: '/src/assets/sports/ligue-1.svg',
  
  // International Soccer Competitions
  champions_league: '/src/assets/sports/champions-league.svg',
  uefa: '/src/assets/sports/uefa-logo.svg',
  fifa: '/src/assets/sports/fifa.svg',
  world_cup: '/src/assets/sports/fifa-world-cup.svg',
  euros: '/src/assets/sports/uefa-euro.svg',
  copa_america: '/src/assets/sports/copa-america.svg',
  
  // Other Soccer Leagues
  liga_mx: '/src/assets/sports/liga-mx.svg',
  chinese_super_league: '/src/assets/sports/csl-logo.svg',
  j_league: '/src/assets/sports/j-league.svg',
  a_league: '/src/assets/sports/a-league.svg',
  
  // Combat Sports
  boxing: '/src/assets/sports/boxing.svg',
  wbc: '/src/assets/sports/wbc-logo.svg',
  wba: '/src/assets/sports/wba-logo.svg',
  ibf: '/src/assets/sports/ibf-logo.svg',
  wbo: '/src/assets/sports/wbo-logo.svg',
  
  mma: '/src/assets/sports/mma.svg',
  ufc: '/src/assets/sports/ufc-logo.svg',
  bellator: '/src/assets/sports/bellator-logo.svg',
  one_championship: '/src/assets/sports/one-fc.svg',
  
  // Motorsports
  f1: '/src/assets/sports/formula1.svg',
  formula_1: '/src/assets/sports/formula1.svg',
  nascar: '/src/assets/sports/nascar-logo.svg',
  indycar: '/src/assets/sports/indycar.svg',
  motogp: '/src/assets/sports/motogp.svg',
  formula_e: '/src/assets/sports/formula-e.svg',
  wrc: '/src/assets/sports/wrc.svg',
  
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
  icc: '/src/assets/sports/icc-logo.svg',
  ipl: '/src/assets/sports/ipl-logo.svg',
  bbl: '/src/assets/sports/big-bash.svg',
  
  rugby: '/src/assets/sports/rugby.svg',
  rugby_league: '/src/assets/sports/rugby-league.svg',
  rugby_union: '/src/assets/sports/rugby-union.svg',
  six_nations: '/src/assets/sports/six-nations.svg',
  
  // Olympic and Multi-Sport Events
  olympics: '/src/assets/sports/olympics.svg',
  summer_olympics: '/src/assets/sports/summer-olympics.svg',
  winter_olympics: '/src/assets/sports/winter-olympics.svg',
  paralympics: '/src/assets/sports/paralympics.svg',
  commonwealth_games: '/src/assets/sports/commonwealth-games.svg',
  
  // Track and Field
  athletics: '/src/assets/sports/athletics.svg',
  track_field: '/src/assets/sports/track-and-field.svg',
  marathon: '/src/assets/sports/marathon.svg',
  
  // Swimming and Aquatics
  swimming: '/src/assets/sports/swimming.svg',
  diving: '/src/assets/sports/diving.svg',
  water_polo: '/src/assets/sports/water-polo.svg',
  
  // Winter Sports
  skiing: '/src/assets/sports/skiing.svg',
  snowboarding: '/src/assets/sports/snowboarding.svg',
  figure_skating: '/src/assets/sports/figure-skating.svg',
  ice_hockey: '/src/assets/sports/ice-hockey.svg',
  curling: '/src/assets/sports/curling.svg',
  
  // Other Popular Sports
  volleyball: '/src/assets/sports/volleyball.svg',
  badminton: '/src/assets/sports/badminton.svg',
  table_tennis: '/src/assets/sports/table-tennis.svg',
  cycling: '/src/assets/sports/cycling.svg',
  gymnastics: '/src/assets/sports/gymnastics.svg',
  weightlifting: '/src/assets/sports/weightlifting.svg',
  
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
