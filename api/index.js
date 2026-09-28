import dotenv from 'dotenv';
import app from '../backend/app.js';
import connectDB from '../backend/app/config/db.js';

dotenv.config();

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (err) {
    console.error('[Vercel Serverless DB Error]:', err.message);
  }
  return app(req, res);
}
