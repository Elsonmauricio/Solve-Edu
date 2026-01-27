import api from './api';

export const solutionsService = {
  // Submete uma nova solução para um desafio
  // Corresponde a: POST /api/problems/:id/solutions (ou endpoint direto de solutions)
  create: async (problemId, solutionData) => {
    const response = await api.post('/solutions', {
      ...solutionData,
      problemId
    });
    return response.data;
  },

  // Lista todas as soluções com filtros opcionais
  getAll: async (filters = {}) => {
    const response = await api.get('/solutions', { params: filters });
    return response.data;
  },

  // Obtém detalhes de uma solução específica
  // Corresponde a: GET /api/solutions/:id
  getById: async (id) => {
    const response = await api.get(`/solutions/${id}`);
    return response.data;
  },

  // Obtém soluções de um estudante (Dashboard do Aluno)
  getMySolutions: async () => {
    const response = await api.get('/solutions/student/me');
    return response.data;
  },

  // Obtém soluções de um desafio específico (Dashboard da Empresa)
  getByProblemId: async (problemId) => {
    const response = await api.get(`/problems/${problemId}/solutions`);
    return response.data;
  },

  // Atualiza/Avalia uma solução (Empresa avalia aluno)
  // Corresponde a: PUT /api/solutions/:id
  review: async (id, reviewData) => {
    const response = await api.put(`/solutions/${id}`, reviewData);
    return response.data;
  },

  // Obtém estatísticas gerais (para a página Community)
  getStats: async () => {
    const response = await api.get('/solutions/stats');
    return response.data;
  },

  getTopSolutions: async () => {
    const response = await api.get('/solutions/top');
    return response.data;
  }
};