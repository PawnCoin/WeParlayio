
const fs = require('fs');
const https = require('https');
const path = require('path');

// Free sports icons from various sources
const sportsIcons = {
  // Basic sport icons (free from icons8, flaticon, etc.)
  basketball: 'https://img.icons8.com/ios/452/basketball.png',
  football: 'https://img.icons8.com/ios/452/american-football.png',
  baseball: 'https://img.icons8.com/ios/452/baseball.png',
  hockey: 'https://img.icons8.com/ios/452/hockey.png',
  soccer: 'https://img.icons8.com/ios/452/soccer-ball.png',
  tennis: 'https://img.icons8.com/ios/452/tennis.png',
  golf: 'https://img.icons8.com/ios/452/golf.png',
  boxing: 'https://img.icons8.com/ios/452/boxing-glove.png',
  mma: 'https://img.icons8.com/ios/452/wrestling.png',
  cricket: 'https://img.icons8.com/ios/452/cricket.png',
  rugby: 'https://img.icons8.com/ios/452/rugby.png',
  
  // Alternative source - Simple Icons (MIT licensed)
  'formula1-alt': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/formula1.svg',
  'nascar-alt': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/nascar.svg',
  'ufc-alt': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/ufc.svg',
  'espn-alt': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/espn.svg'
};

// Professional league logos (using publicly available sources)
const leagueLogos = {
  // These are placeholder URLs - you'll need to replace with actual free sources
  'nba-logo': 'https://logoeps.com/wp-content/uploads/2013/03/nba-vector-logo.png',
  'nfl-logo': 'https://logoeps.com/wp-content/uploads/2013/03/nfl-vector-logo.png',
  'mlb-logo': 'https://logoeps.com/wp-content/uploads/2013/03/mlb-vector-logo.png',
  'nhl-logo': 'https://logoeps.com/wp-content/uploads/2013/03/nhl-vector-logo.png'
};

async function downloadIcon(url, filename) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filename);
    
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`✅ Downloaded: ${filename}`);
          resolve();
        });
      } else {
        console.log(`❌ Failed to download: ${url} (Status: ${response.statusCode})`);
        reject(new Error(`HTTP ${response.statusCode}`));
      }
    }).on('error', (err) => {
      fs.unlink(filename, () => {}); // Delete the file on error
      console.log(`❌ Error downloading ${filename}: ${err.message}`);
      reject(err);
    });
  });
}

async function downloadAllIcons() {
  const sportsDir = path.join(__dirname, '../client/src/assets/sports');
  
  // Ensure directory exists
  if (!fs.existsSync(sportsDir)) {
    fs.mkdirSync(sportsDir, { recursive: true });
  }
  
  console.log('🏀 Downloading sports icons...\n');
  
  // Download basic sport icons
  for (const [name, url] of Object.entries(sportsIcons)) {
    try {
      const ext = url.includes('.svg') ? '.svg' : '.png';
      const filename = path.join(sportsDir, `${name}${ext}`);
      await downloadIcon(url, filename);
      await new Promise(resolve => setTimeout(resolve, 100)); // Rate limiting
    } catch (error) {
      console.log(`⚠️  Skipped ${name}: ${error.message}`);
    }
  }
  
  // Download league logos
  for (const [name, url] of Object.entries(leagueLogos)) {
    try {
      const ext = url.includes('.svg') ? '.svg' : '.png';
      const filename = path.join(sportsDir, `${name}${ext}`);
      await downloadIcon(url, filename);
      await new Promise(resolve => setTimeout(resolve, 100)); // Rate limiting
    } catch (error) {
      console.log(`⚠️  Skipped ${name}: ${error.message}`);
    }
  }
  
  console.log('\n🎉 Download complete! Check the sports folder for your icons.');
  console.log('\n📝 Note: Some icons may need manual download due to licensing restrictions.');
  console.log('   For official league logos, visit their official websites or use licensed sources.');
}

// Run the download
downloadAllIcons().catch(console.error);
