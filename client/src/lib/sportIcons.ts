// Collection of sport-specific icons for the WeParlay platform
const sportIcons = {
  // Mainstream sports
  basketball: "🏀",
  football: "🏈",
  baseball: "⚾",
  hockey: "🏒",
  soccer: "⚽",
  
  // Boxing and combat sports
  boxing: "🥊",
  boxing_main: "🥊",
  mma: "🥋",
  mma_ufc: "🥋",
  
  // Motorsports
  motorsport: "🏎️",
  motorsport_nascar: "🏎️",
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