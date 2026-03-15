import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/auth0.middleware.js';
import { isAdmin } from '../middleware/role.middleware.js';

const router = Router();

// Middleware para garantir que apenas admins acedem
const adminOnly = [authenticate(), isAdmin];

// Rota para obter estatísticas do painel de admin
router.get('/dashboard-stats', adminOnly, AdminController.getDashboardStats);

// Rota para obter o estado do sistema
router.get('/system-health', adminOnly, AdminController.getSystemHealth);

// Rota para obter logs de segurança
router.get('/security-logs', adminOnly, AdminController.getSecurityLogs);

// Rota para obter dados dos relatórios
router.get('/reports', adminOnly, AdminController.getReports);

// Rotas para obter e atualizar as definições da plataforma
router.get('/settings', adminOnly, AdminController.getSettings);
router.put('/settings', adminOnly, AdminController.updateSettings);

export default router;