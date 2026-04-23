import express from 'express';
import { StudentController } from '../controllers/student.controller.js';
import { optionalAuth } from '../middleware/auth0.middleware.js';

const router = express.Router();

router.get('/ranking', optionalAuth, StudentController.getRanking);
router.get('/:id', optionalAuth, StudentController.getStudentById);
router.get('/', optionalAuth, StudentController.getAllStudents);

export default router;