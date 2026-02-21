import api from './api';

export const companyService = {
  // Obter estatísticas para o dashboard da empresa
  getDashboardStats: async () => {
    try {
      // Reutiliza o endpoint genérico de stats que já suporta o role COMPANY
      const response = await api.get('/users/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};