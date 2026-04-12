import { Router } from 'express';
import { CompanyController } from '../controllers/company.controller.js';
import { authenticate } from '../middleware/auth0.middleware.js';

const router = Router();

router.get('/dashboard-stats', authenticate(['COMPANY']), CompanyController.getDashboardStats);
router.post('/solutions/:solutionId/accept', authenticate(['COMPANY']), CompanyController.acceptSolution);
router.post('/problems/:problemId/feature', authenticate(['COMPANY']), CompanyController.highlightProblem);
router.post('/paypal-webhook', CompanyController.paypalWebhook);


export default router;