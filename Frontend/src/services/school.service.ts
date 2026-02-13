import api from './api';

export const schoolService = {
  // Obter estatísticas para o dashboard
  getDashboardStats: async () => {
    try {
      // Reutilizamos o endpoint genérico de stats que agora suporta SCHOOL
      const response = await api.get('/users/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obter lista de alunos da escola
  getStudents: async (params = {}) => {
    try {
      const response = await api.get('/school/students', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Registar um novo aluno (convite)
  registerStudent: async (studentData: any) => {
    try {
      const response = await api.post('/school/students', studentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
