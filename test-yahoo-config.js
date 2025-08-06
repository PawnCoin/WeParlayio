// Test Yahoo OAuth Configuration
import fetch from 'node-fetch';

async function testYahooConfig() {
  try {
    console.log('Testing Yahoo OAuth configuration...');
    
    const response = await fetch('http://localhost:3000/api/yahoo-real/config');
    const config = await response.json();
    
    console.log('Yahoo Configuration Status:');
    console.log('- Configured:', config.configured);
    console.log('- Client ID:', config.clientId);
    console.log('- Has Secret:', config.hasSecret);
    console.log('- Redirect URI:', config.redirectUri);
    console.log('- Domain:', config.domain);
    console.log('- Issue:', config.issue);
    
    if (config.configured) {
      console.log('\n✅ Yahoo OAuth appears to be configured!');
      console.log('You can try the OAuth flow now.');
    } else {
      console.log('\n❌ Yahoo OAuth is not properly configured.');
      console.log('Please check your YAHOO_CLIENT_ID and YAHOO_CLIENT_SECRET secrets.');
    }
    
  } catch (error) {
    console.error('Error testing Yahoo config:', error.message);
  }
}

testYahooConfig();