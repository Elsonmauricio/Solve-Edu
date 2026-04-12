import { Router } from 'express';
import { SolutionController } from '../controllers/solutions.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth0.middleware.js';

const router = Router();

// ==========================================
// Rotas de Estatísticas e Exportação
// ==========================================
router.get('/stats', authenticate(), SolutionController.getStats);
router.get('/top', optionalAuth, SolutionController.getTopSolutions);

// Rota para exportar pauta (Excel) - Deve vir antes de /:id para não colidir
router.get('/export/grades', authenticate(['SCHOOL', 'ADMIN']), SolutionController.exportGrades);

// ==========================================
// Rotas de Estudante
// ==========================================
router.get('/student/:studentId/stats', optionalAuth, SolutionController.getStudentStats);
router.get('/student/:studentId', optionalAuth, SolutionController.getStudentSolutions);

// ==========================================
// Rotas CRUD Básicas
// ==========================================
router.get('/', optionalAuth, SolutionController.getSolutions);
router.post('/', authenticate(['STUDENT']), SolutionController.createSolution);

// ==========================================
// Funcionalidades de Escola/Professor (Avaliação Oficial)
// ==========================================
// Atribuir nota escolar (0-20 ou A-F)
router.put('/:id/grade', authenticate(['SCHOOL', 'ADMIN']), SolutionController.gradeSolution);
// Validar como Prova de Aptidão Profissional (PAP)
router.post('/:id/toggle-pap', authenticate(['SCHOOL', 'ADMIN']), SolutionController.togglePAP);

// ==========================================
// Operações em Soluções Específicas
// ==========================================
router.get('/:id', optionalAuth, SolutionController.getSolution);
router.put('/:id', authenticate(['STUDENT', 'COMPANY', 'ADMIN']), SolutionController.updateSolution);
router.delete('/:id', authenticate(['STUDENT', 'ADMIN']), SolutionController.deleteSolution);

// ==========================================
// Interações e Comentários
// ==========================================
router.post('/:id/interact', authenticate(), SolutionController.toggleInteraction);
router.get('/:id/comments', optionalAuth, SolutionController.getComments);
router.post('/:id/comments', authenticate(), SolutionController.createComment);

export default router;
