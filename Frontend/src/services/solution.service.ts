import api from './api';

export const solutionsService = {
  getAll: async (params = {}) => {
    const response = await api.get('/solutions', { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/solutions/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/solutions', data);
    return response.data;
  },
  review: async (id: number, data: { status: string; feedback?: string | null }) => {
    const response = await api.put(`/solutions/${id}`, data);
    return response.data;
  },
  // Estatísticas gerais e rankings para a Home/Comunidade
  getStats: async () => {
    const response = await api.get('/solutions/stats'); // Endpoint público ou geral
    return response.data;
  },
  getTopSolutions: async () => {
    const response = await api.get('/solutions/top'); // Endpoint para ranking
    return response.data;
  }
};