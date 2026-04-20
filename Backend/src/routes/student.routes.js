import { Router } from 'express';
import { StudentController } from '../controllers/student.controller.js';
import { authenticate } from '../middleware/auth0.middleware.js';

const router = Router();

// O ranking deve ser visível para todos os tipos de utilizadores da comunidade
router.get('/ranking', authenticate(['STUDENT', 'COMPANY', 'ADMIN', 'SCHOOL']), StudentController.getRanking);

export default router;