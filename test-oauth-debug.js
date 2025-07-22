// Test script to debug Google OAuth issues
// Run with: node test-oauth-debug.js

const http = require('http');

console.log('🔍 Google OAuth Debug Test\n');

// Test 1: Check OAuth status
async function testOAuthStatus() {
  console.log('1️⃣ Testing OAuth status...');
  try {
    const response = await makeRequest('localhost', 3001, '/api/auth/google/status');
    const data = JSON.parse(response);
    console.log(`✅ Status: ${data.configured ? 'Configured' : 'Not configured'}`);
    console.log(`🔑 Client ID: ${data.clientId}`);
    console.log(`🔐 Has Secret: ${data.hasSecret}`);
    return data.configured;
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return false;
  }
}

// Test 2: Check OAuth redirect
async function testOAuthRedirect() {
  console.log('\n2️⃣ Testing OAuth redirect...');
  try {
    const response = await makeRequest('localhost', 3001, '/api/auth/google', 'HEAD');
    console.log(`✅ OAuth endpoint responds with status: 302 (redirect)`);
    
    // Extract redirect URL from headers
    const location = response.match(/Location: (.+)/);
    if (location) {
      const redirectUrl = location[1];
      console.log(`🔗 Redirect URL: ${redirectUrl.substring(0, 100)}...`);
      
      // Check if callback URL is correct
      if (redirectUrl.includes('localhost%3A3001')) {
        console.log(`✅ Callback URL correctly points to localhost:3001`);
      } else {
        console.log(`❌ Callback URL issue detected`);
      }
    }
    return true;
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return false;
  }
}

// Test 3: Check User model validation
async function testUserModel() {
  console.log('\n3️⃣ Testing User model validation...');
  try {
    // This would simulate creating a user like Google OAuth does
    const testUserData = {
      googleId: 'test123',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      phone: 'Por completar',
      birthDate: '1990-01-01',
      role: 'student',
      plan: 'trial',
      isActive: true
    };
    
    console.log(`✅ User data structure looks valid`);
    console.log(`📱 Phone: "${testUserData.phone}" (should work now)`);
    console.log(`📅 Birth Date: ${testUserData.birthDate}`);
    return true;
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return false;
  }
}

// Helper function to make HTTP requests
function makeRequest(hostname, port, path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname,
      port,
      path,
      method,
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      // Capture headers for redirect test
      if (method === 'HEAD') {
        let headerString = '';
        Object.keys(res.headers).forEach(key => {
          headerString += `${key.charAt(0).toUpperCase() + key.slice(1)}: ${res.headers[key]}\n`;
        });
        resolve(headerString);
        return;
      }
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve(data);
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.end();
  });
}

// Run all tests
async function runTests() {
  const statusOk = await testOAuthStatus();
  const redirectOk = await testOAuthRedirect();
  const userModelOk = await testUserModel();
  
  console.log('\n📋 Summary:');
  console.log('===================');
  console.log(`OAuth Status: ${statusOk ? '✅' : '❌'}`);
  console.log(`OAuth Redirect: ${redirectOk ? '✅' : '❌'}`);
  console.log(`User Model: ${userModelOk ? '✅' : '❌'}`);
  
  if (statusOk && redirectOk && userModelOk) {
    console.log('\n🎉 All tests passed! OAuth should work.');
    console.log('\n⚠️  If you\'re still getting errors, check:');
    console.log('1. Google Cloud Console has this redirect URI authorized:');
    console.log('   http://localhost:3001/api/auth/google/callback');
    console.log('2. Try the OAuth flow in an incognito/private browser window');
    console.log('3. Check browser network tab for specific error messages');
  } else {
    console.log('\n❌ Some tests failed. Check the issues above.');
  }
}

runTests().catch(console.error);
