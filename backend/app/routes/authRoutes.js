import express from 'express';
import authController from '../controllers/authController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', (req, res) => authController.registerUser(req, res));
router.post('/login', (req, res) => authController.loginUser(req, res));
router.get('/me', protect, (req, res) => authController.getProfile(req, res));

export default router;
