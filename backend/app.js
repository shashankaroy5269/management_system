import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './app/config/db.js';
import errorHandler from './app/middleware/errorMiddleware.js';

// Route Imports
import authRoutes from './app/routes/authRoutes.js';
import taskRoutes from './app/routes/taskRoutes.js';
import userRoutes from './app/routes/userRoutes.js';

dotenv.config();

// Connect Database
connectDB().catch((err) => console.error('[DB Startup Error]:', err.message));

const app = express();

// Middlewares
app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: true, message: 'Server is running smoothly' });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

// Central Error Handler
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 5000;

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const server = app.listen(PORT, () => {
    console.log(`Server is running on port: http://localhost:${PORT}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      const fallbackPort = PORT + 1;
      console.log(`Port ${PORT} is already in use. Retrying on port ${fallbackPort}...`);
      app.listen(fallbackPort, () => {
        console.log(`Server successfully started on port: http://localhost:${fallbackPort}`);
      });
    } else {
      console.error('Server Listen Error:', err);
    }
  });
}

export default app;
