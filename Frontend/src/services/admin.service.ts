import api from './api';

export const adminService = {
  getDashboardStats: async () => {
    // Este endpoint é para as estatísticas do painel principal do admin
    const response = await api.get('/admin/dashboard-stats'); 
    return response.data;
  },
  getSystemHealth: async () => {
    const response = await api.get('/admin/system-health');
    return response.data;
  },
  getReports: async () => {
    const response = await api.get('/admin/reports');
    return response.data;
  },
  getSettings: async () => {
    const response = await api.get('/admin/settings');
    return response.data;
  },
  updateSettings: async (settings: any) => {
    const response = await api.put('/admin/settings', settings);
    return response.data;
  }
};