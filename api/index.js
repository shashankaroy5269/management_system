import dotenv from 'dotenv';
import app from '../backend/app.js';
import { connectDB } from '../backend/config/db.js';

dotenv.config();

let isConnected = false;

export default async function handler(req, res) {
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
    } catch (err) {
      console.error('[Vercel Serverless DB Error]:', err.message);
      return res.status(500).json({ success: false, message: 'Database connection error on serverless function' });
    }
  }
  return app(req, res);
}
