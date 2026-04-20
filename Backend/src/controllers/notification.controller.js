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
      
      // Lógica robusta para extrair IDs: pode vir como array direto, ou dentro de um objeto
      let notificationIds = [];
      if (Array.isArray(req.body)) {
        notificationIds = req.body;
      } else if (req.body && typeof req.body === 'object') {
        notificationIds = req.body.notificationIds || req.body.ids || [];
      }

      if (notificationIds.length === 0) {
        // Se o frontend enviar um objeto vazio, apenas respondemos sucesso para não poluir o log
        if (Object.keys(req.body).length === 0) {
          return res.json({ success: true, message: 'Nada para atualizar.' });
        }
        console.error('[Notifications] Payload inválido recebido:', JSON.stringify(req.body));
        return res.status(400).json({ success: false, message: 'É necessário fornecer um array de IDs de notificação.' });
      }

      const idsArray = Array.isArray(notificationIds) ? notificationIds : [notificationIds];

      await supabase.from('Notification').update({ isRead: true }).eq('userId', userId).in('id', idsArray);

      res.json({ success: true, message: 'Notificações marcadas como lidas.' });
    } catch (error) {
      console.error('Mark notifications as read error:', error);
      res.status(500).json({ success: false, message: 'Erro ao atualizar notificações.' });
    }
  }
}