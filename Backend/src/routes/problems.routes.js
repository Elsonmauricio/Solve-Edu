import { Router } from 'express';
import { body, query } from 'express-validator';
import { ProblemController } from '../controllers/problems.controller.js';
// Importa o novo middleware de autenticação compatível com Auth0
import { authenticate, optionalAuth } from '../middleware/auth0.middleware.js';

const router = Router();

// Validation rules
const createProblemValidation = [
  body('title').notEmpty().trim().isLength({ min: 5, max: 200 }),
  body('description').notEmpty().trim().isLength({ min: 50, max: 5000 }),
  body('category').isIn(['TECHNOLOGY', 'SUSTAINABILITY', 'HEALTH', 'EDUCATION', 'BUSINESS', 'DESIGN', 'SCIENCE', 'ENGINEERING']),
  body('difficulty').isIn(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  body('deadline').isISO8601(),
  body('tags').isArray(),
  body('requirements').isArray(),
];

// Public routes (with optional auth)
router.get('/', optionalAuth, ProblemController.getAllProblems);
router.get('/active', optionalAuth, ProblemController.getActiveProblems);
router.get('/featured', optionalAuth, ProblemController.getFeaturedProblems);
router.get('/:id', optionalAuth, ProblemController.getProblemById);

// Protected routes
router.post('/', authenticate(['COMPANY', 'ADMIN']), createProblemValidation, ProblemController.createProblem);
router.put('/:id', authenticate(['COMPANY', 'ADMIN']), ProblemController.updateProblem);
router.delete('/:id', authenticate(['COMPANY', 'ADMIN']), ProblemController.deleteProblem);

// Company specific routes
router.get('/company/my', authenticate(['COMPANY']), ProblemController.getCompanyProblems);
router.get('/company/:companyId', optionalAuth, ProblemController.getCompanyProblems);

export default router;