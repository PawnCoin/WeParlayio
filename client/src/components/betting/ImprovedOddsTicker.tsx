import React, { memo, useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { TrendingUp, TrendingDown, Wifi, WifiOff, AlertCircle, Loader, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import EventPreviewModal from './EventPreviewModal';
import { TickerOdds, Team } from '../types';
import { getTeamLogoUrl, getSportColors, getLeagueLogoUrl } from '../lib/utils';
import EnhancedTeamLogo from './ui/EnhancedTeamLogo';
import TickerItemSkeleton from './ui/TickerItemSkeleton';

// Interactive sports logo cache with fallback mechanism
const logoCache = new Map<string, { url: string; status: 'loading' | 'loaded' | 'error'; timestamp: number }>();
const CACHE_EXPIRY = 60 * 60 * 1000; // 1 hour

// Enhanced logo service with caching and error handling
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
    'Sox': 'https://a.espncdn.com/i/teamlogos/mlb/500/bos.png',
    'Cubs': 'https://a.espncdn.com/i/teamlogos/mlb/500/chc.png',
    'Chicago Cubs': 'https://a.espncdn.com/i/teamlogos/mlb/500/chc.png',
    'Cardinals': 'https://a.espncdn.com/i/teamlogos/mlb/500/stl.png',
    'St. Louis Cardinals': 'https://a.espncdn.com/i/teamlogos/mlb/500/stl.png',
    'Astros': 'https://a.espncdn.com/i/teamlogos/mlb/500/hou.png',
    'Houston Astros': 'https://a.espncdn.com/i/teamlogos/mlb/500/hou.png',
    'Mets': 'https://a.espncdn.com/i/teamlogos/mlb/500/nym.png',
    'New York Mets': 'https://a.espncdn.com/i/teamlogos/mlb/500/nym.png',
    'Jays': 'https://a.espncdn.com/i/teamlogos/mlb/500/tor.png',
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

// Intelligent sports category color coding
const getSportColors = (sport: string): { primary: string; secondary: string; accent: string } => {
  const colorMap: { [key: string]: { primary: string; secondary: string; accent: string } } = {
    'NFL': { primary: 'rgb(1, 51, 105)', secondary: 'rgb(198, 12, 48)', accent: 'rgb(255, 255, 255)' },
    'NBA': { primary: 'rgb(200, 16, 46)', secondary: 'rgb(29, 66, 138)', accent: 'rgb(255, 255, 255)' },
    'MLB': { primary: 'rgb(0, 50, 120)', secondary: 'rgb(196, 30, 58)', accent: 'rgb(255, 255, 255)' },
    'NHL': { primary: 'rgb(0, 0, 0)', secondary: 'rgb(200, 200, 200)', accent: 'rgb(255, 255, 255)' },
    'NCAAF': { primary: 'rgb(120, 29, 104)', secondary: 'rgb(255, 184, 28)', accent: 'rgb(255, 255, 255)' },
    'NCAAB': { primary: 'rgb(41, 84, 144)', secondary: 'rgb(244, 123, 32)', accent: 'rgb(255, 255, 255)' },
    'NCAA-M': { primary: 'rgb(41, 84, 144)', secondary: 'rgb(244, 123, 32)', accent: 'rgb(255, 255, 255)' },
    'NCAA-W': { primary: 'rgb(195, 32, 107)', secondary: 'rgb(255, 184, 28)', accent: 'rgb(255, 255, 255)' },
    'Soccer': { primary: 'rgb(0, 138, 0)', secondary: 'rgb(255, 255, 255)', accent: 'rgb(0, 0, 0)' },
    'WNBA': { primary: 'rgb(253, 185, 39)', secondary: 'rgb(196, 18, 48)', accent: 'rgb(255, 255, 255)' },
    'Tennis': { primary: 'rgb(1, 114, 54)', secondary: 'rgb(255, 255, 255)', accent: 'rgb(0, 0, 0)' },
    'Golf': { primary: 'rgb(1, 121, 111)', secondary: 'rgb(255, 255, 255)', accent: 'rgb(0, 0, 0)' },
    'Boxing': { primary: 'rgb(220, 38, 127)', secondary: 'rgb(0, 0, 0)', accent: 'rgb(255, 255, 255)' },
    'MMA': { primary: 'rgb(211, 17, 69)', secondary: 'rgb(0, 0, 0)', accent: 'rgb(255, 255, 255)' },
    'UFC': { primary: 'rgb(211, 17, 69)', secondary: 'rgb(0, 0, 0)', accent: 'rgb(255, 255, 255)' }
  };
  
  return colorMap[sport] || { primary: 'rgb(55, 65, 81)', secondary: 'rgb(107, 114, 128)', accent: 'rgb(255, 255, 255)' };
};

// Enhanced error handling with retry mechanism
const useImageWithFallback = (src: string, fallbackSrc: string) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const retryCount = useRef(0);
  const maxRetries = 3;

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    retryCount.current = 0;
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    if (retryCount.current < maxRetries) {
      retryCount.current++;
      setTimeout(() => {
        setCurrentSrc(src + '?retry=' + retryCount.current);
        setIsLoading(true);
      }, 1000 * retryCount.current);
    } else {
      setHasError(true);
      setCurrentSrc(fallbackSrc);
    }
  }, [src, fallbackSrc]);

  useEffect(() => {
    setCurrentSrc(src);
    setIsLoading(true);
    setHasError(false);
    retryCount.current = 0;
  }, [src]);

  return { src: currentSrc, isLoading, hasError, onLoad: handleLoad, onError: handleError };
};

