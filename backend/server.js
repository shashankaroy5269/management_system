import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/db.js';

// Load Environment Variables
dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Only listen on port in local development (Vercel manages server execution)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, (error) => {
    if (error) {
      console.log(error);
    } else {
      console.log(`Server is running on http://localhost:${PORT}`);
    }
  });
}

export default app;
