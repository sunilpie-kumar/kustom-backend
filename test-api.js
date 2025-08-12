import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001';

// Test helper function
async function testEndpoint(method, endpoint, data = null, token = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const result = await response.json();

    console.log(`${method} ${endpoint}: ${response.status} - ${result.success ? '✅' : '❌'} ${result.message}`);
    
    if (!result.success) {
      console.log(`   Error: ${result.message}`);
    }

    return result;
  } catch (error) {
    console.log(`${method} ${endpoint}: ❌ Error - ${error.message}`);
    return null;
  }
}

// Test all endpoints
async function runTests() {
  console.log('🧪 Testing Kustom Server API Endpoints\n');

  // Health check
  console.log('🏥 Health Check:');
  await testEndpoint('GET', '/health');

  // User endpoints
  console.log('\n👥 User Endpoints:');
  await testEndpoint('POST', '/api/users/check', { email: 'test@example.com' });
  await testEndpoint('POST', '/api/users/signup', {
    fullName: 'Test User',
    email: 'test@example.com',
    phone: '+1234567890',
    password: 'password123'
  });

  // Provider endpoints
  console.log('\n🏢 Provider Endpoints:');
  await testEndpoint('GET', '/api/providers');
  await testEndpoint('POST', '/api/providers/check', { email: 'provider@example.com' });
  await testEndpoint('POST', '/api/providers/signup', {
    fullName: 'Test Provider',
    companyName: 'Test Company',
    category: 'Technology',
    licenseNumber: 'TEST-12345',
    email: 'provider@example.com',
    phone: '+1234567890',
    password: 'password123'
  });

  // Service endpoints
  console.log('\n🛠️ Service Endpoints:');
  await testEndpoint('GET', '/api/services');
  await testEndpoint('GET', '/api/services/featured');

  // OTP endpoints
  console.log('\n📱 OTP Endpoints:');
  await testEndpoint('POST', '/api/otp/send', {
    email: 'test@example.com',
    type: 'email',
    purpose: 'verification'
  });

  console.log('\n✅ API Testing Complete!');
}

// Run the tests
runTests().catch(console.error); 