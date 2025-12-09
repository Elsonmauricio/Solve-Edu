import { Router } from 'express';
import { UserController } from '../controllers/users.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Public routes
router.get('/students/top', UserController.getTopStudents);
router.get('/companies/top', UserController.getTopCompanies);

// Protected routes
router.get('/me', authenticate(), UserController.getUserProfile);
router.put('/me', authenticate(), UserController.updateUserProfile);
router.get('/stats', authenticate(), UserController.getUserStats);

// Admin routes
router.get('/', authenticate(['ADMIN']), UserController.getAllUsers);
router.get('/:id', authenticate(['ADMIN']), UserController.getUserById);
router.put('/:id', authenticate(['ADMIN']), UserController.updateUserById);
router.delete('/:id', authenticate(['ADMIN']), UserController.deleteUser);

export default router;