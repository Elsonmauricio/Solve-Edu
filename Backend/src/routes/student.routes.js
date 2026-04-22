import express from 'express';
import { StudentController } from '../controllers/student.controller.js';
import { optionalAuth } from '../middleware/auth0.middleware.js';

const router = express.Router();

router.get('/', optionalAuth, StudentController.getAllStudents);

export default router;