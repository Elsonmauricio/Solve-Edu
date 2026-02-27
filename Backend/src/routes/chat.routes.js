// c:\Users\maels\Documents\Solve Edu\Backend\src\routes\chat.routes.js

import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller.js';
import { authenticate } from '../middleware/auth0.middleware.js';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate());

router.post('/start', ChatController.startConversation);
router.post('/send', ChatController.sendMessage);
router.get('/conversations', ChatController.getMyConversations);
router.get('/:conversationId/messages', ChatController.getMessages);

export default router;
