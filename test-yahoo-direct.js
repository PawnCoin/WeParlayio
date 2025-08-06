#!/usr/bin/env node

// Test if the hardcoded credentials are working
const { RealYahooApiService } = require('./server/services/realYahooApiService.ts');

console.log('Testing direct Yahoo service...');
try {
  const service = new RealYahooApiService();
  const authUrl = service.getAuthUrl('test-session');
  console.log('Auth URL generated:', authUrl.substring(0, 100) + '...');
  
  if (authUrl.includes('dj0yJmk9Q3M1RmNF')) {
    console.log('✅ SUCCESS: New Confidential Client credentials are active!');
  } else {
    console.log('❌ ISSUE: Still using old credentials');
  }
} catch (error) {
  console.error('Error testing service:', error.message);
}