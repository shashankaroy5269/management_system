import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/db.js';

// Load Environment Variables
dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect to Database and start listening
connectDB();
app.listen(PORT, (error) => {
    if (error) {
        console.log(error);
    } else {
        console.log(`Server is running on http://localhost:${PORT}`);
    }
});

