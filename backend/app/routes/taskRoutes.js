import express from 'express';
import taskController from '../controllers/taskController.js';
import protect from '../middleware/authMiddleware.js';
import checkPermission from '../middleware/permissionMiddleware.js';

const router = express.Router();

// Dashboard stats
router.get('/stats', protect, (req, res) => taskController.getDashboardStats(req, res));

// Task CRUD
router.get('/', protect, checkPermission('read_task'), (req, res) =>
  taskController.getTasks(req, res)
);

router.post('/', protect, checkPermission('create_task'), (req, res) =>
  taskController.createTask(req, res)
);

router.get('/:id', protect, checkPermission('read_task'), (req, res) =>
  taskController.getSingleTask(req, res)
);

router.put('/:id', protect, checkPermission('update_task'), (req, res) =>
  taskController.updateTask(req, res)
);

// Status update (allowed for Employees for their assigned tasks, and Manager/Admin)
router.patch('/:id/status', protect, checkPermission('update_task_status'), (req, res) =>
  taskController.updateStatus(req, res)
);

router.delete('/:id', protect, checkPermission('delete_task'), (req, res) =>
  taskController.deleteTask(req, res)
);

export default router;
