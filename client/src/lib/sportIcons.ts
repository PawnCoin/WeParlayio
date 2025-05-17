// Collection of sport-specific icons for the WeParlay platform
const sportIcons = {
  // Mainstream sports
  basketball: "🏀",
  basketball_nba: "🏀",
  nba: "🏀",
  football: "🏈",
  football_nfl: "🏈", 
  nfl: "🏈",
  baseball: "⚾",
  baseball_mlb: "⚾",
  mlb: "⚾",
  hockey: "🏒",
  hockey_nhl: "🏒",
  nhl: "🏒",
  soccer: "⚽",
  soccer_mls: "⚽",
  mls: "⚽",
  
  // Boxing and combat sports
  boxing: "🥊",
  boxing_main: "🥊",
  mma: "🥋",
  mma_ufc: "🥋",
  ufc: "🥋",
  
  // Motorsports
  motorsport: "🏎️",
  motorsport_nascar: "🏎️",
  nascar: "🏎️",
  f1: "🏎️",
  
  // Tennis
  tennis: "🎾",
  tennis_atp: "🎾",
  tennis_wta: "🎾",
  
  // Video games / esports
  esports: "🎮",
  dota: "🎮",
  lol: "🎮",
  csgo: "🎮",
  valorant: "🎮",
  fortnite: "🎮",
  custom_game: "🎮"
};

export default sportIcons;

// Function to get sport icon by key
export const getSportIcon = (key: string): string => {
  return sportIcons[key as keyof typeof sportIcons] || "🎯";
};