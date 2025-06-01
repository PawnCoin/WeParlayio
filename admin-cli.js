
#!/usr/bin/env node

const readline = require('readline');
const https = require('https');

const BASE_URL = 'https://f7097b10-74b9-45ad-9152-e5c7329e5010-00-dwypxvoq2aso.worf.replit.dev';
let adminToken = null;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function makeRequest(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, BASE_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(adminToken && { 'Authorization': `Bearer ${adminToken}` })
      }
    };

    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve({ error: 'Invalid JSON response', body });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function adminLogin() {
  console.log('\n🔐 WeParlay Admin Access (Backend Only)');
  console.log('=====================================');
  
  const email = await askQuestion('Email: ');
  const password = await askQuestion('Password: ', true);
  const adminKey = await askQuestion('Admin Key: ', true);

  try {
    const response = await makeRequest('/api/secure-admin/secure-admin-auth', 'POST', {
      email,
      password,
      adminKey
    });

    if (response.success) {
      adminToken = response.token;
      console.log('✅ Admin authenticated successfully!');
      return true;
    } else {
      console.log('❌ Authentication failed:', response.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Connection error:', error.message);
    return false;
  }
}

async function showDashboard() {
  try {
    const response = await makeRequest('/api/secure-admin/admin-dashboard-data');
    
    if (response.success) {
      const data = response.data;
      console.log('\n📊 WeParlay Admin Dashboard');
      console.log('===========================');
      console.log(`Total Users: ${data.totalUsers}`);
      console.log(`Active Users: ${data.activeUsers}`);
      console.log(`Total Revenue: $${data.totalRevenue}`);
      console.log(`Revenue Today: $${data.revenueToday}`);
      console.log(`System Status: ${data.systemStatus}`);
      console.log('\nAPI Status:');
      Object.entries(data.apiStatus).forEach(([api, status]) => {
        console.log(`  ${api.toUpperCase()}: ${status}`);
      });
    } else {
      console.log('❌ Failed to load dashboard:', response.message);
    }
  } catch (error) {
    console.log('❌ Error loading dashboard:', error.message);
  }
}

async function manageUsers() {
  try {
    const response = await makeRequest('/api/secure-admin/manage-users');
    
    if (response.success) {
      console.log('\n👥 User Management');
      console.log('==================');
      console.log(`Total Users: ${response.totalCount}`);
      
      response.users.slice(0, 10).forEach(user => {
        console.log(`${user.email} - ${user.status} - ${user.tier} tier - $${user.balance}`);
      });
      
      if (response.users.length > 10) {
        console.log(`... and ${response.users.length - 10} more users`);
      }
    } else {
      console.log('❌ Failed to load users:', response.message);
    }
  } catch (error) {
    console.log('❌ Error loading users:', error.message);
  }
}

function askQuestion(question, hidden = false) {
  return new Promise((resolve) => {
    if (hidden) {
      process.stdout.write(question);
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.setEncoding('utf8');
      
      let input = '';
      process.stdin.on('data', function(char) {
        if (char === '\u0003') { // Ctrl+C
          process.exit();
        } else if (char === '\r' || char === '\n') {
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdout.write('\n');
          resolve(input);
        } else if (char === '\u007f') { // Backspace
          if (input.length > 0) {
            input = input.slice(0, -1);
            process.stdout.write('\b \b');
          }
        } else {
          input += char;
          process.stdout.write('*');
        }
      });
    } else {
      rl.question(question, resolve);
    }
  });
}

async function main() {
  console.log('🚀 WeParlay Backend Admin CLI');
  console.log('============================');
  
  const authenticated = await adminLogin();
  
  if (!authenticated) {
    console.log('Authentication required. Exiting...');
    process.exit(1);
  }

  while (true) {
    console.log('\n📋 Admin Menu:');
    console.log('1. Dashboard');
    console.log('2. Manage Users');
    console.log('3. System Status');
    console.log('4. Logout');
    
    const choice = await askQuestion('Select option (1-4): ');
    
    switch (choice) {
      case '1':
        await showDashboard();
        break;
      case '2':
        await manageUsers();
        break;
      case '3':
        console.log('System monitoring active...');
        break;
      case '4':
        console.log('👋 Logging out...');
        process.exit(0);
      default:
        console.log('Invalid option. Please try again.');
    }
  }
}

// Handle CLI exit
process.on('SIGINT', () => {
  console.log('\n👋 Goodbye!');
  process.exit(0);
});

main().catch(console.error);
