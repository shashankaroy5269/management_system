import express from 'express';
import authController from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Registration & Verification
router.post('/register', authController.register.bind(authController));
router.get('/verify-email/:token', authController.verifyEmail.bind(authController));
router.post('/verify-email', authController.verifyEmail.bind(authController));
router.post('/resend-verification', authController.resendVerification.bind(authController));

// Authentication & Session
router.post('/login', authController.login.bind(authController));
router.post('/refresh-token', authController.refreshToken.bind(authController));
router.post('/forgot-password', authController.forgotPassword.bind(authController));
router.get('/me', protect, authController.getMe.bind(authController));
router.post('/logout', protect, authController.logout.bind(authController));

export default router;
