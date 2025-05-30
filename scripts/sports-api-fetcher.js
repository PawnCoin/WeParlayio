
const fs = require('fs');
const https = require('https');
const path = require('path');

// Free APIs for sports data that might include logos/icons
const sportsAPIs = {
  // TheSportsDB - Free sports database with team logos
  getSportsList: () => 'https://www.thesportsdb.com/api/v1/json/1/all_sports.php',
  getLeagues: () => 'https://www.thesportsdb.com/api/v1/json/1/all_leagues.php',
  
  // Sports Open Data
  getSportsOpenData: () => 'https://api.sportradar.us/soccer/trial/v4/en/sport_events/live/summary.json'
};

// Function to fetch sports data and extract logo URLs
async function fetchSportsData() {
  console.log('🏆 Fetching sports data from free APIs...\n');
  
  try {
    // Fetch all sports from TheSportsDB
    const sportsData = await fetchJSON(sportsAPIs.getSportsList());
    const leaguesData = await fetchJSON(sportsAPIs.getLeagues());
    
    if (sportsData && sportsData.sports) {
      console.log('📊 Available Sports:');
      sportsData.sports.forEach(sport => {
        console.log(`- ${sport.strSport}: ${sport.strSportDescription}`);
        if (sport.strSportThumb) {
          console.log(`  Icon: ${sport.strSportThumb}`);
        }
      });
    }
    
    if (leaguesData && leaguesData.leagues) {
      console.log('\n🏆 Available Leagues:');
      leaguesData.leagues.slice(0, 20).forEach(league => {
        console.log(`- ${league.strLeague} (${league.strSport})`);
        if (league.strBadge) {
          console.log(`  Logo: ${league.strBadge}`);
        }
      });
    }
    
  } catch (error) {
    console.error('Error fetching sports data:', error.message);
  }
}

async function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// Generate a list of recommended free icon sources
function generateIconSources() {
  const sources = `
# Free Sports Icon Sources

## Recommended Free Sources:
1. **Icons8** (https://icons8.com/icons/set/sports) - Free with attribution
2. **Flaticon** (https://www.flaticon.com/search?word=sports) - Free with attribution  
3. **Simple Icons** (https://simpleicons.org/) - MIT licensed
4. **Feather Icons** (https://feathericons.com/) - MIT licensed
5. **Heroicons** (https://heroicons.com/) - MIT licensed

## API Sources for Logos:
1. **TheSportsDB** (https://www.thesportsdb.com/api.php) - Free sports database
2. **ESPN API** (Limited access to team logos)
3. **SportsRadar** (Trial API available)

## Legal Notice:
- Always check licensing before using
- Many professional league logos are trademarked
- Use official logos only with permission
- Consider using generic sport icons for commercial use

## Download Instructions:
1. Run: node scripts/download-sports-icons.js
2. Manually download from sources above
3. Use team logo APIs where available
4. Always respect copyright and trademark laws
`;
  
  fs.writeFileSync(path.join(__dirname, '../client/src/assets/sports/icon-sources.md'), sources);
  console.log('📝 Created icon sources guide at: client/src/assets/sports/icon-sources.md');
}

// Run the fetcher
fetchSportsData().then(() => {
  generateIconSources();
});
