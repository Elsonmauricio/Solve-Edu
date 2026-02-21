import { validationResult, body } from 'express-validator';
import emailService from '../services/email.service.js';

export class ContactController {
  static async handleContactForm(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { name, email, subject, message } = req.body;

    try {
      // Envia o email para a equipa de suporte
      await emailService.sendContactFormEmail(name, email, subject, message);

      res.status(200).json({ success: true, message: 'Mensagem enviada com sucesso!' });
    } catch (error) {
      console.error('Contact form submission error:', error);
      res.status(500).json({ success: false, message: 'Ocorreu um erro ao enviar a sua mensagem.' });
    }
  }
}

export const contactValidation = [
    body('name').notEmpty().withMessage('O nome é obrigatório.').trim(),
    body('email').isEmail().withMessage('Por favor, insira um email válido.').normalizeEmail(),
    body('subject').notEmpty().withMessage('O assunto é obrigatório.').trim(),
    body('message').notEmpty().withMessage('A mensagem não pode estar vazia.').trim(),
];