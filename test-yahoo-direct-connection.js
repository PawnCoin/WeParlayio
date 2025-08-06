#!/usr/bin/env node

import https from 'https';

console.log('Testing direct connection to Yahoo OAuth...');

const testUrl = 'https://api.login.yahoo.com/oauth2/request_auth?client_id=dj0yJmk9Q3M1RmNFNjBHTVhtJmQ9WVdrOU1tbFRbmhSTUhVbWNHbzlNQT09JnM9Y29uc3VtZXJzZWNyZXQmc3Y9MCZ4PTA4&redirect_uri=https%3A%2F%2Ff7097b10-74b9-45ad-9152-e5c7329e5010-00-dwypxvoq2aso.worf.replit.dev%2Fapi%2Fyahoo-real%2Foauth%2Fcallback&response_type=code&scope=openid&state=test';

const options = {
  method: 'HEAD',
  timeout: 10000
};

const req = https.request(testUrl, options, (res) => {
  console.log('✅ Yahoo OAuth endpoint responded:');
  console.log('- Status:', res.statusCode);
  console.log('- Headers:', Object.keys(res.headers));
  if (res.statusCode === 302 || res.statusCode === 200) {
    console.log('✅ Connection successful - OAuth endpoint is working');
  } else {
    console.log('❌ Unexpected status code');
  }
});

req.on('error', (error) => {
  console.log('❌ Connection failed:', error.message);
  console.log('This suggests a network or configuration issue');
});

req.on('timeout', () => {
  console.log('❌ Connection timeout');
  req.destroy();
});

req.end();