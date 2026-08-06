import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { app } from './app';

// Load env vars
dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI as string;



// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

connectDB();

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error(`[UNHANDLED REJECTION] Shutting down...`);
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
