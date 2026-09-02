import mongoose from 'mongoose';

const DEFAULT_MONGO_URI = 'mongodb+srv://shashankaroy5269_db_user:Q6abjTx34Yc3XSB7@cluster0.62q4tig.mongodb.net/RBAC_Management';

let isConnected = false;

/**
 * Connect to MongoDB database
 * Implements serverless connection caching for Vercel
 */
export const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    return;
  }

  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || DEFAULT_MONGO_URI;

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000,
    });
    isConnected = true;
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
    console.log(`[MongoDB] Database Name: ${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB Error] Connection failed: ${error.message}`);
    // In serverless, never call process.exit(1) as it kills the Vercel container
    throw error;
  }
};

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('[MongoDB] Database disconnected.');
});

mongoose.connection.on('reconnected', () => {
  isConnected = true;
  console.log('[MongoDB] Database reconnected.');
});
