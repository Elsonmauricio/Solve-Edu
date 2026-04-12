// c:\Users\maels\Documents\Solve Edu\Backend\src\routes\job.routes.js

import { Router } from 'express';
import { JobController } from '../controllers/job.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth0.middleware.js';
import { body } from 'express-validator';

const router = Router();

// Validações
const jobValidation = [
  body('title').notEmpty().withMessage('Título é obrigatório'),
  body('description').notEmpty().withMessage('Descrição é obrigatória'),
  body('type').isIn(['REMOTE', 'ONSITE', 'HYBRID']),
  body('contract').isIn(['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'FREELANCE'])
];

// Rotas Públicas (ou com Auth Opcional para ver Match Score)
router.get('/', optionalAuth, JobController.getJobs);

// Rotas de Empresa
router.post('/', authenticate(['COMPANY']), jobValidation, JobController.createJob);
router.get('/:jobId/candidates', authenticate(['COMPANY']), JobController.getJobCandidates);

// Rotas de Estudante
router.post('/:jobId/apply', authenticate(['STUDENT']), JobController.applyToJob);

export default router;
