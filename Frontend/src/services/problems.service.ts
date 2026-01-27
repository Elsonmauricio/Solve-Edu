import api from './api';

export const problemsService = {
  // Lista todos os desafios com filtros opcionais
  // Corresponde a: GET /api/problems
  getAll: async (filters = {}) => {
    const response = await api.get('/problems', { params: filters });
    return response.data;
  },

  // Obtém detalhes de um desafio específico
  // Corresponde a: GET /api/problems/:id
  getById: async (id) => {
    const response = await api.get(`/problems/${id}`);
    return response.data;
  },

  // Cria um novo desafio (apenas empresas)
  // Corresponde a: POST /api/problems
  create: async (problemData) => {
    const response = await api.post('/problems', problemData);
    return response.data;
  },

  // Atualiza um desafio existente
  // Corresponde a: PUT /api/problems/:id
  update: async (id, problemData) => {
    const response = await api.put(`/problems/${id}`, problemData);
    return response.data;
  },

  // Remove um desafio
  // Corresponde a: DELETE /api/problems/:id
  delete: async (id) => {
    const response = await api.delete(`/problems/${id}`);
    return response.data;
  },

  // Busca desafios em destaque para a Home
  getFeatured: async () => {
    const response = await api.get('/problems/featured');
    return response.data;
  }
};