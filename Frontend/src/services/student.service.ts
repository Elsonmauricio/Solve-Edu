import api from './api';

export const studentService = {
  // Obter estatísticas para o dashboard do estudante
  getDashboardStats: async () => {
    try {
      // Reutiliza o endpoint genérico de stats que já suporta o role STUDENT
      const response = await api.get('/users/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};