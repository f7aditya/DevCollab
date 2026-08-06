import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User } from '../modules/auth/models/User';
import { Project } from '../modules/projects/models/Project';
import { Task } from '../modules/tasks/models/Task';
import { ProjectRole } from '../modules/projects/models/ProjectRole';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:securepassword@localhost:27017/devcollab?authSource=admin';

async function seed() {
  try {
    console.log('🌱 Starting database seed...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    console.log('🧹 Cleared existing database');

    // Seed Users
    const adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@devcollab.com',
      passwordHash: 'password123', // Will be hashed by pre-save hook
      skills: ['TypeScript', 'React', 'Node.js'],
      bio: 'Platform administrator.'
    });

    const testUser = await User.create({
      firstName: 'Alice',
      lastName: 'Engineer',
      email: 'alice@devcollab.com',
      passwordHash: 'password123', // Will be hashed by pre-save hook
      skills: ['Go', 'Docker', 'Kubernetes'],
      bio: 'Backend engineer.'
    });

    console.log('👥 Seeded Users');

    // Seed Projects
    const project1 = await Project.create({
      name: 'Alpha Platform Rewrite',
      description: 'Migrating the legacy monolith to microservices.',
      ownerId: adminUser._id,
      visibility: 'PUBLIC'
    });

    await ProjectRole.insertMany([
      { projectId: project1._id, userId: adminUser._id, role: 'ADMIN' },
      { projectId: project1._id, userId: testUser._id, role: 'MEMBER' }
    ]);

    const project2 = await Project.create({
      name: 'Design System V2',
      description: 'Creating reusable React components.',
      ownerId: testUser._id,
      visibility: 'PRIVATE'
    });

    await ProjectRole.insertMany([
      { projectId: project2._id, userId: testUser._id, role: 'ADMIN' },
      { projectId: project2._id, userId: adminUser._id, role: 'VIEWER' }
    ]);

    console.log('📁 Seeded Projects');

    // Seed Tasks
    await Task.create([
      {
        projectId: project1._id,
        title: 'Setup Kubernetes Cluster',
        description: 'Initialize the primary production EKS cluster.',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        reporterId: adminUser._id,
        assigneeId: testUser._id,
        order: 0
      },
      {
        projectId: project1._id,
        title: 'Write Dockerfiles',
        description: 'Containerize frontend and backend.',
        status: 'DONE',
        priority: 'MEDIUM',
        reporterId: testUser._id,
        assigneeId: testUser._id,
        order: 0
      },
      {
        projectId: project2._id,
        title: 'Button Component',
        description: 'Implement Radix UI button.',
        status: 'TODO',
        priority: 'LOW',
        reporterId: testUser._id,
        assigneeId: testUser._id,
        order: 0
      }
    ]);

    console.log('📋 Seeded Tasks');
    console.log('✨ Seeding complete! You can now log in with:');
    console.log('Email: admin@devcollab.com | Password: password123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
