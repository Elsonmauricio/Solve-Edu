import { Router } from 'express';
import { SolutionController } from '../controllers/solutions.controller.js';
import { authenticate } from '../middleware/auth0.middleware.js';

const router = Router();

// --- Rotas Públicas (ou listagens gerais) ---
router.get('/', SolutionController.getSolutions);
router.get('/top', SolutionController.getTopSolutions); // IMPORTANTE: Antes de /:id

// --- Estatísticas e Relatórios (IMPORTANTE: Antes de /:id) ---
router.get('/stats', authenticate(), SolutionController.getStats);
router.get('/export/grades', authenticate(['SCHOOL', 'ADMIN']), SolutionController.exportGrades);

// --- Rotas Específicas de Entidades ---
router.get('/student/:studentId', SolutionController.getStudentSolutions);
router.get('/student/:studentId/stats', authenticate(), SolutionController.getStudentStats);
router.get('/problem/:problemId', authenticate(), SolutionController.getProblemSolutions);

// --- Criação ---
router.post('/', authenticate(['STUDENT']), SolutionController.createSolution);

// --- Rotas por ID (Devem ficar mais para o fim) ---
router.get('/:id', authenticate(), SolutionController.getSolution);
router.put('/:id', authenticate(), SolutionController.updateSolution);
router.delete('/:id', authenticate(), SolutionController.deleteSolution);

// --- Interações e Comentários ---
router.post('/:id/interaction', authenticate(), SolutionController.toggleInteraction);
router.get('/:id/comments', authenticate(), SolutionController.getComments);
router.post('/:id/comments', authenticate(), SolutionController.createComment);

// --- Funcionalidades de Escola/Admin ---
router.post('/:id/toggle-pap', authenticate(['SCHOOL']), SolutionController.togglePAP);
router.post('/:id/grade', authenticate(['SCHOOL', 'ADMIN']), SolutionController.gradeSolution);

export default router;