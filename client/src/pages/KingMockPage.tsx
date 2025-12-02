import { KingVipTool } from "@/kingEngine/KingVipTool";

const MOCK_GAMES = [
  {
    id: "mock-nba-orl-chi",
    sport: "NBA",
    league: "NBA",
    homeTeam: "Orlando Magic",
    awayTeam: "Chicago Bulls",
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    isLateGame: false,
    market: {
      spreadFavorite: "Orlando Magic",
      spreadLine: -8.5,
      spreadOdds: -110,
      total: 218.5,
      moneylineFavorite: "Orlando Magic",
      moneylineFavOdds: -300,
      moneylineDog: "Chicago Bulls",
      moneylineDogOdds: 240,
    },
    edgeScoreFavorite: 8.7,
    edgeScoreDog: 4.3,
  },
  {
    id: "mock-nba-atl-det",
    sport: "NBA",
    league: "NBA",
    homeTeam: "Detroit Pistons",
    awayTeam: "Atlanta Hawks",
    startTime: new Date(Date.now() + 2.5 * 60 * 60 * 1000).toISOString(),
    isLateGame: false,
    market: {
      spreadFavorite: "Detroit Pistons",
      spreadLine: -9.5,
      spreadOdds: -110,
      total: 222.5,
      moneylineFavorite: "Detroit Pistons",
      moneylineFavOdds: -260,
      moneylineDog: "Atlanta Hawks",
      moneylineDogOdds: 210,
    },
    edgeScoreFavorite: 7.9,
    edgeScoreDog: 6.8,
  },
  {
    id: "mock-nhl-phi-pit",
    sport: "NHL",
    league: "NHL",
    homeTeam: "Philadelphia Flyers",
    awayTeam: "Pittsburgh Penguins",
    startTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    isLateGame: false,
    market: {
      spreadFavorite: "Philadelphia Flyers",
      spreadLine: -1.5,
      spreadOdds: 180,
      total: 6.5,
      moneylineFavorite: "Philadelphia Flyers",
      moneylineFavOdds: -140,
      moneylineDog: "Pittsburgh Penguins",
      moneylineDogOdds: 120,
    },
    edgeScoreFavorite: 7.5,
    edgeScoreDog: 5.9,
  },
  {
    id: "mock-nfl-nyg-ne",
    sport: "NFL",
    league: "NFL",
    homeTeam: "New England Patriots",
    awayTeam: "New York Giants",
    startTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    isLateGame: true,
    market: {
      spreadFavorite: "New England Patriots",
      spreadLine: -7,
      spreadOdds: -110,
      total: 46.5,
      moneylineFavorite: "New England Patriots",
      moneylineFavOdds: -320,
      moneylineDog: "New York Giants",
      moneylineDogOdds: 250,
    },
    edgeScoreFavorite: 9.1,
    edgeScoreDog: 3.8,
  },
  {
    id: "mock-nba-lal-phx",
    sport: "NBA",
    league: "NBA",
    homeTeam: "Los Angeles Lakers",
    awayTeam: "Phoenix Suns",
    startTime: new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString(),
    isLateGame: true,
    market: {
      spreadFavorite: "Los Angeles Lakers",
      spreadLine: -5.5,
      spreadOdds: -110,
      total: 230.5,
      moneylineFavorite: "Los Angeles Lakers",
      moneylineFavOdds: -210,
      moneylineDog: "Phoenix Suns",
      moneylineDogOdds: 180,
    },
    edgeScoreFavorite: 8.3,
    edgeScoreDog: 5.1,
  },
  {
    id: "mock-ncaab-duke-unc",
    sport: "NCAAB",
    league: "NCAAB",
    homeTeam: "Duke Blue Devils",
    awayTeam: "North Carolina Tar Heels",
    startTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    isLateGame: false,
    market: {
      spreadFavorite: "Duke Blue Devils",
      spreadLine: -4.5,
      spreadOdds: -110,
      total: 152.5,
      moneylineFavorite: "Duke Blue Devils",
      moneylineFavOdds: -180,
      moneylineDog: "North Carolina Tar Heels",
      moneylineDogOdds: 155,
    },
    edgeScoreFavorite: 7.2,
    edgeScoreDog: 6.5,
  },
  {
    id: "mock-ncaaf-osu-mich",
    sport: "NCAAF",
    league: "NCAAF",
    homeTeam: "Ohio State Buckeyes",
    awayTeam: "Michigan Wolverines",
    startTime: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
    isLateGame: true,
    market: {
      spreadFavorite: "Ohio State Buckeyes",
      spreadLine: -3.5,
      spreadOdds: -110,
      total: 48.5,
      moneylineFavorite: "Ohio State Buckeyes",
      moneylineFavOdds: -165,
      moneylineDog: "Michigan Wolverines",
      moneylineDogOdds: 145,
    },
    edgeScoreFavorite: 6.8,
    edgeScoreDog: 7.1,
  },
];

export default function KingMockPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 bg-clip-text text-transparent mb-2">
            King VIP Engine (Mock Data)
          </h1>
          <p className="text-gray-400">
            Test the King Engine UI with simulated games. No backend required.
          </p>
        </div>
        <KingVipTool games={MOCK_GAMES} />
      </div>
    </div>
  );
}