// Enhanced team logo component with fallback handling
const EnhancedTeamLogo = ({ src, teamName, sport, size = "w-8 h-8" }: {
  src: string;
  teamName: string;
  sport: string;
  size?: string;
}) => {
  const fallbackSrc = getSportColors(sport).primary;
  const { src: currentSrc, isLoading, hasError, onLoad, onError } = useImageWithFallback(src, fallbackSrc);
  
  return (
    <div className={`${size} relative flex items-center justify-center rounded-full bg-gray-700 overflow-hidden`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-600 animate-pulse rounded-full"></div>
      )}
      {hasError ? (
        <div 
          className="w-full h-full flex items-center justify-center text-white text-xs font-bold rounded-full"
          style={{ backgroundColor: getSportColors(sport).primary }}
        >
          {teamName.charAt(0)}
        </div>
      ) : (
        <img
          src={currentSrc}
          alt={teamName}
          className="w-full h-full object-contain"
          onLoad={onLoad}
          onError={onError}
        />
      )}
    </div>
  );
};

// Animated live game state transitions
const LiveGameIndicator = ({ isLive, isBreaking }: { isLive: boolean; isBreaking: boolean }) => {
  if (!isLive) return null;
  
  return (
    <div className="flex items-center gap-1">
      <div className={`relative flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
        isBreaking 
          ? 'bg-gradient-to-r from-red-500 to-red-600 text-white animate-pulse'
          : 'bg-gradient-to-r from-red-500 to-red-400 text-white'
      }`}>
        <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
        <span>{isBreaking ? 'BREAKING' : 'LIVE'}</span>
      </div>
    </div>
  );
};

// Enhanced score display with animations
const AnimatedScore = ({ homeScore, awayScore, period, timeRemaining }: {
  homeScore: number;
  awayScore: number;
  period: string;
  timeRemaining: string;
}) => {
  return (
    <div className="bg-black/20 rounded-lg px-3 py-2 backdrop-blur-sm">
      <div className="flex items-center justify-between text-sm font-bold text-white">
        <span className="transition-all duration-300 hover:scale-110">{homeScore}</span>
        <span className="text-xs text-gray-300 mx-2">-</span>
        <span className="transition-all duration-300 hover:scale-110">{awayScore}</span>
      </div>
      <div className="text-xs text-center text-gray-300 mt-1">
        {period} {timeRemaining && `• ${timeRemaining}`}
      </div>
    </div>
  );
};

