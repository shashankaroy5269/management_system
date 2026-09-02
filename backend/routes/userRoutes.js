import express from 'express';
import userController from '../controllers/userController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/employees', authorizeRoles('admin', 'manager'), userController.getActiveEmployees.bind(userController));
router.get('/', authorizeRoles('admin', 'manager'), userController.getUsers.bind(userController));
router.post('/', authorizeRoles('admin'), userController.createUser.bind(userController));

router.get('/:id', userController.getUserById.bind(userController));
router.put('/:id', userController.updateUser.bind(userController));
router.patch('/status/:id', authorizeRoles('admin'), userController.toggleUserStatus.bind(userController));
router.delete('/:id', authorizeRoles('admin'), userController.softDeleteUser.bind(userController));

export default router;
