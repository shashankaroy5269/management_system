import express from 'express';
import userController from '../controllers/userController.js';
import protect from '../middleware/authMiddleware.js';
import checkPermission from '../middleware/permissionMiddleware.js';

const router = express.Router();

router.get('/employees', protect, userController.getEmployees);
router.get('/', protect, checkPermission('manage_users'), userController.getAllUsers);
router.patch('/:id/toggle', protect, checkPermission('manage_users'), userController.toggleStatus);

export default router;
