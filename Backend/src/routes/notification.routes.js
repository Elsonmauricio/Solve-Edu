import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/auth0.middleware.js';

const router = Router();

// Estas rotas são para o utilizador logado, por isso usam o middleware de autenticação.
router.get('/', authenticate(), AdminController.getMyNotifications);
router.post('/read', authenticate(), AdminController.markNotificationsAsRead);

export default router;