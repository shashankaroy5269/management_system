import mongoose from 'mongoose';

const DEFAULT_MONGO_URI = 'mongodb+srv://shashankaroy5269_db_user:Q6abjTx34Yc3XSB7@cluster0.62q4tig.mongodb.net/RBAC_Management';

let isConnected = false;

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    return;
  }

  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || DEFAULT_MONGO_URI;

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
    isConnected = true;
    console.log(`[MongoDB Connected] Host: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    throw error;
  }
};

export default connectDB;
