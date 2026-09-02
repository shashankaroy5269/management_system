import express from 'express';
import analyticsController from '../controllers/analyticsController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/dashboard', analyticsController.getDashboardAnalytics.bind(analyticsController));

export default router;
