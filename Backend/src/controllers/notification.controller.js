import { supabase } from '../lib/supabase.js';

export class NotificationController {
  /**
   * GET /api/notifications
   * Obtém as notificações para o utilizador logado.
   */
  static async getMyNotifications(req, res) {
    try {
      const userId = req.userId;
      const { data: notifications, error } = await supabase
        .from('Notification')
        .select('*')
        .eq('userId', userId)
        .order('createdAt', { ascending: false })
        .limit(50); // Limitar para não sobrecarregar

      if (error) throw error;

      res.json({ success: true, data: notifications });
    } catch (error) {
      console.error('Get my notifications error:', error);
      res.status(500).json({ success: false, message: 'Erro ao buscar notificações.' });
    }
  }

  /**
   * POST /api/notifications/read
   * Marca notificações como lidas.
   */
  static async markNotificationsAsRead(req, res) {
    try {
      const userId = req.userId;
      const { notificationIds } = req.body; // Espera um array de IDs

      if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
        return res.status(400).json({ success: false, message: 'É necessário fornecer um array de IDs de notificação.' });
      }

      await supabase.from('Notification').update({ isRead: true }).eq('userId', userId).in('id', notificationIds);

      res.json({ success: true, message: 'Notificações marcadas como lidas.' });
    } catch (error) {
      console.error('Mark notifications as read error:', error);
      res.status(500).json({ success: false, message: 'Erro ao atualizar notificações.' });
    }
  }
}