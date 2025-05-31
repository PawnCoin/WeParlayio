// Quick test of RapidAPI subscriptions
const rapidApiKey = process.env.RAPIDAPI_KEY;

if (!rapidApiKey) {
  console.log('RAPIDAPI_KEY not found');
  process.exit(1);
}

const subscriptions = [
  { name: 'API-BASKETBALL', host: 'api-basketball.p.rapidapi.com', endpoint: '/leagues' },
  { name: 'AllSportsApi', host: 'allsportsapi2.p.rapidapi.com', endpoint: '/api/sports' },
  { name: 'FlashLive Sports', host: 'flashlive-sports.p.rapidapi.com', endpoint: '/v1/sports' },
  { name: 'Sportsbook API', host: 'sportsbook-api.p.rapidapi.com', endpoint: '/v1/sports' },
  { name: 'Pinnacle Odds', host: 'pinnacle-odds.p.rapidapi.com', endpoint: '/kit/v1/sports' }
];

async function testSubscription(sub) {
  try {
    const response = await fetch(`https://${sub.host}${sub.endpoint}`, {
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': sub.host
      }
    });

    return {
      name: sub.name,
      status: response.ok ? 'ACTIVE' : 'INACTIVE',
      statusCode: response.status
    };
  } catch (error) {
    return {
      name: sub.name,
      status: 'ERROR',
      error: error.message
    };
  }
}

async function testAll() {
  console.log('Testing RapidAPI subscriptions...\n');
  
  for (const sub of subscriptions) {
    const result = await testSubscription(sub);
    console.log(`${result.name}: ${result.status} (${result.statusCode || result.error})`);
  }
}

testAll().catch(console.error);