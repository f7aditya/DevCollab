const API_URL = 'http://127.0.0.1:5001/api/v1';

async function testProfile() {
  try {
    // Register or login a test user
    const email = `test_profile_${Date.now()}@test.com`;
    let res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Test', lastName: 'User', email, password: 'password123'
      })
    });
    let data = await res.json();
    const token = data.data.token;

    // Patch profile
    let patchRes = await fetch(`${API_URL}/users/me`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        firstName: 'Aditya',
        lastName: 'Verma',
        bio: 'i am beginner ..',
        skills: ['React', 'Typescript'],
        avatarUrl: 'http://localhost:5001/uploads/1268519.jpg'
      })
    });
    
    if (!patchRes.ok) {
      console.log('PATCH ERROR:', patchRes.status, await patchRes.text());
    } else {
      console.log('PATCH SUCCESS:', await patchRes.json());
    }
  } catch (err) {
    console.error(err);
  }
}
testProfile();
