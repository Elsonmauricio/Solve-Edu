import api from './api';

export const userService = {
  getProfile: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },
  // Para uso administrativo
  getAll: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
  }
};