
// Universal Team Service - Complete mappings for all professional sports teams worldwide
import { ESPNAssetService } from './espnAssetService';

export class UniversalTeamService {
  // Complete ESPN team ID mappings for all major leagues
  private static teamMappings = {
    // NBA Teams (30 teams)
    nba: {
      "Atlanta Hawks": "1",
      "Boston Celtics": "2", 
      "Brooklyn Nets": "17",
      "Charlotte Hornets": "30",
      "Chicago Bulls": "4",
      "Cleveland Cavaliers": "5",
      "Dallas Mavericks": "6",
      "Denver Nuggets": "7",
      "Detroit Pistons": "8",
      "Golden State Warriors": "9",
      "Houston Rockets": "10",
      "Indiana Pacers": "11",
      "Los Angeles Clippers": "12",
      "Los Angeles Lakers": "13",
      "Memphis Grizzlies": "29",
      "Miami Heat": "14",
      "Milwaukee Bucks": "15",
      "Minnesota Timberwolves": "16",
      "New Orleans Pelicans": "3",
      "New York Knicks": "18",
      "Oklahoma City Thunder": "25",
      "Orlando Magic": "19",
      "Philadelphia 76ers": "20",
      "Phoenix Suns": "21",
      "Portland Trail Blazers": "22",
      "Sacramento Kings": "23",
      "San Antonio Spurs": "24",
      "Toronto Raptors": "28",
      "Utah Jazz": "26",
      "Washington Wizards": "27"
    },

    // NFL Teams (32 teams)
    nfl: {
      "Arizona Cardinals": "22",
      "Atlanta Falcons": "1",
      "Baltimore Ravens": "33",
      "Buffalo Bills": "2",
      "Carolina Panthers": "29",
      "Chicago Bears": "3",
      "Cincinnati Bengals": "4",
      "Cleveland Browns": "5",
      "Dallas Cowboys": "6",
      "Denver Broncos": "7",
      "Detroit Lions": "8",
      "Green Bay Packers": "9",
      "Houston Texans": "34",
      "Indianapolis Colts": "11",
      "Jacksonville Jaguars": "30",
      "Kansas City Chiefs": "12",
      "Las Vegas Raiders": "13",
      "Los Angeles Chargers": "24",
      "Los Angeles Rams": "14",
      "Miami Dolphins": "15",
      "Minnesota Vikings": "16",
      "New England Patriots": "17",
      "New Orleans Saints": "18",
      "New York Giants": "19",
      "New York Jets": "20",
      "Philadelphia Eagles": "21",
      "Pittsburgh Steelers": "23",
      "San Francisco 49ers": "25",
      "Seattle Seahawks": "26",
      "Tampa Bay Buccaneers": "27",
      "Tennessee Titans": "10",
      "Washington Commanders": "28"
    },

    // MLB Teams (30 teams)
    mlb: {
      "Arizona Diamondbacks": "29",
      "Atlanta Braves": "15",
      "Baltimore Orioles": "1",
      "Boston Red Sox": "2",
      "Chicago Cubs": "16",
      "Chicago White Sox": "4",
      "Cincinnati Reds": "17",
      "Cleveland Guardians": "5",
      "Colorado Rockies": "27",
      "Detroit Tigers": "6",
      "Houston Astros": "18",
      "Kansas City Royals": "7",
      "Los Angeles Angels": "3",
      "Los Angeles Dodgers": "19",
      "Miami Marlins": "28",
      "Milwaukee Brewers": "8",
      "Minnesota Twins": "9",
      "New York Mets": "21",
      "New York Yankees": "10",
      "Oakland Athletics": "11",
      "Philadelphia Phillies": "22",
      "Pittsburgh Pirates": "23",
      "San Diego Padres": "25",
      "San Francisco Giants": "26",
      "Seattle Mariners": "12",
      "St. Louis Cardinals": "24",
      "Tampa Bay Rays": "30",
      "Texas Rangers": "13",
      "Toronto Blue Jays": "14",
      "Washington Nationals": "20"
    },

    // NHL Teams (32 teams)
    nhl: {
      "Anaheim Ducks": "25",
      "Arizona Coyotes": "53",
      "Boston Bruins": "6",
      "Buffalo Sabres": "7",
      "Calgary Flames": "20",
      "Carolina Hurricanes": "12",
      "Chicago Blackhawks": "16",
      "Colorado Avalanche": "21",
      "Columbus Blue Jackets": "29",
      "Dallas Stars": "27",
      "Detroit Red Wings": "17",
      "Edmonton Oilers": "22",
      "Florida Panthers": "13",
      "Los Angeles Kings": "26",
      "Minnesota Wild": "30",
      "Montreal Canadiens": "8",
      "Nashville Predators": "18",
      "New Jersey Devils": "1",
      "New York Islanders": "2",
      "New York Rangers": "3",
      "Ottawa Senators": "9",
      "Philadelphia Flyers": "4",
      "Pittsburgh Penguins": "5",
      "San Jose Sharks": "28",
      "Seattle Kraken": "55",
      "St. Louis Blues": "19",
      "Tampa Bay Lightning": "14",
      "Toronto Maple Leafs": "10",
      "Vancouver Canucks": "23",
      "Vegas Golden Knights": "54",
      "Washington Capitals": "15",
      "Winnipeg Jets": "52"
    },

    // Premier League Teams (20 teams)
    "premier-league": {
      "Arsenal": "359",
      "Aston Villa": "362",
      "Bournemouth": "337",
      "Brentford": "337",
      "Brighton": "331",
      "Chelsea": "363",
      "Crystal Palace": "384",
      "Everton": "368",
      "Fulham": "370",
      "Liverpool": "364",
      "Luton Town": "346",
      "Manchester City": "382",
      "Manchester United": "360",
      "Newcastle United": "361",
      "Nottingham Forest": "385",
      "Sheffield United": "349",
      "Tottenham": "367",
      "West Ham": "371",
      "Wolverhampton": "380",
      "Burnley": "336"
    },

    // La Liga Teams (20 teams)
    "la-liga": {
      "Real Madrid": "86",
      "Barcelona": "83",
      "Atletico Madrid": "1068",
      "Athletic Bilbao": "95",
      "Real Sociedad": "101",
      "Villarreal": "102",
      "Real Betis": "90",
      "Valencia": "94",
      "Sevilla": "88",
      "Osasuna": "97",
      "Getafe": "3761",
      "Las Palmas": "99",
      "Girona": "7878",
      "Alaves": "1063",
      "Celta Vigo": "558",
      "Mallorca": "714",
      "Rayo Vallecano": "98",
      "Cadiz": "9825",
      "Espanyol": "89",
      "Elche": "7989"
    },

    // WNBA Teams (12 teams)
    wnba: {
      "Atlanta Dream": "1611661313",
      "Chicago Sky": "1611661314",
      "Connecticut Sun": "1611661315",
      "Dallas Wings": "1611661316",
      "Indiana Fever": "1611661317",
      "Las Vegas Aces": "1611661318",
      "Minnesota Lynx": "1611661319",
      "New York Liberty": "1611661320",
      "Phoenix Mercury": "1611661321",
      "Seattle Storm": "1611661322",
      "Washington Mystics": "1611661323",
      "Los Angeles Sparks": "1611661324"
    },

    // MLS Teams (30 teams)
    mls: {
      "Atlanta United": "15007",
      "Austin FC": "15031",
      "Charlotte FC": "15032",
      "Chicago Fire": "1996",
      "FC Cincinnati": "15027",
      "Colorado Rapids": "1997",
      "Columbus Crew": "1998",
      "DC United": "2009",
      "FC Dallas": "1999",
      "Houston Dynamo": "16552",
      "Inter Miami": "15030",
      "LA Galaxy": "2000",
      "LAFC": "15028",
      "Minnesota United": "15026",
      "Montreal Impact": "16590",
      "Nashville SC": "15029",
      "New England Revolution": "2001",
      "New York City FC": "15025",
      "New York Red Bulls": "2002",
      "Orlando City": "15024",
      "Philadelphia Union": "16574",
      "Portland Timbers": "16575",
      "Real Salt Lake": "2003",
      "San Jose Earthquakes": "2004",
      "Seattle Sounders": "16576",
      "Sporting Kansas City": "16573",
      "St. Louis City": "15033",
      "Toronto FC": "16577",
      "Vancouver Whitecaps": "16578"
    },

    // Serie A Teams (20 teams)
    "serie-a": {
      "AC Milan": "103",
      "Inter Milan": "108",
      "Juventus": "111",
      "Napoli": "113",
      "AS Roma": "104",
      "Lazio": "110",
      "Atalanta": "105",
      "Fiorentina": "107",
      "Torino": "114",
      "Bologna": "106",
      "Sassuolo": "1058",
      "Udinese": "115",
      "Sampdoria": "112",
      "Genoa": "109",
      "Cagliari": "1390",
      "Spezia": "6975",
      "Venezia": "1390",
      "Empoli": "2445",
      "Salernitana": "1390",
      "Hellas Verona": "450"
    },

    // Bundesliga Teams (18 teams)
    bundesliga: {
      "Bayern Munich": "132",
      "Borussia Dortmund": "124",
      "RB Leipzig": "9789",
      "Bayer Leverkusen": "131",
      "Eintracht Frankfurt": "125",
      "VfL Wolfsburg": "141",
      "SC Freiburg": "126",
      "1. FC Koln": "122",
      "Union Berlin": "28",
      "Borussia Monchengladbach": "123",
      "FSV Mainz 05": "129",
      "VfB Stuttgart": "134",
      "FC Augsburg": "245",
      "TSG Hoffenheim": "2448",
      "Hertha Berlin": "127",
      "VfL Bochum": "10189",
      "SpVgg Greuther Furth": "2011",
      "Arminia Bielefeld": "2457"
    },

    // Top NCAA Basketball Teams
    ncaab: {
      "Duke Blue Devils": "150",
      "North Carolina Tar Heels": "153",
      "Kentucky Wildcats": "96",
      "Kansas Jayhawks": "2305",
      "UCLA Bruins": "26",
      "Michigan State Spartans": "127",
      "Villanova Wildcats": "222",
      "Gonzaga Bulldogs": "2250",
      "Syracuse Orange": "183",
      "Louisville Cardinals": "97"
    },

    // Top NCAA Football Teams
    ncaaf: {
      "Alabama Crimson Tide": "333",
      "Georgia Bulldogs": "61",
      "Ohio State Buckeyes": "194",
      "Michigan Wolverines": "130",
      "Texas Longhorns": "251",
      "USC Trojans": "30",
      "Notre Dame Fighting Irish": "87",
      "Penn State Nittany Lions": "213",
      "Florida Gators": "57",
      "LSU Tigers": "99",
      "Auburn Tigers": "2",
      "Tennessee Volunteers": "2633",
      "Oklahoma Sooners": "201",
      "Texas A&M Aggies": "245",
      "Wisconsin Badgers": "275",
      "Oregon Ducks": "2483",
      "Clemson Tigers": "228",
      "Miami Hurricanes": "2390",
      "Florida State Seminoles": "52",
      "Stanford Cardinal": "24"
    }
  };

