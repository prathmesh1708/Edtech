import mongoose from 'mongoose';

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error(
      '\nMONGO_URI is not set. edtech-backend/.env is missing or incomplete.' +
        '\nCopy .env.example to .env, fill in your values, and restart.\n'
    );
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Fast 5s timeout for server selection
      socketTimeoutMS: 10000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    // Don't exit process in dev, allow server to run with fallback handling
  }
};

export default connectDB;
