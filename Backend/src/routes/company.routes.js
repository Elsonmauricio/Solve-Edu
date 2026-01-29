import { Router } from 'express';
import { CompanyController } from '../controllers/company.controller.js';
import { authenticate } from '../middleware/auth0.middleware.js';

const router = Router();

router.get('/dashboard-stats', authenticate(['COMPANY']), CompanyController.getDashboardStats);

export default router;