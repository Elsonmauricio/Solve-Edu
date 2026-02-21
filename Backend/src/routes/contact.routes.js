import { Router } from 'express';
import { ContactController, contactValidation } from '../controllers/contact.controller.js';

const router = Router();

router.post('/', contactValidation, ContactController.handleContactForm);

export default router;