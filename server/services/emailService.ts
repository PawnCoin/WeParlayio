import nodemailer from 'nodemailer';

// Create SMTP transporter using Hostinger settings
const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  port: 465,
  secure: true, // SSL
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Verify SMTP connection
transporter.verify((error: any, success: any) => {
  if (error) {
    console.error('SMTP connection error:', error);
  } else {
    console.log('✅ SMTP server is ready to send emails');
  }
});

export interface EmailOptions {
  to: string | string[];
  subject?: string;
  text?: string;
  html?: string;
  template?: 'welcome' | 'bet_confirmation' | 'win_notification' | 'security_alert' | 'admin_alert';
  templateData?: any;
}

// Email templates
const getEmailTemplate = (template: string, data: any) => {
  const templates = {
    welcome: {
      subject: 'Welcome to WeParlay - Your Sports Betting Adventure Begins!',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background: #1a1a2e; color: #ffffff; padding: 20px; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3498db; margin: 0;">Welcome to WeParlay</h1>
            <p style="color: #e74c3c; font-size: 18px; margin: 10px 0;">Where Every Bet Counts!</p>
          </div>
          
          <div style="background: rgba(52, 152, 219, 0.1); padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #2ecc71;">🎉 Welcome ${data.name || 'Champion'}!</h2>
            <p>You've successfully joined the WeParlay community! Here's what's waiting for you:</p>
            
            <ul style="color: #ecf0f1; line-height: 1.6;">
              <li>💰 <strong>$1,000 WeParlay Cash</strong> to start betting immediately</li>
              <li>🏆 Access to all sports and tournaments</li>
              <li>🤝 Head-to-head betting challenges</li>
              <li>🎮 Video game betting opportunities</li>
              <li>💎 Cryptocurrency wallet integration</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://weparlay.io" style="background: linear-gradient(45deg, #3498db, #2ecc71); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">Start Betting Now</a>
          </div>
          
          <div style="border-top: 1px solid #34495e; padding-top: 20px; margin-top: 30px; font-size: 12px; color: #7f8c8d; text-align: center;">
            <p>Questions? Contact us at <a href="mailto:support@weparlay.io" style="color: #3498db;">support@weparlay.io</a></p>
            <p>© 2025 WeParlay.io - All rights reserved</p>
          </div>
        </div>
      `
    },
    
    bet_confirmation: {
      subject: `Bet Confirmed - ${data.betType || 'Your Bet'} is Live!`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background: #1a1a2e; color: #ffffff; padding: 20px; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #3498db; margin: 0;">Bet Confirmed! 🎯</h1>
          </div>
          
          <div style="background: rgba(46, 204, 113, 0.1); padding: 20px; border-radius: 8px; border-left: 4px solid #2ecc71;">
            <h2 style="color: #2ecc71; margin-top: 0;">Your bet is now live!</h2>
            <p><strong>Event:</strong> ${data.event || 'N/A'}</p>
            <p><strong>Bet Type:</strong> ${data.betType || 'N/A'}</p>
            <p><strong>Amount:</strong> ${data.amount || 'N/A'}</p>
            <p><strong>Potential Win:</strong> ${data.potentialWin || 'N/A'}</p>
            <p><strong>Odds:</strong> ${data.odds || 'N/A'}</p>
          </div>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="https://weparlay.io" style="background: #3498db; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px;">Track Your Bet</a>
          </div>
          
          <p style="font-size: 12px; color: #7f8c8d; text-align: center;">Good luck! 🍀</p>
        </div>
      `
    },
    
    win_notification: {
      subject: '🎉 Congratulations! You Won!',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background: #1a1a2e; color: #ffffff; padding: 20px; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #f1c40f; margin: 0; font-size: 36px;">🏆 WINNER! 🏆</h1>
            <p style="color: #2ecc71; font-size: 24px;">Congratulations!</p>
          </div>
          
          <div style="background: linear-gradient(45deg, rgba(241, 196, 15, 0.2), rgba(46, 204, 113, 0.2)); padding: 25px; border-radius: 10px; text-align: center;">
            <h2 style="color: #f1c40f; margin: 0 0 15px 0;">You won ${data.winAmount || '$0'}!</h2>
            <p style="font-size: 18px; margin: 10px 0;"><strong>Event:</strong> ${data.event || 'N/A'}</p>
            <p style="font-size: 16px; margin: 10px 0;"><strong>Your Bet:</strong> ${data.betType || 'N/A'}</p>
            <p style="font-size: 16px; margin: 10px 0;"><strong>Odds:</strong> ${data.odds || 'N/A'}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://weparlay.io" style="background: linear-gradient(45deg, #f1c40f, #2ecc71); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">Place Another Bet</a>
          </div>
          
          <p style="font-size: 12px; color: #7f8c8d; text-align: center;">Your winnings have been added to your account balance.</p>
        </div>
      `
    },
    
    security_alert: {
      subject: '🔒 WeParlay Security Alert',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background: #1a1a2e; color: #ffffff; padding: 20px; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #e74c3c; margin: 0;">🔒 Security Alert</h1>
          </div>
          
          <div style="background: rgba(231, 76, 60, 0.1); padding: 20px; border-radius: 8px; border-left: 4px solid #e74c3c;">
            <h2 style="color: #e74c3c; margin-top: 0;">Account Activity Detected</h2>
            <p><strong>Action:</strong> ${data.action || 'Unknown activity'}</p>
            <p><strong>Time:</strong> ${data.time || new Date().toLocaleString()}</p>
            <p><strong>IP Address:</strong> ${data.ipAddress || 'Unknown'}</p>
            <p><strong>Location:</strong> ${data.location || 'Unknown'}</p>
          </div>
          
          <div style="margin: 20px 0;">
            <p>If this was you, no action is needed. If you don't recognize this activity, please secure your account immediately.</p>
          </div>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="https://weparlay.io/security-settings" style="background: #e74c3c; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px;">Secure My Account</a>
          </div>
          
          <p style="font-size: 12px; color: #7f8c8d; text-align: center;">Contact <a href="mailto:support@weparlay.io" style="color: #3498db;">support@weparlay.io</a> if you need help.</p>
        </div>
      `
    },
    
    admin_alert: {
      subject: `WeParlay Admin Alert: ${data.alertType || 'System Notification'}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background: #2c3e50; color: #ffffff; padding: 20px; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #3498db; margin: 0;">⚠️ Admin Alert</h1>
          </div>
          
          <div style="background: rgba(52, 152, 219, 0.1); padding: 20px; border-radius: 8px;">
            <h2 style="color: #f39c12; margin-top: 0;">${data.alertType || 'System Alert'}</h2>
            <p><strong>Details:</strong> ${data.message || 'No details provided'}</p>
            <p><strong>Time:</strong> ${data.time || new Date().toLocaleString()}</p>
            ${data.userId ? `<p><strong>User ID:</strong> ${data.userId}</p>` : ''}
            ${data.amount ? `<p><strong>Amount:</strong> ${data.amount}</p>` : ''}
          </div>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="https://weparlay.io/admin-dashboard" style="background: #3498db; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px;">View Admin Dashboard</a>
          </div>
        </div>
      `
    }
  };
  
  return templates[template as keyof typeof templates] || { subject: '', html: '' };
};

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    // Check if SMTP credentials are available
    if (!process.env.SMTP_USERNAME || !process.env.SMTP_PASSWORD) {
      console.error('❌ SMTP credentials not configured');
      return false;
    }
    
    let emailContent = {
      subject: options.subject || 'WeParlay Notification',
      text: options.text,
      html: options.html
    };
    
    // Use template if specified
    if (options.template && options.templateData) {
      const template = getEmailTemplate(options.template, options.templateData);
      emailContent.subject = template.subject;
      emailContent.html = template.html;
    }
    
    const mailOptions = {
      from: `"WeParlay Support" <${process.env.SMTP_USERNAME}>`,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html,
    };
    
    console.log('📧 Attempting to send email to:', mailOptions.to);
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', result.messageId);
    return true;
  } catch (error: any) {
    console.error('❌ Email sending failed:', error.message);
    return false;
  }
};

// Convenience functions for common emails
export const sendWelcomeEmail = (to: string, userData: any) => {
  return sendEmail({
    to,
    template: 'welcome',
    templateData: userData
  });
};

export const sendBetConfirmation = (to: string, betData: any) => {
  return sendEmail({
    to,
    template: 'bet_confirmation',
    templateData: betData
  });
};

export const sendWinNotification = (to: string, winData: any) => {
  return sendEmail({
    to,
    template: 'win_notification',
    templateData: winData
  });
};

export const sendSecurityAlert = (to: string, alertData: any) => {
  return sendEmail({
    to,
    template: 'security_alert',
    templateData: alertData
  });
};

export const sendAdminAlert = (alertData: any) => {
  return sendEmail({
    to: process.env.SMTP_USERNAME!, // Send admin alerts to the main email
    template: 'admin_alert',
    templateData: alertData
  });
};