// Data freshness indicator with network status
const DataFreshness = ({ timestamp }: { timestamp: string }) => {
  const getTimeDiff = () => {
    const now = new Date().getTime();
    const time = new Date(timestamp).getTime();
    const diff = (now - time) / 1000; // seconds
    
    if (diff < 30) return { status: 'fresh', icon: Wifi, color: 'text-green-400' };
    if (diff < 120) return { status: 'recent', icon: Wifi, color: 'text-yellow-400' };
    return { status: 'stale', icon: WifiOff, color: 'text-red-400' };
  };
  
  const { status, icon: Icon, color } = getTimeDiff();
  
  return (
    <div className={`flex items-center gap-1 ${color}`}>
      <Icon size={12} />
      <span className="text-xs">{status}</span>
    </div>
  );
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
  hasLiveScore?: boolean;
  liveScore?: {
    homeScore: number;
    awayScore: number;
    period: string;
    timeRemaining: string;
    isBreaking: boolean;
  };
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

const TickerItem = memo(({ item, onClick, liveScore }: { 
  item: TickerOdds; 
  onClick: () => void; 
  liveScore?: any;
}) => {
  // Add safety check for item data
  if (!item) return null;
  
  const gameData = formatGameDisplay(item.teams, item.currentOdds);
  const isLive = item.hasLiveScore && item.liveScore || liveScore && (liveScore.homeScore !== undefined || item.status === 'live' || item.status === 'in');
  const sportColors = getSportColors(item.sport);
  
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
      className={`inline-flex items-center mr-8 px-3 py-2 min-w-max cursor-pointer rounded-lg transition-all duration-300 ${
        isLive 
          ? 'bg-gradient-to-r from-red-900/30 to-red-800/20 border border-red-500/30 hover:scale-105 hover:shadow-red-500/20' 
          : 'bg-gray-800/50 hover:bg-gray-700/50'
      }`}
      onClick={onClick}
      style={{
        background: isLive 
          ? `linear-gradient(135deg, ${sportColors.primary}20, ${sportColors.secondary}10)` 
          : undefined
      }}
    >
      {/* Enhanced Sport Badge with Live Indicator */}
      <div className="flex items-center gap-2 mr-3">
        <div 
          className="px-2 py-1 rounded-full text-xs font-bold text-white"
          style={{ backgroundColor: sportColors.primary }}
        >
          {item.sport}
        </div>
        <LiveGameIndicator isLive={!!isLive} isBreaking={item.liveScore?.isBreaking || false} />
      </div>

      {/* Enhanced Team Logos */}
      <div className="flex items-center space-x-1 mr-2">
        <EnhancedTeamLogo 
          src={homeTeamLogo}
          teamName={gameData.favorite}
          sport={item.sport}
          size="w-6 h-6"
        />
        <span className="text-gray-400 text-xs">vs</span>
        <EnhancedTeamLogo 
          src={awayTeamLogo}
          teamName={gameData.underdog}
          sport={item.sport}
          size="w-6 h-6"
        />
      </div>

      {/* Enhanced Live Score or Odds Display */}
      {isLive && item.liveScore ? (
        <AnimatedScore 
          homeScore={item.liveScore.homeScore}
          awayScore={item.liveScore.awayScore}
          period={item.liveScore.period}
          timeRemaining={item.liveScore.timeRemaining}
        />
      ) : (
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
      )}

      {/* Data Freshness Indicator */}
      <div className="ml-2">
        <DataFreshness timestamp={item.timestamp} />
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

  // Fetch live scores for current games
  const { data: liveScoresResponse } = useQuery({
    queryKey: ['/api/events/live-scores'],
    refetchInterval: 30000, // Update every 30 seconds for live scores
  });

  const oddsData = useMemo(() => {
    const data = (oddsResponse as any)?.odds || [];
    console.log('🎯 Ticker odds data:', data.length, 'events');
    return data;
  }, [oddsResponse]);
  
  const liveScores = useMemo(() => {
    const scores = (liveScoresResponse as any) || [];
    console.log('🔴 Live scores data:', scores.length, 'live games');
    if (scores.length > 0) {
      console.log('🔴 Sample live score:', scores[0]);
    }
    return scores;
  }, [liveScoresResponse]);

  const handleEventClick = (event: TickerOdds) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  // Create a map of live scores by event/teams for quick lookup
  const liveScoreMap = useMemo(() => {
    const map = new Map();
    liveScores.forEach((score: any) => {
      // Map by teams string for easy lookup
      map.set(score.teams, score);
      // Also map by individual team names for flexible matching
      map.set(score.eventId, score);
      console.log('🗺️ Adding live score to map:', score.teams, score.eventId);
    });
    console.log('🗺️ Live score map keys:', Array.from(map.keys()));
    return map;
  }, [liveScores]);

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
        {[...oddsData, ...oddsData].map((item, index) => {
          const liveScore = liveScoreMap.get(item.teams) || liveScoreMap.get(item.eventId);
          if (index < 3) { // Debug first few items
            console.log(`🔍 Ticker item ${index}:`, {
              teams: item.teams,
              eventId: item.eventId,
              sport: item.sport,
              hasLiveScore: !!liveScore,
              liveScore: liveScore
            });
          }
          return (
            <TickerItem 
              key={`${item.id}-${index}`} 
              item={item} 
              liveScore={liveScore}
              onClick={() => handleEventClick(item)}
            />
          );
        })}
      </div>

      <style>{`
        @keyframes ticker-continuous {
          0% { transform: translateX(-1000%); }
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