  // Get team logo using ESPN service
  static getTeamLogo(teamName: string, league: string): string {
    const normalizedLeague = league.toLowerCase().replace(/\s+/g, '-');
    const teamMappings = this.teamMappings[normalizedLeague as keyof typeof this.teamMappings];
    
    if (teamMappings && teamMappings[teamName as keyof typeof teamMappings]) {
      const teamId = teamMappings[teamName as keyof typeof teamMappings];
      return ESPNAssetService.getTeamLogo(teamName, normalizedLeague, teamId);
    }

    // Fallback to ESPN service without team ID
    return ESPNAssetService.getTeamLogo(teamName, normalizedLeague);
  }

  // Get all teams for a league
  static getTeamsForLeague(league: string): string[] {
    const normalizedLeague = league.toLowerCase().replace(/\s+/g, '-');
    const teamMappings = this.teamMappings[normalizedLeague as keyof typeof this.teamMappings];
    
    return teamMappings ? Object.keys(teamMappings) : [];
  }

  // Get all supported leagues
  static getSupportedLeagues(): string[] {
    return Object.keys(this.teamMappings);
  }

  // Get player photo
  static getPlayerPhoto(playerId: string, sport: string): string {
    return ESPNAssetService.getPlayerPhoto(playerId, sport);
  }

  // Search teams by name
  static searchTeams(query: string, league?: string): Array<{team: string, league: string}> {
    const results: Array<{team: string, league: string}> = [];
    const searchTerm = query.toLowerCase();

    const leaguesToSearch = league ? [league] : this.getSupportedLeagues();

    leaguesToSearch.forEach(leagueKey => {
      const teams = this.getTeamsForLeague(leagueKey);
      teams.forEach(team => {
        if (team.toLowerCase().includes(searchTerm)) {
          results.push({ team, league: leagueKey });
        }
      });
    });

    return results;
  }
}
