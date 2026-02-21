import { Router } from 'express';
import { body, query } from 'express-validator';
import multer from 'multer';
import { ProblemController } from '../controllers/problems.controller.js';
// Importa o novo middleware de autenticação compatível com Auth0
import { authenticate, optionalAuth } from '../middleware/auth0.middleware.js';

const router = Router();

// Configuração do Multer para processar uploads em memória
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // Limite de 10MB
});

// Validation rules
const createProblemValidation = [
  body('title').notEmpty().withMessage('O título é obrigatório').trim().isLength({ min: 5, max: 200 }).withMessage('O título deve ter entre 5 e 200 caracteres'),
  body('description').notEmpty().withMessage('A descrição é obrigatória').trim().isLength({ min: 50, max: 5000 }).withMessage('A descrição deve ter entre 50 e 5000 caracteres'),
  body('category').isIn(['TECHNOLOGY', 'SUSTAINABILITY', 'HEALTH', 'EDUCATION', 'BUSINESS', 'DESIGN', 'SCIENCE', 'ENGINEERING']),
  body('difficulty').isIn(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  body('deadline').isISO8601(),
  // Sanitizers para garantir array mesmo vindo de FormData (onde 1 item = string)
  body('tags').customSanitizer(value => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  }),
  body('requirements').customSanitizer(value => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  }),
];

// Public routes (with optional auth)
router.get('/', optionalAuth, ProblemController.getAllProblems);
router.get('/active', optionalAuth, ProblemController.getActiveProblems);
router.get('/featured', optionalAuth, ProblemController.getFeaturedProblems);
router.get('/:id', optionalAuth, ProblemController.getProblemById);

// Protected routes
router.post('/', authenticate(['COMPANY', 'ADMIN']), upload.single('file'), createProblemValidation, ProblemController.createProblem);
router.put('/:id', authenticate(['COMPANY', 'ADMIN']), ProblemController.updateProblem);
router.delete('/:id', authenticate(['COMPANY', 'ADMIN']), ProblemController.deleteProblem);

// Company specific routes
router.get('/company/my', authenticate(['COMPANY']), ProblemController.getCompanyProblems);
router.get('/company/:companyId', optionalAuth, ProblemController.getCompanyProblems);

export default router;