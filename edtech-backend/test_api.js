const API_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('--- Starting API Verification Tests ---');

  // Test 1: Check server status
  try {
    const statusRes = await fetch('http://localhost:5000/');
    const statusData = await statusRes.json();
    console.log('Test 1: GET / -> SUCCESS', statusData);
  } catch (error) {
    console.error('Test 1: GET / -> FAILED. Is the server running?', error.message);
    return;
  }

  // Test 2: Register a new user
  let token;
  const testUser = {
    name: 'Test Student',
    email: `student_${Date.now()}@test.com`,
    password: 'password123',
    role: 'student'
  };

  try {
    const registerRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    const registerData = await registerRes.json();
    if (registerRes.ok) {
      console.log('Test 2: Register -> SUCCESS. Name:', registerData.name, 'Role:', registerData.role);
      token = registerData.token;
    } else {
      console.error('Test 2: Register -> FAILED', registerData);
      return;
    }
  } catch (error) {
    console.error('Test 2: Register -> EXCEPTION', error.message);
    return;
  }

  // Test 3: Login User
  try {
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });
    const loginData = await loginRes.json();
    if (loginRes.ok) {
      console.log('Test 3: Login -> SUCCESS. Email:', loginData.email);
    } else {
      console.error('Test 3: Login -> FAILED', loginData);
      return;
    }
  } catch (error) {
    console.error('Test 3: Login -> EXCEPTION', error.message);
    return;
  }

  // Test 4: Access Protected Profile
  try {
    const profileRes = await fetch(`${API_URL}/auth/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const profileData = await profileRes.json();
    if (profileRes.ok) {
      console.log('Test 4: Profile -> SUCCESS. Received profile for:', profileData.name);
    } else {
      console.error('Test 4: Profile -> FAILED', profileData);
    }
  } catch (error) {
    console.error('Test 4: Profile -> EXCEPTION', error.message);
  }
}

runTests();
