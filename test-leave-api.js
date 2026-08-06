async function run() {
  try {
    // 1. Register a new user
    const userRes = await fetch('http://127.0.0.1:5001/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'Leaver',
        email: 'leaver' + Date.now() + '@test.com',
        password: 'password123'
      })
    });
    
    // Cookie contains token
    const cookie = userRes.headers.get('set-cookie');
    const userData = await userRes.json();
    const user = userData.data.user;
    
    // 2. Find a project to join (admin creates it)
    const adminRes = await fetch('http://127.0.0.1:5001/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Admin',
        lastName: 'Owner',
        email: 'owner' + Date.now() + '@test.com',
        password: 'password123'
      })
    });
    const adminCookie = adminRes.headers.get('set-cookie');
    const adminData = await adminRes.json();
    
    const projectRes = await fetch('http://127.0.0.1:5001/api/v1/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({
        name: 'Test Project',
        description: 'Test'
      })
    });
    const projectData = await projectRes.json();
    const projectId = projectData.data.project._id;
    
    // 3. Admin invites the user
    await fetch(`http://127.0.0.1:5001/api/v1/projects/${projectId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({
        userId: user._id,
        role: 'MEMBER'
      })
    });
    
    // 4. User tries to leave the project
    const leaveRes = await fetch(`http://127.0.0.1:5001/api/v1/projects/${projectId}/members/leave`, {
      method: 'POST',
      headers: { Cookie: cookie }
    });
    
    console.log('Leave response status:', leaveRes.status);
    const text = await leaveRes.text();
    console.log('Leave response data:', text);
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
