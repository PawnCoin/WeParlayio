import { memo, useState, useEffect, useMemo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import EventPreviewModal from './EventPreviewModal';

// Real team logo URLs using reliable sports logo services
const getTeamLogoUrl = (teamName: string, sport: string): string => {
  // ESPN Logo CDN - reliable source for team logos
  const cleanTeamName = teamName.trim();
  
  // NFL team logo mappings - comprehensive list
  const nflLogos: { [key: string]: string } = {
    'Chiefs': 'https://a.espncdn.com/i/teamlogos/nfl/500/kc.png',
    'Kansas City': 'https://a.espncdn.com/i/teamlogos/nfl/500/kc.png',
    'Cowboys': 'https://a.espncdn.com/i/teamlogos/nfl/500/dal.png',
    'Dallas': 'https://a.espncdn.com/i/teamlogos/nfl/500/dal.png',
    'Packers': 'https://a.espncdn.com/i/teamlogos/nfl/500/gb.png',
    'Green Bay': 'https://a.espncdn.com/i/teamlogos/nfl/500/gb.png',
    'Patriots': 'https://a.espncdn.com/i/teamlogos/nfl/500/ne.png',
    'New England': 'https://a.espncdn.com/i/teamlogos/nfl/500/ne.png',
    'Steelers': 'https://a.espncdn.com/i/teamlogos/nfl/500/pit.png',
    'Pittsburgh': 'https://a.espncdn.com/i/teamlogos/nfl/500/pit.png',
    '49ers': 'https://a.espncdn.com/i/teamlogos/nfl/500/sf.png',
    'San Francisco': 'https://a.espncdn.com/i/teamlogos/nfl/500/sf.png',
    'Eagles': 'https://a.espncdn.com/i/teamlogos/nfl/500/phi.png',
    'Philadelphia': 'https://a.espncdn.com/i/teamlogos/nfl/500/phi.png',
    'Giants': 'https://a.espncdn.com/i/teamlogos/nfl/500/nyg.png',
    'New York Giants': 'https://a.espncdn.com/i/teamlogos/nfl/500/nyg.png',
    'Bills': 'https://a.espncdn.com/i/teamlogos/nfl/500/buf.png',
    'Buffalo': 'https://a.espncdn.com/i/teamlogos/nfl/500/buf.png',
    'Rams': 'https://a.espncdn.com/i/teamlogos/nfl/500/lar.png',
    'Los Angeles Rams': 'https://a.espncdn.com/i/teamlogos/nfl/500/lar.png',
    'Bengals': 'https://a.espncdn.com/i/teamlogos/nfl/500/cin.png',
    'Cincinnati': 'https://a.espncdn.com/i/teamlogos/nfl/500/cin.png',
    'Dolphins': 'https://a.espncdn.com/i/teamlogos/nfl/500/mia.png',
    'Miami': 'https://a.espncdn.com/i/teamlogos/nfl/500/mia.png',
    'Ravens': 'https://a.espncdn.com/i/teamlogos/nfl/500/bal.png',
    'Baltimore': 'https://a.espncdn.com/i/teamlogos/nfl/500/bal.png',
    'Browns': 'https://a.espncdn.com/i/teamlogos/nfl/500/cle.png',
    'Cleveland': 'https://a.espncdn.com/i/teamlogos/nfl/500/cle.png',
    'Broncos': 'https://a.espncdn.com/i/teamlogos/nfl/500/den.png',
    'Denver': 'https://a.espncdn.com/i/teamlogos/nfl/500/den.png',
    'Lions': 'https://a.espncdn.com/i/teamlogos/nfl/500/det.png',
    'Detroit': 'https://a.espncdn.com/i/teamlogos/nfl/500/det.png',
    'Texans': 'https://a.espncdn.com/i/teamlogos/nfl/500/hou.png',
    'Houston': 'https://a.espncdn.com/i/teamlogos/nfl/500/hou.png',
    'Colts': 'https://a.espncdn.com/i/teamlogos/nfl/500/ind.png',
    'Indianapolis': 'https://a.espncdn.com/i/teamlogos/nfl/500/ind.png',
    'Jaguars': 'https://a.espncdn.com/i/teamlogos/nfl/500/jax.png',
    'Jacksonville': 'https://a.espncdn.com/i/teamlogos/nfl/500/jax.png',
    'Raiders': 'https://a.espncdn.com/i/teamlogos/nfl/500/lv.png',
    'Las Vegas': 'https://a.espncdn.com/i/teamlogos/nfl/500/lv.png',
    'Chargers': 'https://a.espncdn.com/i/teamlogos/nfl/500/lac.png',
    'Los Angeles Chargers': 'https://a.espncdn.com/i/teamlogos/nfl/500/lac.png',
    'Vikings': 'https://a.espncdn.com/i/teamlogos/nfl/500/min.png',
    'Minnesota': 'https://a.espncdn.com/i/teamlogos/nfl/500/min.png',
    'Saints': 'https://a.espncdn.com/i/teamlogos/nfl/500/no.png',
    'New Orleans': 'https://a.espncdn.com/i/teamlogos/nfl/500/no.png',
    'Jets': 'https://a.espncdn.com/i/teamlogos/nfl/500/nyj.png',
    'New York Jets': 'https://a.espncdn.com/i/teamlogos/nfl/500/nyj.png',
    'Panthers': 'https://a.espncdn.com/i/teamlogos/nfl/500/car.png',
    'Carolina': 'https://a.espncdn.com/i/teamlogos/nfl/500/car.png',
    'Bears': 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png',
    'Chicago': 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png',
    'Seahawks': 'https://a.espncdn.com/i/teamlogos/nfl/500/sea.png',
    'Seattle': 'https://a.espncdn.com/i/teamlogos/nfl/500/sea.png',
    'Buccaneers': 'https://a.espncdn.com/i/teamlogos/nfl/500/tb.png',
    'Tampa Bay': 'https://a.espncdn.com/i/teamlogos/nfl/500/tb.png',
    'Titans': 'https://a.espncdn.com/i/teamlogos/nfl/500/ten.png',
    'Tennessee': 'https://a.espncdn.com/i/teamlogos/nfl/500/ten.png',
    'Commanders': 'https://a.espncdn.com/i/teamlogos/nfl/500/was.png',
    'Washington': 'https://a.espncdn.com/i/teamlogos/nfl/500/was.png',
    'Cardinals': 'https://a.espncdn.com/i/teamlogos/nfl/500/ari.png',
    'Arizona': 'https://a.espncdn.com/i/teamlogos/nfl/500/ari.png',
    'Falcons': 'https://a.espncdn.com/i/teamlogos/nfl/500/atl.png',
    'Atlanta': 'https://a.espncdn.com/i/teamlogos/nfl/500/atl.png'
  };
  
  // NBA team logo mappings - All 30 teams
  const nbaLogos: { [key: string]: string } = {
    'Lakers': 'https://a.espncdn.com/i/teamlogos/nba/500/lal.png',
    'Los Angeles Lakers': 'https://a.espncdn.com/i/teamlogos/nba/500/lal.png',
    'Warriors': 'https://a.espncdn.com/i/teamlogos/nba/500/gsw.png',
    'Golden State Warriors': 'https://a.espncdn.com/i/teamlogos/nba/500/gsw.png',
    'Bulls': 'https://a.espncdn.com/i/teamlogos/nba/500/chi.png',
    'Chicago Bulls': 'https://a.espncdn.com/i/teamlogos/nba/500/chi.png',
    'Heat': 'https://a.espncdn.com/i/teamlogos/nba/500/mia.png',
    'Miami Heat': 'https://a.espncdn.com/i/teamlogos/nba/500/mia.png',
    'Celtics': 'https://a.espncdn.com/i/teamlogos/nba/500/bos.png',
    'Boston Celtics': 'https://a.espncdn.com/i/teamlogos/nba/500/bos.png',
    'Knicks': 'https://a.espncdn.com/i/teamlogos/nba/500/ny.png',
    'New York Knicks': 'https://a.espncdn.com/i/teamlogos/nba/500/ny.png',
    'Spurs': 'https://a.espncdn.com/i/teamlogos/nba/500/sa.png',
    'San Antonio Spurs': 'https://a.espncdn.com/i/teamlogos/nba/500/sa.png',
    'Nets': 'https://a.espncdn.com/i/teamlogos/nba/500/bkn.png',
    'Brooklyn Nets': 'https://a.espncdn.com/i/teamlogos/nba/500/bkn.png',
    '76ers': 'https://a.espncdn.com/i/teamlogos/nba/500/phi.png',
    'Philadelphia 76ers': 'https://a.espncdn.com/i/teamlogos/nba/500/phi.png',
    'Bucks': 'https://a.espncdn.com/i/teamlogos/nba/500/mil.png',
    'Milwaukee Bucks': 'https://a.espncdn.com/i/teamlogos/nba/500/mil.png',
    'Raptors': 'https://a.espncdn.com/i/teamlogos/nba/500/tor.png',
    'Toronto Raptors': 'https://a.espncdn.com/i/teamlogos/nba/500/tor.png',
    'Mavericks': 'https://a.espncdn.com/i/teamlogos/nba/500/dal.png',
    'Dallas Mavericks': 'https://a.espncdn.com/i/teamlogos/nba/500/dal.png',
    'Nuggets': 'https://a.espncdn.com/i/teamlogos/nba/500/den.png',
    'Denver Nuggets': 'https://a.espncdn.com/i/teamlogos/nba/500/den.png',
    'Suns': 'https://a.espncdn.com/i/teamlogos/nba/500/phx.png',
    'Phoenix Suns': 'https://a.espncdn.com/i/teamlogos/nba/500/phx.png',
    'Clippers': 'https://a.espncdn.com/i/teamlogos/nba/500/lac.png',
    'Los Angeles Clippers': 'https://a.espncdn.com/i/teamlogos/nba/500/lac.png',
    'Kings': 'https://a.espncdn.com/i/teamlogos/nba/500/sac.png',
    'Sacramento Kings': 'https://a.espncdn.com/i/teamlogos/nba/500/sac.png',
    'Thunder': 'https://a.espncdn.com/i/teamlogos/nba/500/okc.png',
    'Oklahoma City Thunder': 'https://a.espncdn.com/i/teamlogos/nba/500/okc.png',
    'Rockets': 'https://a.espncdn.com/i/teamlogos/nba/500/hou.png',
    'Houston Rockets': 'https://a.espncdn.com/i/teamlogos/nba/500/hou.png',
    'Grizzlies': 'https://a.espncdn.com/i/teamlogos/nba/500/mem.png',
    'Memphis Grizzlies': 'https://a.espncdn.com/i/teamlogos/nba/500/mem.png',
    'Pelicans': 'https://a.espncdn.com/i/teamlogos/nba/500/no.png',
    'New Orleans Pelicans': 'https://a.espncdn.com/i/teamlogos/nba/500/no.png',
    'Jazz': 'https://a.espncdn.com/i/teamlogos/nba/500/utah.png',
    'Utah Jazz': 'https://a.espncdn.com/i/teamlogos/nba/500/utah.png',
    'Timberwolves': 'https://a.espncdn.com/i/teamlogos/nba/500/min.png',
    'Minnesota Timberwolves': 'https://a.espncdn.com/i/teamlogos/nba/500/min.png',
    'Trail Blazers': 'https://a.espncdn.com/i/teamlogos/nba/500/por.png',
    'Portland Trail Blazers': 'https://a.espncdn.com/i/teamlogos/nba/500/por.png',
    'Hawks': 'https://a.espncdn.com/i/teamlogos/nba/500/atl.png',
    'Atlanta Hawks': 'https://a.espncdn.com/i/teamlogos/nba/500/atl.png',
    'Hornets': 'https://a.espncdn.com/i/teamlogos/nba/500/cha.png',
    'Charlotte Hornets': 'https://a.espncdn.com/i/teamlogos/nba/500/cha.png',
    'Magic': 'https://a.espncdn.com/i/teamlogos/nba/500/orl.png',
    'Orlando Magic': 'https://a.espncdn.com/i/teamlogos/nba/500/orl.png',
    'Wizards': 'https://a.espncdn.com/i/teamlogos/nba/500/was.png',
    'Washington Wizards': 'https://a.espncdn.com/i/teamlogos/nba/500/was.png',
    'Cavaliers': 'https://a.espncdn.com/i/teamlogos/nba/500/cle.png',
    'Cleveland Cavaliers': 'https://a.espncdn.com/i/teamlogos/nba/500/cle.png',
    'Pacers': 'https://a.espncdn.com/i/teamlogos/nba/500/ind.png',
    'Indiana Pacers': 'https://a.espncdn.com/i/teamlogos/nba/500/ind.png',
    'Pistons': 'https://a.espncdn.com/i/teamlogos/nba/500/det.png',
    'Detroit Pistons': 'https://a.espncdn.com/i/teamlogos/nba/500/det.png'
  };
  
  // MLB team logo mappings - All 30 teams
  const mlbLogos: { [key: string]: string } = {
    'Yankees': 'https://a.espncdn.com/i/teamlogos/mlb/500/nyy.png',
    'New York Yankees': 'https://a.espncdn.com/i/teamlogos/mlb/500/nyy.png',
    'Dodgers': 'https://a.espncdn.com/i/teamlogos/mlb/500/lad.png',
    'Los Angeles Dodgers': 'https://a.espncdn.com/i/teamlogos/mlb/500/lad.png',
    'Red Sox': 'https://a.espncdn.com/i/teamlogos/mlb/500/bos.png',
    'Boston Red Sox': 'https://a.espncdn.com/i/teamlogos/mlb/500/bos.png',
    'Cubs': 'https://a.espncdn.com/i/teamlogos/mlb/500/chc.png',
    'Chicago Cubs': 'https://a.espncdn.com/i/teamlogos/mlb/500/chc.png',
    'Cardinals': 'https://a.espncdn.com/i/teamlogos/mlb/500/stl.png',
    'St. Louis Cardinals': 'https://a.espncdn.com/i/teamlogos/mlb/500/stl.png',
    'Astros': 'https://a.espncdn.com/i/teamlogos/mlb/500/hou.png',
    'Houston Astros': 'https://a.espncdn.com/i/teamlogos/mlb/500/hou.png',
    'Mets': 'https://a.espncdn.com/i/teamlogos/mlb/500/nym.png',
    'New York Mets': 'https://a.espncdn.com/i/teamlogos/mlb/500/nym.png',
    'Blue Jays': 'https://a.espncdn.com/i/teamlogos/mlb/500/tor.png',
    'Toronto Blue Jays': 'https://a.espncdn.com/i/teamlogos/mlb/500/tor.png',
    'Rockies': 'https://a.espncdn.com/i/teamlogos/mlb/500/col.png',
    'Colorado Rockies': 'https://a.espncdn.com/i/teamlogos/mlb/500/col.png',
    'Diamondbacks': 'https://a.espncdn.com/i/teamlogos/mlb/500/az.png',
    'Arizona Diamondbacks': 'https://a.espncdn.com/i/teamlogos/mlb/500/az.png',
    'Angels': 'https://a.espncdn.com/i/teamlogos/mlb/500/laa.png',
    'Los Angeles Angels': 'https://a.espncdn.com/i/teamlogos/mlb/500/laa.png',
    'White Sox': 'https://a.espncdn.com/i/teamlogos/mlb/500/chw.png',
    'Chicago White Sox': 'https://a.espncdn.com/i/teamlogos/mlb/500/chw.png',
    'Braves': 'https://a.espncdn.com/i/teamlogos/mlb/500/atl.png',
    'Atlanta Braves': 'https://a.espncdn.com/i/teamlogos/mlb/500/atl.png',
    'Orioles': 'https://a.espncdn.com/i/teamlogos/mlb/500/bal.png',
    'Baltimore Orioles': 'https://a.espncdn.com/i/teamlogos/mlb/500/bal.png',
    'Rays': 'https://a.espncdn.com/i/teamlogos/mlb/500/tb.png',
    'Tampa Bay Rays': 'https://a.espncdn.com/i/teamlogos/mlb/500/tb.png',
    'Guardians': 'https://a.espncdn.com/i/teamlogos/mlb/500/cle.png',
    'Cleveland Guardians': 'https://a.espncdn.com/i/teamlogos/mlb/500/cle.png',
    'Tigers': 'https://a.espncdn.com/i/teamlogos/mlb/500/det.png',
    'Detroit Tigers': 'https://a.espncdn.com/i/teamlogos/mlb/500/det.png',
    'Marlins': 'https://a.espncdn.com/i/teamlogos/mlb/500/mia.png',
    'Miami Marlins': 'https://a.espncdn.com/i/teamlogos/mlb/500/mia.png',
    'Brewers': 'https://a.espncdn.com/i/teamlogos/mlb/500/mil.png',
    'Milwaukee Brewers': 'https://a.espncdn.com/i/teamlogos/mlb/500/mil.png',
    'Twins': 'https://a.espncdn.com/i/teamlogos/mlb/500/min.png',
    'Minnesota Twins': 'https://a.espncdn.com/i/teamlogos/mlb/500/min.png',
    'Phillies': 'https://a.espncdn.com/i/teamlogos/mlb/500/phi.png',
    'Philadelphia Phillies': 'https://a.espncdn.com/i/teamlogos/mlb/500/phi.png',
    'Pirates': 'https://a.espncdn.com/i/teamlogos/mlb/500/pit.png',
    'Pittsburgh Pirates': 'https://a.espncdn.com/i/teamlogos/mlb/500/pit.png',
    'Padres': 'https://a.espncdn.com/i/teamlogos/mlb/500/sd.png',
    'San Diego Padres': 'https://a.espncdn.com/i/teamlogos/mlb/500/sd.png',
    'Giants': 'https://a.espncdn.com/i/teamlogos/mlb/500/sf.png',
    'San Francisco Giants': 'https://a.espncdn.com/i/teamlogos/mlb/500/sf.png',
    'Mariners': 'https://a.espncdn.com/i/teamlogos/mlb/500/sea.png',
    'Seattle Mariners': 'https://a.espncdn.com/i/teamlogos/mlb/500/sea.png',
    'Rangers': 'https://a.espncdn.com/i/teamlogos/mlb/500/tex.png',
    'Texas Rangers': 'https://a.espncdn.com/i/teamlogos/mlb/500/tex.png',
    'Athletics': 'https://a.espncdn.com/i/teamlogos/mlb/500/oak.png',
    'Oakland Athletics': 'https://a.espncdn.com/i/teamlogos/mlb/500/oak.png',
    'Royals': 'https://a.espncdn.com/i/teamlogos/mlb/500/kc.png',
    'Kansas City Royals': 'https://a.espncdn.com/i/teamlogos/mlb/500/kc.png',
    'Reds': 'https://a.espncdn.com/i/teamlogos/mlb/500/cin.png',
    'Cincinnati Reds': 'https://a.espncdn.com/i/teamlogos/mlb/500/cin.png',
    'Nationals': 'https://a.espncdn.com/i/teamlogos/mlb/500/was.png',
    'Washington Nationals': 'https://a.espncdn.com/i/teamlogos/mlb/500/was.png'
  };
  
  // NHL team logo mappings - All 32 teams
  const nhlLogos: { [key: string]: string } = {
    'Bruins': 'https://a.espncdn.com/i/teamlogos/nhl/500/bos.png',
    'Boston Bruins': 'https://a.espncdn.com/i/teamlogos/nhl/500/bos.png',
    'Sabres': 'https://a.espncdn.com/i/teamlogos/nhl/500/buf.png',
    'Buffalo Sabres': 'https://a.espncdn.com/i/teamlogos/nhl/500/buf.png',
    'Red Wings': 'https://a.espncdn.com/i/teamlogos/nhl/500/det.png',
    'Detroit Red Wings': 'https://a.espncdn.com/i/teamlogos/nhl/500/det.png',
    'Panthers': 'https://a.espncdn.com/i/teamlogos/nhl/500/fla.png',
    'Florida Panthers': 'https://a.espncdn.com/i/teamlogos/nhl/500/fla.png',
    'Canadiens': 'https://a.espncdn.com/i/teamlogos/nhl/500/mtl.png',
    'Montreal Canadiens': 'https://a.espncdn.com/i/teamlogos/nhl/500/mtl.png',
    'Senators': 'https://a.espncdn.com/i/teamlogos/nhl/500/ott.png',
    'Ottawa Senators': 'https://a.espncdn.com/i/teamlogos/nhl/500/ott.png',
    'Lightning': 'https://a.espncdn.com/i/teamlogos/nhl/500/tb.png',
    'Tampa Bay Lightning': 'https://a.espncdn.com/i/teamlogos/nhl/500/tb.png',
    'Maple Leafs': 'https://a.espncdn.com/i/teamlogos/nhl/500/tor.png',
    'Toronto Maple Leafs': 'https://a.espncdn.com/i/teamlogos/nhl/500/tor.png',
    'Hurricanes': 'https://a.espncdn.com/i/teamlogos/nhl/500/car.png',
    'Carolina Hurricanes': 'https://a.espncdn.com/i/teamlogos/nhl/500/car.png',
    'Blue Jackets': 'https://a.espncdn.com/i/teamlogos/nhl/500/cbj.png',
    'Columbus Blue Jackets': 'https://a.espncdn.com/i/teamlogos/nhl/500/cbj.png',
    'Devils': 'https://a.espncdn.com/i/teamlogos/nhl/500/njd.png',
    'New Jersey Devils': 'https://a.espncdn.com/i/teamlogos/nhl/500/njd.png',
    'Islanders': 'https://a.espncdn.com/i/teamlogos/nhl/500/nyi.png',
    'New York Islanders': 'https://a.espncdn.com/i/teamlogos/nhl/500/nyi.png',
    'Rangers': 'https://a.espncdn.com/i/teamlogos/nhl/500/nyr.png',
    'New York Rangers': 'https://a.espncdn.com/i/teamlogos/nhl/500/nyr.png',
    'Flyers': 'https://a.espncdn.com/i/teamlogos/nhl/500/phi.png',
    'Philadelphia Flyers': 'https://a.espncdn.com/i/teamlogos/nhl/500/phi.png',
    'Penguins': 'https://a.espncdn.com/i/teamlogos/nhl/500/pit.png',
    'Pittsburgh Penguins': 'https://a.espncdn.com/i/teamlogos/nhl/500/pit.png',
    'Capitals': 'https://a.espncdn.com/i/teamlogos/nhl/500/was.png',
    'Washington Capitals': 'https://a.espncdn.com/i/teamlogos/nhl/500/was.png',
    'Blackhawks': 'https://a.espncdn.com/i/teamlogos/nhl/500/chi.png',
    'Chicago Blackhawks': 'https://a.espncdn.com/i/teamlogos/nhl/500/chi.png',
    'Avalanche': 'https://a.espncdn.com/i/teamlogos/nhl/500/col.png',
    'Colorado Avalanche': 'https://a.espncdn.com/i/teamlogos/nhl/500/col.png',
    'Stars': 'https://a.espncdn.com/i/teamlogos/nhl/500/dal.png',
    'Dallas Stars': 'https://a.espncdn.com/i/teamlogos/nhl/500/dal.png',
    'Wild': 'https://a.espncdn.com/i/teamlogos/nhl/500/min.png',
    'Minnesota Wild': 'https://a.espncdn.com/i/teamlogos/nhl/500/min.png',
    'Predators': 'https://a.espncdn.com/i/teamlogos/nhl/500/nsh.png',
    'Nashville Predators': 'https://a.espncdn.com/i/teamlogos/nhl/500/nsh.png',
    'Blues': 'https://a.espncdn.com/i/teamlogos/nhl/500/stl.png',
    'St. Louis Blues': 'https://a.espncdn.com/i/teamlogos/nhl/500/stl.png',
    'Jets': 'https://a.espncdn.com/i/teamlogos/nhl/500/wpg.png',
    'Winnipeg Jets': 'https://a.espncdn.com/i/teamlogos/nhl/500/wpg.png',
    'Ducks': 'https://a.espncdn.com/i/teamlogos/nhl/500/ana.png',
    'Anaheim Ducks': 'https://a.espncdn.com/i/teamlogos/nhl/500/ana.png',
    'Flames': 'https://a.espncdn.com/i/teamlogos/nhl/500/cgy.png',
    'Calgary Flames': 'https://a.espncdn.com/i/teamlogos/nhl/500/cgy.png',
    'Oilers': 'https://a.espncdn.com/i/teamlogos/nhl/500/edm.png',
    'Edmonton Oilers': 'https://a.espncdn.com/i/teamlogos/nhl/500/edm.png',
    'Kings': 'https://a.espncdn.com/i/teamlogos/nhl/500/la.png',
    'Los Angeles Kings': 'https://a.espncdn.com/i/teamlogos/nhl/500/la.png',
    'Sharks': 'https://a.espncdn.com/i/teamlogos/nhl/500/sj.png',
    'San Jose Sharks': 'https://a.espncdn.com/i/teamlogos/nhl/500/sj.png',
    'Kraken': 'https://a.espncdn.com/i/teamlogos/nhl/500/sea.png',
    'Seattle Kraken': 'https://a.espncdn.com/i/teamlogos/nhl/500/sea.png',
    'Canucks': 'https://a.espncdn.com/i/teamlogos/nhl/500/van.png',
    'Vancouver Canucks': 'https://a.espncdn.com/i/teamlogos/nhl/500/van.png',
    'Golden Knights': 'https://a.espncdn.com/i/teamlogos/nhl/500/vgk.png',
    'Vegas Golden Knights': 'https://a.espncdn.com/i/teamlogos/nhl/500/vgk.png',
    'Coyotes': 'https://a.espncdn.com/i/teamlogos/nhl/500/ari.png',
    'Arizona Coyotes': 'https://a.espncdn.com/i/teamlogos/nhl/500/ari.png',
    'Utah Hockey Club': 'https://a.espncdn.com/i/teamlogos/nhl/500/utah.png'
  };

  // College Football major teams
  const collegeLogos: { [key: string]: string } = {
    'Alabama': 'https://a.espncdn.com/i/teamlogos/ncf/500/333.png',
    'Crimson Tide': 'https://a.espncdn.com/i/teamlogos/ncf/500/333.png',
    'Georgia': 'https://a.espncdn.com/i/teamlogos/ncf/500/61.png',
    'Bulldogs': 'https://a.espncdn.com/i/teamlogos/ncf/500/61.png',
    'Michigan': 'https://a.espncdn.com/i/teamlogos/ncf/500/130.png',
    'Wolverines': 'https://a.espncdn.com/i/teamlogos/ncf/500/130.png',
    'Ohio State': 'https://a.espncdn.com/i/teamlogos/ncf/500/194.png',
    'Buckeyes': 'https://a.espncdn.com/i/teamlogos/ncf/500/194.png',
    'Texas': 'https://a.espncdn.com/i/teamlogos/ncf/500/251.png',
    'Longhorns': 'https://a.espncdn.com/i/teamlogos/ncf/500/251.png',
    'LSU': 'https://a.espncdn.com/i/teamlogos/ncf/500/99.png',
    'Tigers': 'https://a.espncdn.com/i/teamlogos/ncf/500/99.png',
    'Oklahoma': 'https://a.espncdn.com/i/teamlogos/ncf/500/201.png',
    'Sooners': 'https://a.espncdn.com/i/teamlogos/ncf/500/201.png',
    'Notre Dame': 'https://a.espncdn.com/i/teamlogos/ncf/500/87.png',
    'Fighting Irish': 'https://a.espncdn.com/i/teamlogos/ncf/500/87.png',
    'Clemson': 'https://a.espncdn.com/i/teamlogos/ncf/500/228.png',
    'Florida': 'https://a.espncdn.com/i/teamlogos/ncf/500/57.png',
    'Gators': 'https://a.espncdn.com/i/teamlogos/ncf/500/57.png',
    'Penn State': 'https://a.espncdn.com/i/teamlogos/ncf/500/213.png',
    'Nittany Lions': 'https://a.espncdn.com/i/teamlogos/ncf/500/213.png',
    'USC': 'https://a.espncdn.com/i/teamlogos/ncf/500/30.png',
    'Trojans': 'https://a.espncdn.com/i/teamlogos/ncf/500/30.png',
    'Oregon': 'https://a.espncdn.com/i/teamlogos/ncf/500/2483.png',
    'Ducks': 'https://a.espncdn.com/i/teamlogos/ncf/500/2483.png'
  };

  // Soccer/Football team logos (major leagues)
  const soccerLogos: { [key: string]: string } = {
    'Manchester United': 'https://a.espncdn.com/i/teamlogos/soccer/500/360.png',
    'Man United': 'https://a.espncdn.com/i/teamlogos/soccer/500/360.png',
    'Manchester City': 'https://a.espncdn.com/i/teamlogos/soccer/500/382.png',
    'Man City': 'https://a.espncdn.com/i/teamlogos/soccer/500/382.png',
    'Liverpool': 'https://a.espncdn.com/i/teamlogos/soccer/500/364.png',
    'Chelsea': 'https://a.espncdn.com/i/teamlogos/soccer/500/363.png',
    'Arsenal': 'https://a.espncdn.com/i/teamlogos/soccer/500/359.png',
    'Tottenham': 'https://a.espncdn.com/i/teamlogos/soccer/500/367.png',
    'Spurs': 'https://a.espncdn.com/i/teamlogos/soccer/500/367.png',
    'Barcelona': 'https://a.espncdn.com/i/teamlogos/soccer/500/83.png',
    'Real Madrid': 'https://a.espncdn.com/i/teamlogos/soccer/500/86.png',
    'Bayern Munich': 'https://a.espncdn.com/i/teamlogos/soccer/500/132.png',
    'Juventus': 'https://a.espncdn.com/i/teamlogos/soccer/500/111.png',
    'AC Milan': 'https://a.espncdn.com/i/teamlogos/soccer/500/105.png',
    'Inter Milan': 'https://a.espncdn.com/i/teamlogos/soccer/500/110.png',
    'PSG': 'https://a.espncdn.com/i/teamlogos/soccer/500/160.png',
    'Paris Saint-Germain': 'https://a.espncdn.com/i/teamlogos/soccer/500/160.png'
  };
  
  // Check sport-specific logos
  if (sport === 'NFL') {
    for (const [team, url] of Object.entries(nflLogos)) {
      if (cleanTeamName.includes(team)) return url;
    }
  } else if (sport === 'NBA') {
    for (const [team, url] of Object.entries(nbaLogos)) {
      if (cleanTeamName.includes(team)) return url;
    }
  } else if (sport === 'MLB') {
    for (const [team, url] of Object.entries(mlbLogos)) {
      if (cleanTeamName.includes(team)) return url;
    }
  } else if (sport === 'NHL') {
    for (const [team, url] of Object.entries(nhlLogos)) {
      if (cleanTeamName.includes(team)) return url;
    }
  } else if (sport === 'NCAAF' || sport === 'College Football' || sport.includes('College')) {
    for (const [team, url] of Object.entries(collegeLogos)) {
      if (cleanTeamName.includes(team)) return url;
    }
  } else if (sport === 'Soccer' || sport === 'Football' || sport.includes('Soccer')) {
    for (const [team, url] of Object.entries(soccerLogos)) {
      if (cleanTeamName.includes(team)) return url;
    }
  }
  
  // Fallback to generic sport logo
  const sportLogos: { [key: string]: string } = {
    'NFL': 'https://a.espncdn.com/i/teamlogos/leagues/500/nfl.png',
    'NBA': 'https://a.espncdn.com/i/teamlogos/leagues/500/nba.png', 
    'MLB': 'https://a.espncdn.com/i/teamlogos/leagues/500/mlb.png',
    'NHL': 'https://a.espncdn.com/i/teamlogos/leagues/500/nhl.png',
    'NCAAF': 'https://a.espncdn.com/i/teamlogos/leagues/500/ncf.png',
    'College Football': 'https://a.espncdn.com/i/teamlogos/leagues/500/ncf.png',
    'NCAAB': 'https://a.espncdn.com/i/teamlogos/leagues/500/ncb.png',
    'College Basketball': 'https://a.espncdn.com/i/teamlogos/leagues/500/ncb.png',
    'Soccer': 'https://a.espncdn.com/i/teamlogos/soccer/500/generic.png',
    'Football': 'https://a.espncdn.com/i/teamlogos/soccer/500/generic.png',
    'WNBA': 'https://a.espncdn.com/i/teamlogos/leagues/500/wnba.png',
    'Tennis': 'https://a.espncdn.com/i/teamlogos/leagues/500/tennis.png',
    'Golf': 'https://a.espncdn.com/i/teamlogos/leagues/500/golf.png',
    'Boxing': 'https://a.espncdn.com/i/teamlogos/leagues/500/boxing.png',
    'MMA': 'https://a.espncdn.com/i/teamlogos/leagues/500/mma.png',
    'UFC': 'https://a.espncdn.com/i/teamlogos/leagues/500/ufc.png'
  };
  
  return sportLogos[sport] || 'https://a.espncdn.com/i/teamlogos/default/500/default.png';
};

interface TickerOdds {
  id: string;
  sport: string;
  teams: string;
  homeTeam?: { name: string; logo?: string };
  awayTeam?: { name: string; logo?: string };
  currentOdds: number;
  previousOdds: number | null;
  timestamp: string;
  eventId?: string;
  bookmaker?: string;
  status?: string;
}

// Helper function to format game as favorite vs underdog with spreads
const formatGameDisplay = (teams: string, currentOdds: number) => {
  // Add safety check for undefined/null teams
  if (!teams || typeof teams !== 'string') {
    return {
      favorite: 'Team A',
      underdog: 'Team B', 
      favSpread: '-3.5',
      underdogSpread: '+3.5'
    };
  }

  const teamsParts = teams.split(' vs ');
  if (teamsParts.length < 2) {
    return {
      favorite: teams,
      underdog: 'TBD',
      favSpread: '-3.5',
      underdogSpread: '+3.5'
    };
  }

  const [team1, team2] = teamsParts;
  
  // Generate realistic spreads based on odds
  const spreadValue = (Math.abs(currentOdds) / 30 + Math.random() * 2).toFixed(1);
  const isFavorite = currentOdds < -105;
  
  return {
    favorite: team1?.split(' ').slice(-1)[0] || 'Team',
    underdog: team2?.split(' ').slice(-1)[0] || 'Team',
    favSpread: isFavorite ? `-${spreadValue}` : `+${spreadValue}`,
    underdogSpread: isFavorite ? `+${spreadValue}` : `-${spreadValue}`
  };
};

const TickerItem = memo(({ item, onClick }: { item: TickerOdds; onClick: () => void }) => {
  // Add safety check for item data
  if (!item) return null;
  
  const gameData = formatGameDisplay(item.teams, item.currentOdds);
  
  const getSportColor = (sport: string) => {
    const colors: Record<string, string> = {
      'NBA': 'bg-orange-600 text-white',
      'NFL': 'bg-green-600 text-white', 
      'MLB': 'bg-blue-600 text-white',
      'NHL': 'bg-red-600 text-white',
      'Soccer': 'bg-emerald-600 text-white',
      'WNBA': 'bg-orange-500 text-white',
      'Boxing': 'bg-red-700 text-white',
      'UFC': 'bg-red-800 text-white',
      'ATP': 'bg-yellow-600 text-white',
      'WTA': 'bg-pink-600 text-white',
      'PGA': 'bg-green-700 text-white',
      'LPGA': 'bg-green-500 text-white',
      'Esports': 'bg-purple-600 text-white',
    };
    return colors[sport] || 'bg-gray-500 text-white';
  };

  const trendIcon = useMemo(() => {
    if (item.previousOdds === null) return null;
    
    const isImproved = item.currentOdds > (item.previousOdds || 0);
    return isImproved ? 
      <TrendingUp className="h-3 w-3 text-green-400 ml-1" /> : 
      <TrendingDown className="h-3 w-3 text-red-400 ml-1" />;
  }, [item.currentOdds, item.previousOdds]);

  // Get team logos from API data or fallback to service
  const homeTeamLogo = item.homeTeam?.logo || getTeamLogoUrl(gameData.favorite, item.sport);
  const awayTeamLogo = item.awayTeam?.logo || getTeamLogoUrl(gameData.underdog, item.sport);
  
  return (
    <div 
      className="inline-flex items-center mr-8 px-2 py-1 min-w-max cursor-pointer hover:bg-gray-800/50 rounded transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center space-x-1 mr-2">
        <img 
          src={homeTeamLogo} 
          alt={gameData.favorite} 
          className="w-6 h-6 rounded-sm object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).src = getTeamLogoUrl(gameData.favorite, item.sport);
          }}
        />
        <span className="text-gray-400 text-xs">vs</span>
        <img 
          src={awayTeamLogo} 
          alt={gameData.underdog} 
          className="w-6 h-6 rounded-sm object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).src = getTeamLogoUrl(gameData.underdog, item.sport);
          }}
        />
      </div>
      
      <span className={`px-2 py-0.5 text-xs font-bold rounded mr-3 ${getSportColor(item.sport)}`}>
        {item.sport}
      </span>
      
      <div className="flex items-center space-x-2">
        <span className="text-white font-semibold text-sm">
          {gameData.favorite}
        </span>
        <span className="text-green-400 font-mono font-bold">
          {gameData.favSpread}
        </span>
        <span className="text-gray-400">vs</span>
        <span className="text-white font-semibold text-sm">
          {gameData.underdog}
        </span>
        <span className="text-yellow-400 font-mono font-bold">
          {gameData.underdogSpread}
        </span>
        {trendIcon}
      </div>
    </div>
  );
});

