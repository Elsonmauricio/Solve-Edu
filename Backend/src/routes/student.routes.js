import { Router } from 'express';
import { StudentController } from '../controllers/student.controller.js';
import { authenticate } from '../middleware/auth0.middleware.js';

const router = Router();

router.get('/dashboard-stats', authenticate(['STUDENT']), StudentController.getDashboardStats);

export default router;