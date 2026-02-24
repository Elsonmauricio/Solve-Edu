import { Router } from 'express';
import { body } from 'express-validator';
import multer from 'multer';
import { SolutionController } from '../controllers/solutions.controller.js';
import { AdminController } from '../controllers/admin.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth0.middleware.js';

const router = Router();

// Configuração do Multer para processar uploads (Limite 25MB, igual ao frontend)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 } 
});

// Regras de validação e sanitização para a criação de soluções
const createSolutionValidation = [
  body('title').notEmpty().withMessage('O título é obrigatório').trim(),
  body('description').notEmpty().withMessage('A descrição é obrigatória').trim(),
  body('problemId').isUUID().withMessage('O ID do desafio é inválido'),
  
  // Sanitizer CRÍTICO: Garante que 'technologies' é sempre um array
  body('technologies').customSanitizer(value => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  }),
  // Validação após o sanitizer
  body('technologies.*').isString().trim(),

  body('githubUrl').optional({ checkFalsy: true }).isURL().withMessage('O URL do GitHub é inválido'),
  body('demoUrl').optional({ checkFalsy: true }).isURL().withMessage('O URL de demonstração é inválido'),
];

// Public routes
router.get('/', optionalAuth, SolutionController.getSolutions);
router.get('/top', SolutionController.getTopSolutions);
router.get('/stats', SolutionController.getStats);
router.get('/student/:studentId/stats', authenticate(), SolutionController.getStudentStats);

// Protected routes
// Adicionado middleware 'upload.single("document")' para processar o ficheiro
router.post('/', 
  authenticate(['STUDENT']), 
  upload.single('file'), // Corrigido para corresponder ao frontend
  createSolutionValidation,
  SolutionController.createSolution
);
router.get('/student/my', authenticate(['STUDENT']), SolutionController.getStudentSolutions);
router.get('/student/:studentId', authenticate(['ADMIN', 'SCHOOL']), SolutionController.getStudentSolutions);
router.get('/problem/:problemId', authenticate(['COMPANY', 'ADMIN', 'SCHOOL']), SolutionController.getProblemSolutions);

// Notification routes
router.get('/notifications', authenticate(), AdminController.getMyNotifications);
router.post('/notifications/read', authenticate(), AdminController.markNotificationsAsRead);

// Solution specific routes
router.get('/:id', optionalAuth, SolutionController.getSolution);
router.put('/:id', authenticate(['STUDENT', 'COMPANY', 'ADMIN']), SolutionController.updateSolution);
router.delete('/:id', authenticate(['STUDENT', 'ADMIN']), SolutionController.deleteSolution);
router.post('/:id/interact', authenticate(), SolutionController.toggleInteraction);
router.get('/:id/comments', SolutionController.getComments);
router.post('/:id/comments', authenticate(), SolutionController.createComment);
router.post('/:id/toggle-pap', authenticate(['SCHOOL']), SolutionController.togglePAP);
router.post('/:id/remind', authenticate(['ADMIN']), AdminController.sendSolutionReminder);

export default router;