import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

async function sendTestSMS() {
  try {
    const message = await client.messages.create({
      body: '🎯 WeParlay.io SMS Betting Test!\n\nYour Head-to-Head SMS betting is now LIVE! Reply with:\n• "BET $50 Lakers win" to create custom bets\n• "CHALLENGE @friend $25" to invite friends\n• "BALANCE" to check funds\n\nRevolutionary betting through text messages!',
      from: twilioPhone,
      to: '+13148339961'
    });

    console.log('SMS sent successfully!');
    console.log('Message SID:', message.sid);
    console.log('Status:', message.status);
  } catch (error) {
    console.error('Error sending SMS:', error);
  }
}

sendTestSMS();