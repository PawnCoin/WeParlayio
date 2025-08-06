// Quick test to generate OAuth URL with new credentials
const authUrl = `https://api.login.yahoo.com/oauth2/request_auth?client_id=dj0yJmk9Q3M1RmNFNjBHTVhtJmQ9WVdrOU1tbFRbmhSTUhVbWNHbzlNQT09JnM9Y29uc3VtZXJzZWNyZXQmc3Y9MCZ4PTA4&redirect_uri=https://f7097b10-74b9-45ad-9152-e5c7329e5010-00-dwypxvoq2aso.worf.replit.dev/api/yahoo-real/oauth/callback&response_type=code&scope=fspt-r&state=test-session`;

console.log('✅ OAuth URL with new Confidential Client credentials:');
console.log(authUrl);
console.log('\n✅ This URL should work for Yahoo OAuth now!');