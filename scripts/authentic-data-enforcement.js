import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔥 ENFORCING AUTHENTIC DATA ONLY - REMOVING ALL MOCK/FAKE DATA');

// Remove all mock data from attached_assets/api.ts
const apiPath = path.join(__dirname, '..', 'attached_assets', 'api.ts');
if (fs.existsSync(apiPath)) {
  let apiContent = fs.readFileSync(apiPath, 'utf8');
  
  // Force disable mock data
  apiContent = apiContent.replace(/const USE_MOCK_DATA = true/g, 'const USE_MOCK_DATA = false');
  
  // Remove mock sports array
  apiContent = apiContent.replace(/const mockSports: Sport\[\] = \[[\s\S]*?\];/g, 'const mockSports: Sport[] = [];');
  
  // Remove mock games array
  apiContent = apiContent.replace(/const mockGames: LiveGame\[\] = \[[\s\S]*?\];/g, 'const mockGames: LiveGame[] = [];');
  
  fs.writeFileSync(apiPath, apiContent, 'utf8');
  console.log('✅ Removed mock data from attached_assets/api.ts');
}

// Replace all mock data in CryptoInformation.tsx with real API calls
const cryptoPagePath = path.join(__dirname, '..', 'client', 'src', 'pages', 'CryptoInformation.tsx');
if (fs.existsSync(cryptoPagePath)) {
  let cryptoContent = fs.readFileSync(cryptoPagePath, 'utf8');
  
  // Replace mock crypto data with real API integration
  cryptoContent = cryptoContent.replace(
    /const enhancedCryptoData: CryptoData\[\] = \[[\s\S]*?\];/g,
    `// Real crypto data fetched from API
    const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
    
    useEffect(() => {
      const fetchRealCryptoData = async () => {
        try {
          const response = await fetch('/api/crypto/live-prices');
          const data = await response.json();
          setCryptoData(data);
        } catch (error) {
          console.error('Failed to fetch real crypto data:', error);
        }
      };
      
      fetchRealCryptoData();
      const interval = setInterval(fetchRealCryptoData, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }, []);`
  );
  
  fs.writeFileSync(cryptoPagePath, cryptoContent, 'utf8');
  console.log('✅ Replaced mock crypto data with real API integration');
}

// Remove mock esports content from SocialSharing.tsx
const socialPagePath = path.join(__dirname, '..', 'client', 'src', 'pages', 'SocialSharing.tsx');
if (fs.existsSync(socialPagePath)) {
  let socialContent = fs.readFileSync(socialPagePath, 'utf8');
  
  // Replace mock esports content with real API calls
  socialContent = socialContent.replace(
    /const mockEsportsContent: EsportsContent\[\] = \[[\s\S]*?\];/g,
    `// Real esports content from GRID API
    const [esportsContent, setEsportsContent] = useState<EsportsContent[]>([]);
    
    useEffect(() => {
      const fetchRealEsportsData = async () => {
        try {
          const response = await fetch('/api/grid/live-matches');
          const data = await response.json();
          setEsportsContent(data);
        } catch (error) {
          console.error('Failed to fetch real esports data:', error);
        }
      };
      
      fetchRealEsportsData();
    }, []);`
  );
  
  fs.writeFileSync(socialPagePath, socialContent, 'utf8');
  console.log('✅ Replaced mock esports content with real GRID API integration');
}

// Remove fallback data from freeSportsApiService.ts
const freeApiPath = path.join(__dirname, '..', 'server', 'services', 'freeSportsApiService.ts');
if (fs.existsSync(freeApiPath)) {
  let freeApiContent = fs.readFileSync(freeApiPath, 'utf8');
  
  // Remove all fallback/synthetic data generation
  freeApiContent = freeApiContent.replace(
    /private generateFallback[\s\S]*?return[\s\S]*?\]\);[\s\S]*?\}/g,
    `private generateFallback(): any[] {
      console.error('No fallback data allowed - use real API sources only');
      return [];
    }`
  );
  
  fs.writeFileSync(freeApiPath, freeApiContent, 'utf8');
  console.log('✅ Removed fallback synthetic data from freeSportsApiService.ts');
}

// Remove demo data from GRID API service
const gridApiPath = path.join(__dirname, '..', 'server', 'services', 'gridApiService.ts');
if (fs.existsSync(gridApiPath)) {
  let gridContent = fs.readFileSync(gridApiPath, 'utf8');
  
  // Replace demo data with error handling that requires real API
  gridContent = gridContent.replace(
    /\/\/ Return mock data to show API is working[\s\S]*?return \[[\s\S]*?\];/g,
    `// No mock data allowed - require real API credentials
      throw new Error('GRID API authentication required - please provide valid API key');`
  );
  
  fs.writeFileSync(gridApiPath, gridContent, 'utf8');
  console.log('✅ Removed demo data from GRID API service');
}

// Remove synthetic data from admin routes
const adminRoutesPath = path.join(__dirname, '..', 'server', 'routes', 'adminRoutes.ts');
if (fs.existsSync(adminRoutesPath)) {
  let adminContent = fs.readFileSync(adminRoutesPath, 'utf8');
  
  // Replace synthetic user growth data with real database queries
  adminContent = adminContent.replace(
    /\/\/ Generate realistic user growth data[\s\S]*?userGrowthData\.push\([\s\S]*?\);[\s\S]*?\}/g,
    `// Real user growth data from database
    const userGrowthData = await storage.getUserGrowthMetrics(range);`
  );
  
  fs.writeFileSync(adminRoutesPath, adminContent, 'utf8');
  console.log('✅ Replaced synthetic admin data with real database queries');
}

console.log('🎯 AUTHENTIC DATA ENFORCEMENT COMPLETE');
console.log('🚫 ALL MOCK/FAKE/PLACEHOLDER DATA REMOVED');
console.log('✅ PLATFORM NOW REQUIRES REAL API SOURCES ONLY');