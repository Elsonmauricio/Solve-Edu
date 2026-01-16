import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/auth0.middleware.js';

const router = Router();

// All routes require admin authentication
router.use(authenticate(['ADMIN']));

// Dashboard stats
router.get('/dashboard/stats', AdminController.getDashboardStats);

// User management
router.get('/users', AdminController.getAllUsers);
router.get('/users/:id', AdminController.getUserDetails);
router.put('/users/:id/verify', AdminController.verifyUser);
router.put('/users/:id/block', AdminController.toggleUserBlock);
router.delete('/users/:id', AdminController.deleteUser);

// Problem management
router.get('/problems/pending', AdminController.getPendingProblems);
router.put('/problems/:id/approve', AdminController.approveProblem);
router.put('/problems/:id/reject', AdminController.rejectProblem);
router.put('/problems/:id/feature', AdminController.toggleProblemFeature);

// Solution management
router.get('/solutions/pending', AdminController.getPendingSolutions);
router.put('/solutions/:id/review', AdminController.reviewSolution);

// System management
router.get('/system/stats', AdminController.getSystemStats);
router.get('/logs', AdminController.getLogs);
router.post('/announcement', AdminController.createAnnouncement);

export default router;