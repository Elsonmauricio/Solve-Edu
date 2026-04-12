import { Router } from 'express';
import userRoutes from './user.routes.js';
import problemRoutes from './problems.routes.js';
import solutionRoutes from './solutions.routes.js';
import adminRoutes from './admin.routes.js';
import schoolRoutes from './school.routes.js';
import notificationRoutes from './notification.routes.js';
import companyRoutes from './company.routes.js';
import jobRoutes from './job.routes.js';
import chatRoutes from './chat.routes.js';

const router = Router();

router.use('/users', userRoutes);
router.use('/problems', problemRoutes);
router.use('/solutions', solutionRoutes);
router.use('/admin', adminRoutes);
router.use('/school', schoolRoutes);
router.use('/notifications', notificationRoutes);
router.use('/company', companyRoutes);
router.use('/jobs', jobRoutes);
router.use('/chat', chatRoutes);

export default router;