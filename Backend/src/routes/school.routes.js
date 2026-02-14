import { Router } from 'express';
import { SchoolController } from '../controllers/school.controller.js';
import { authenticate } from '../middleware/auth0.middleware.js';

const router = Router();

// Todas as rotas de escola requerem autenticação e a role 'SCHOOL'
router.use(authenticate(['SCHOOL']));

// Dashboard da escola
router.get('/dashboard', SchoolController.getSchoolDashboard);

// Listar alunos da escola
router.get('/students', SchoolController.getSchoolStudents);

// Registar novo aluno
router.post('/students', SchoolController.registerStudent);

export default router;