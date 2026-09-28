import express from 'express';
import userController from '../controllers/userController.js';
import protect from '../middleware/authMiddleware.js';
import checkPermission from '../middleware/permissionMiddleware.js';

const router = express.Router();

// Get active employees for task assignment (accessible by Admin and Manager)
router.get('/employees', protect, (req, res) =>
  userController.getEmployees(req, res)
);

// Get all users (Admin only)
router.get('/', protect, checkPermission('manage_users'), (req, res) =>
  userController.getAllUsers(req, res)
);

// Toggle user status (Admin only)
router.patch('/:id/toggle', protect, checkPermission('manage_users'), (req, res) =>
  userController.toggleStatus(req, res)
);

export default router;
