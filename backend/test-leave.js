require('ts-node').register();
const { app } = require('./src/app.ts');
const mongoose = require('mongoose');
const { User } = require('./src/modules/auth/models/User.ts');
const { Project } = require('./src/modules/projects/models/Project.ts');
const { ProjectRole } = require('./src/modules/projects/models/ProjectRole.ts');
const request = require('supertest');
const { generateToken } = require('./src/core/utils/jwt.ts');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://admin:admin123@cluster0.je5r9uv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
  
  // Find a project with a member who is NOT the owner
  const role = await ProjectRole.findOne({ role: { $ne: 'OWNER' } });
  if (!role) {
    console.log("No non-owner member found");
    process.exit(1);
  }
  
  const token = generateToken({ id: role.userId });
  
  const res = await request(app)
    .post(`/api/v1/projects/${role.projectId}/members/leave`)
    .set('Authorization', `Bearer ${token}`);
    
  console.log("STATUS:", res.status);
  console.log("BODY:", res.body);
  
  process.exit(0);
}

run().catch(console.error);
