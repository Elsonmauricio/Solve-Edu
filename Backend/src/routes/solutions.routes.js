import { Router } from 'express';
import { body, query } from 'express-validator';
import { SolutionController } from '../controllers/solutions.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

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
router.post('/', authenticate(['STUDENT']), createSolutionValidation, SolutionController.createSolution);
router.get('/student/my', authenticate(['STUDENT']), SolutionController.getStudentSolutions);
router.get('/student/:studentId', authenticate(['ADMIN']), SolutionController.getStudentSolutions);
router.get('/problem/:problemId', authenticate(['COMPANY', 'ADMIN']), SolutionController.getProblemSolutions);

// Solution specific routes
router.get('/:id', authenticate(), SolutionController.getSolution);
router.put('/:id', authenticate(), SolutionController.updateSolution);
router.delete('/:id', authenticate(), SolutionController.deleteSolution);
router.post('/:id/like', authenticate(), SolutionController.likeSolution);

export default router;