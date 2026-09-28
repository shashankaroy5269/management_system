import express from 'express';
import taskController from '../controllers/taskController.js';
import protect from '../middleware/authMiddleware.js';
import checkPermission from '../middleware/permissionMiddleware.js';

const router = express.Router();



// Stats Route
router.get('/stats', protect, taskController.getDashboardStats);

// Main CRUD Routes with Permission Middleware
router.post('/', protect, checkPermission('create_task'), taskController.createTask);
router.get('/', protect, checkPermission('read_task'), taskController.getTasks);
router.get('/:id', protect, checkPermission('read_task'), taskController.getSingleTask);
router.put('/:id', protect, checkPermission('update_task'), taskController.updateTask);
router.patch('/:id/status', protect, checkPermission('update_task_status'), taskController.updateStatus);
router.delete('/:id', protect, checkPermission('delete_task'), taskController.deleteTask);

export default router;
