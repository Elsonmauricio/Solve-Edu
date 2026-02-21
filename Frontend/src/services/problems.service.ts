import api from './api';

export const problemsService = {
  getAll: async (params = {}) => {
    const response = await api.get('/problems', { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/problems/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/problems', data);
    return response.data;
  }
};