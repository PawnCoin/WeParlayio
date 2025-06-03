import twilio from 'twilio';

// Test SMS sending to 3142765637
async function sendTestSMS() {
  try {
    // Check if Twilio credentials are available
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
      console.log('Missing Twilio credentials:');
      console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? 'Set' : 'Missing');
      console.log('TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? 'Set' : 'Missing');
      console.log('TWILIO_PHONE_NUMBER:', process.env.TWILIO_PHONE_NUMBER ? 'Set' : 'Missing');
      return false;
    }

    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    const message = 'WeParlay SMS Betting Revolution: Enhanced features now active! Auto-settlement, smart analytics, instant notifications, and mobile-first betting challenges. Join at weparlay.io';
    
    console.log('Sending SMS to: +13142765637');
    console.log('Message:', message);
    
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: '+13142765637'
    });

    console.log('SMS sent successfully!');
    console.log('Message SID:', result.sid);
    console.log('Status:', result.status);
    console.log('Date Created:', result.dateCreated);
    
    return true;
  } catch (error) {
    console.error('SMS sending failed:', error.message);
    if (error.code) {
      console.error('Error Code:', error.code);
    }
    return false;
  }
}

// Run the test
sendTestSMS().then(result => {
  process.exit(result ? 0 : 1);
});