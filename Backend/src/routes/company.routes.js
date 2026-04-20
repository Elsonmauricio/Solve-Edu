import { Router } from 'express';
import CompanyController from '../controllers/company.controller.js';
import { authenticate } from '../middleware/auth0.middleware.js';

const router = Router();

// Rota para o ranking de empresas (Pública para a comunidade)
// Deve vir ANTES de rotas como /:id
router.get('/featured', CompanyController.getFeaturedCompanies);

// Outras rotas protegidas da empresa
router.get('/dashboard', authenticate(['COMPANY']), CompanyController.getDashboardStats);
// ...

export default router;