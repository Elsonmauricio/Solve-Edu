import { Router } from 'express';
import userRoutes from './user.routes.js';
import problemRoutes from './problem.routes.js';
import solutionRoutes from './solution.routes.js';
import adminRoutes from './admin.routes.js';
import schoolRoutes from './school.routes.js';
import notificationRoutes from './notification.routes.js';

const router = Router();

router.use('/users', userRoutes);
router.use('/problems', problemRoutes);
router.use('/solutions', solutionRoutes);
router.use('/admin', adminRoutes);
router.use('/school', schoolRoutes);
router.use('/notifications', notificationRoutes);

export default router;