require('ts-node').register();
const { app } = require('./src/app.ts');
const mongoose = require('mongoose');
const { User } = require('./src/modules/auth/models/User.ts');
const request = require('supertest');
const { generateToken } = require('./src/core/utils/jwt.ts');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://admin:admin123@cluster0.je5r9uv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
  
  // Find a user
  const user = await User.findOne({});
  if (!user) {
    console.log("No user found");
    process.exit(1);
  }
  
  const token = generateToken({ id: user._id });
  
  const res = await request(app)
    .patch('/api/v1/users/me')
    .set('Authorization', `Bearer ${token}`)
    .send({
      firstName: 'Aditya',
      lastName: 'Verma',
      bio: 'i am beginner ..',
      skills: ['React', 'Javascript'],
      avatarUrl: 'http://localhost:5001/uploads/1268519.jpg'
    });
    
  console.log("STATUS:", res.status);
  console.log("BODY:", res.body);
  
  process.exit(0);
}

run().catch(console.error);
