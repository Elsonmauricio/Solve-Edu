import { Router } from 'express';
import { body } from 'express-validator';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth0.middleware.js';

const router = Router();

// As rotas /register e /login são agora tratadas pelo Universal Login do Auth0.
// Já não são necessárias no backend.

// Protected routes
router.get('/profile', authenticate(), AuthController.getProfile);
router.put('/profile', authenticate(), AuthController.updateProfile);

export default router;