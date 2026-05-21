import mongoose from 'mongoose';

const connectDB = async () => {
  // Skip MongoDB connection if not configured
  if (!process.env.MONGODB_URI || process.env.MONGODB_URI === 'mongodb://localhost:27017/academic-evaluation') {
    console.log('MongoDB not configured. Running without database.');
    // Set mongoose to not buffer commands
    mongoose.set('bufferCommands', false);
    mongoose.set('bufferTimeoutMS', 0);
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 2000, // Fail fast
      connectTimeoutMS: 2000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.log('Server will continue without database. Some features may not work.');
    // Disable buffering to prevent timeouts
    mongoose.set('bufferCommands', false);
    mongoose.set('bufferTimeoutMS', 0);
  }
};

export default connectDB;