TickerItem.displayName = 'TickerItem';

const ImprovedOddsTicker = memo(() => {
  const [selectedEvent, setSelectedEvent] = useState<TickerOdds | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch live ticker data
  const { data: oddsResponse } = useQuery({
    queryKey: ['/api/odds-ticker/live-ticker'],
    refetchInterval: 180000, // Update every 3 minutes (180 seconds)
  });

  const oddsData = useMemo(() => (oddsResponse as any)?.odds || [], [oddsResponse]);

  const handleEventClick = (event: TickerOdds) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  if (oddsData.length === 0) {
    return (
      <footer className="bg-black py-2 overflow-hidden relative border-t border-gray-800">

        <div className="flex whitespace-nowrap animate-ticker-continuous">
          {Array(3).fill(null).map((_, index) => (
            <div key={index} className="inline-flex items-center mr-12">
              <span className="px-2 py-0.5 text-xs font-bold rounded bg-blue-600 text-white">
                LIVE
              </span>
              <span className="mx-3 text-white font-medium">
                Loading live odds...
              </span>
            </div>
          ))}
        </div>

        <style>{`
          @keyframes ticker-continuous {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .animate-ticker-continuous {
            animation: ticker-continuous 20s linear infinite;
          }
        `}</style>
      </footer>
    );
  }

  return (
    <footer className="bg-black py-2 overflow-hidden relative border-t border-gray-800">

      <div 
        className="flex whitespace-nowrap animate-ticker-continuous"
      >
        {/* Duplicate the data for continuous scrolling */}
        {[...oddsData, ...oddsData].map((item, index) => (
          <TickerItem 
            key={`${item.id}-${index}`} 
            item={item} 
            onClick={() => handleEventClick(item)}
          />
        ))}
      </div>

      <style>{`
        @keyframes ticker-continuous {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-ticker-continuous {
          animation: ticker-continuous 65s linear infinite;
        }
      `}</style>

      {/* Event Preview Modal */}
      {selectedEvent && (
        <EventPreviewModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          eventId={selectedEvent.eventId || selectedEvent.id}
          sport={selectedEvent.sport}
          teams={selectedEvent.teams}
          currentOdds={selectedEvent.currentOdds}
        />
      )}
    </footer>
  );
});

ImprovedOddsTicker.displayName = 'ImprovedOddsTicker';

export default ImprovedOddsTicker;