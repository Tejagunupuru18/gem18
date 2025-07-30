const axios = require('axios');

const BASE_URL = 'http://localhost:5004';

const testRoutes = async () => {
  console.log('🧪 Testing API Routes...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Health endpoint:', healthResponse.data);

    // Test auth register endpoint
    console.log('\n2. Testing auth register endpoint...');
    try {
      const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, {
        email: 'test@example.com',
        password: 'Test123!',
        firstName: 'Test',
        lastName: 'User',
        role: 'student',
        phone: '1234567890'
      });
      console.log('✅ Register endpoint:', registerResponse.data.message);
    } catch (error) {
      if (error.response?.data?.message?.includes('already exists')) {
        console.log('✅ Register endpoint: User already exists (expected)');
      } else {
        console.log('❌ Register endpoint error:', error.response?.data);
      }
    }

    // Test auth login endpoint
    console.log('\n3. Testing auth login endpoint...');
    try {
      const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: 'test@example.com',
        password: 'Test123!'
      });
      console.log('✅ Login endpoint:', loginResponse.data.message);
    } catch (error) {
      console.log('❌ Login endpoint error:', error.response?.data);
    }

    // Test students endpoint
    console.log('\n4. Testing students endpoint...');
    try {
      const studentsResponse = await axios.get(`${BASE_URL}/api/students`);
      console.log('✅ Students endpoint: Working');
    } catch (error) {
      console.log('❌ Students endpoint error:', error.response?.data);
    }

    // Test mentors endpoint
    console.log('\n5. Testing mentors endpoint...');
    try {
      const mentorsResponse = await axios.get(`${BASE_URL}/api/mentors`);
      console.log('✅ Mentors endpoint: Working');
    } catch (error) {
      console.log('❌ Mentors endpoint error:', error.response?.data);
    }

    // Test resources endpoint
    console.log('\n6. Testing resources endpoint...');
    try {
      const resourcesResponse = await axios.get(`${BASE_URL}/api/resources`);
      console.log('✅ Resources endpoint: Working');
    } catch (error) {
      console.log('❌ Resources endpoint error:', error.response?.data);
    }

    // Test quiz endpoint
    console.log('\n7. Testing quiz endpoint...');
    try {
      const quizResponse = await axios.get(`${BASE_URL}/api/quiz`);
      console.log('✅ Quiz endpoint: Working');
    } catch (error) {
      console.log('❌ Quiz endpoint error:', error.response?.data);
    }

    // Test sessions info endpoint
    console.log('\n8. Testing sessions info endpoint...');
    try {
      const sessionsResponse = await axios.get(`${BASE_URL}/api/sessions/info`);
      console.log('✅ Sessions info endpoint: Working');
    } catch (error) {
      console.log('❌ Sessions info endpoint error:', error.response?.data);
    }

    console.log('\n🎉 All route tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testRoutes(); 