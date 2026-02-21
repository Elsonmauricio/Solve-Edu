import api from './api';

export const schoolService = {
  // Obter estatísticas para o dashboard
  getDashboardStats: async () => {
    const response = await api.get('/school/dashboard');
    return response.data;
  },

  // Obter lista de alunos da escola
  getStudents: async () => {
    const response = await api.get('/school/students');
    return response.data;
  },

  // Registar um novo aluno (convite)
  registerStudent: async (data: { name: string; email: string }) => {
    const response = await api.post('/school/students', data);
    return response.data;
  }
};