import express from 'express';
import taskController from '../controllers/taskController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';
import { uploadSingle } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', taskController.getTasks.bind(taskController));
router.post('/', authorizeRoles('admin', 'manager'), taskController.createTask.bind(taskController));

router.get('/:id', taskController.getTaskById.bind(taskController));
router.put('/:id', authorizeRoles('admin', 'manager'), taskController.updateTask.bind(taskController));
router.delete('/:id', authorizeRoles('admin'), taskController.deleteTask.bind(taskController));

router.patch('/status/:id', taskController.changeTaskStatus.bind(taskController));
router.patch('/assign/:id', authorizeRoles('admin', 'manager'), taskController.assignTask.bind(taskController));

router.post('/:id/comments', taskController.addComment.bind(taskController));
router.post('/:id/attachments', uploadSingle, taskController.uploadAttachment.bind(taskController));

export default router;
