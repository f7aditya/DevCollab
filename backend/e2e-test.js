const API_URL = 'http://127.0.0.1:5001/api/v1';
let token = '';
let projectId = '';
let taskId = '';

async function runTests() {
  console.log('--- Starting E2E Tests ---');
  
  try {
    // 1. Register User
    console.log('1. Registering user...');
    const email = `testuser_${Date.now()}@test.com`;
    let response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'E2E',
        lastName: 'Tester',
        email: email,
        password: 'password123'
      })
    });
    if (!response.ok) throw new Error(await response.text());
    console.log('✅ Registration successful');

    // 2. Login User
    console.log('2. Logging in...');
    response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        password: 'password123'
      })
    });
    if (!response.ok) throw new Error(await response.text());
    let data = await response.json();
    token = data.data.token;
    console.log('✅ Login successful');

    const headers = { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    };

    // 3. Create Project
    console.log('3. Creating project...');
    response = await fetch(`${API_URL}/projects`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: 'E2E Test Project',
        description: 'Project created via E2E test'
      })
    });
    if (!response.ok) throw new Error(await response.text());
    data = await response.json();
    projectId = data.data.project._id;
    console.log('✅ Project created:', projectId);

    // 4. Get Project Members
    console.log('4. Fetching members...');
    response = await fetch(`${API_URL}/projects/${projectId}/members`, { headers });
    if (!response.ok) throw new Error(await response.text());
    data = await response.json();
    if (data.data.members.length > 0) {
      console.log('✅ Members retrieved');
    } else {
      throw new Error('No members found in new project');
    }

    // 5. Create Task
    console.log('5. Creating task...');
    response = await fetch(`${API_URL}/projects/${projectId}/tasks`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: 'Test Task',
        description: 'E2E Task Description',
        status: 'TODO',
        priority: 'HIGH'
      })
    });
    if (!response.ok) throw new Error(await response.text());
    data = await response.json();
    taskId = data.data.task._id;
    console.log('✅ Task created:', taskId);

    // 6. Create Post
    console.log('6. Creating post...');
    response = await fetch(`${API_URL}/projects/${projectId}/posts`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: 'E2E Update',
        content: 'This is an important update',
        tags: ['update']
      })
    });
    if (!response.ok) throw new Error(await response.text());
    console.log('✅ Post created');

    console.log('--- All E2E API Tests Passed! ---');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.cause) console.error('Underlying cause:', error.cause);
  }
}

runTests();
