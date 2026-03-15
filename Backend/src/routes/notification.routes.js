import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller.js';
import { authenticate } from '../middleware/auth0.middleware.js';

const router = Router();

// Estas rotas são para o utilizador logado, por isso usam o middleware de autenticação.
router.get('/', authenticate(), NotificationController.getMyNotifications);
router.post('/read', authenticate(), NotificationController.markNotificationsAsRead);

export default router;