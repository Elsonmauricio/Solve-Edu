import api from './api';

export const notificationService = {
  getMyNotifications: async () => {
    // Corresponde ao método getMyNotifications no backend
    const response = await api.get('/notifications'); 
    return response.data;
  },
  markAsRead: async (notificationIds?: string[]) => {
    // Corresponde ao método markNotificationsAsRead no backend
    const response = await api.post('/notifications/read', { notificationIds });
    return response.data;
  }
};