import { Router } from 'express';
import { body } from 'express-validator';
import { AdminController } from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/auth0.middleware.js';

const router = Router();

// Todas as rotas de admin requerem autenticação e a role 'ADMIN'
router.use(authenticate(['ADMIN']));

// Dashboard
router.get('/dashboard-stats', AdminController.getDashboardStats);
router.get('/system-stats', AdminController.getSystemStats);
router.get('/logs', AdminController.getLogs);

// User Management
router.get('/users', AdminController.getAllUsers);
router.get('/users/:id', AdminController.getUserDetails);
router.patch('/users/:id/verify', AdminController.verifyUser);
router.patch('/users/:id/toggle-block', AdminController.toggleUserBlock);
router.delete('/users/:id', AdminController.deleteUser);

// Problem Management
router.get('/problems/pending', AdminController.getPendingProblems);
router.patch('/problems/:id/approve', AdminController.approveProblem);
router.patch(
  '/problems/:id/reject',
  [body('reason').notEmpty().withMessage('A razão da rejeição é obrigatória.')],
  AdminController.rejectProblem
);
router.patch(
  '/problems/:id/toggle-feature',
  AdminController.toggleProblemFeature
);

// Solution Management
router.get('/solutions/pending', AdminController.getPendingSolutions);
router.patch(
  '/solutions/:id/review',
  [
    body('status').isIn(['ACCEPTED', 'REJECTED', 'NEEDS_REVISION']),
    body('rating').optional().isFloat({ min: 1, max: 5 }),
  ],
  AdminController.reviewSolution
);

// Announcements
router.post(
  '/announcements',
  [
    body('title').notEmpty(),
    body('message').notEmpty(),
    body('type').isIn(['INFO', 'WARNING', 'SUCCESS', 'ERROR']),
    body('targetUsers').isIn(['ALL', 'STUDENTS', 'COMPANIES', 'SCHOOLS']),
  ],
  AdminController.createAnnouncement
);

export default router;