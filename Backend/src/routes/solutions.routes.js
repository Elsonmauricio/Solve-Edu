import { Router } from 'express';
import { body } from 'express-validator';
import multer from 'multer';
import { SolutionController } from '../controllers/solutions.controller.js';
// Importa o novo middleware de autenticação compatível com Auth0
import { authenticate } from '../middleware/auth0.middleware.js';

const router = Router();

// Configuração básica do Multer (Armazenamento em memória para processamento rápido)
// Para produção, recomenda-se upload direto para S3/Firebase ou disco temporário
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // Limite de 5MB
});

// Validation rules
const createSolutionValidation = [
  body('problemId').notEmpty(),
  body('title').notEmpty().trim().isLength({ min: 5, max: 200 }),
  body('description').notEmpty().trim().isLength({ min: 50, max: 5000 }),
  body('technologies').isArray(),
];

// Public routes
router.get('/', SolutionController.getSolutions);
router.get('/top', SolutionController.getTopSolutions);
router.get('/stats', SolutionController.getStats);

// Protected routes
// Adicionado middleware 'upload.single("document")' para processar o ficheiro
router.post('/', 
  authenticate(['STUDENT']), 
  upload.single('document'), 
  createSolutionValidation, 
  SolutionController.createSolution
);
router.get('/student/my', authenticate(['STUDENT']), SolutionController.getStudentSolutions);
router.get('/student/:studentId', authenticate(['ADMIN']), SolutionController.getStudentSolutions);
router.get('/problem/:problemId', authenticate(['COMPANY', 'ADMIN']), SolutionController.getProblemSolutions);

// Solution specific routes
router.get('/:id', authenticate(), SolutionController.getSolution);
router.put('/:id', authenticate(), SolutionController.updateSolution);
router.delete('/:id', authenticate(), SolutionController.deleteSolution);
router.post('/:id/like', authenticate(), SolutionController.likeSolution);

export default router;