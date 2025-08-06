#!/usr/bin/env node

console.log('Yahoo Environment Debug');
console.log('======================');
console.log('Current CLIENT_ID:', process.env.YAHOO_CLIENT_ID?.substring(0, 25) + '...');
console.log('Expected CLIENT_ID: dj0yJmk9Q3M1RmNFNjBHTVht...');
console.log('Current SECRET length:', process.env.YAHOO_CLIENT_SECRET?.length || 'NOT SET');
console.log('Expected SECRET length: 40');

const isCorrectClientId = process.env.YAHOO_CLIENT_ID?.startsWith('dj0yJmk9Q3M1RmNF');
console.log('✅ Correct Client ID loaded:', isCorrectClientId);

if (!isCorrectClientId) {
  console.log('\n❌ ISSUE: Still using old Client ID');
  console.log('The "Confidential Client" credentials are not loaded.');
  console.log('User needs to manually refresh the Replit secrets.');
}

console.log('\nFor OAuth to work, you need:');
console.log('1. CLIENT_ID: dj0yJmk9Q3M1RmNFNjBHTVhtJmQ9WVdrOU1tbFRbmhSTUhVbWNHbzlNQT09JnM9Y29uc3VtZXJzZWNyZXQmc3Y9MCZ4PTA4');
console.log('2. CLIENT_SECRET: fa79ff6266fcdc9852ac00cf57a63fc316a91c1f');