import api from './api';
import { Solution, Pagination } from '../types';

interface PaginatedSolutionsResponse {
  success: boolean;
  data: {
    data: Solution[];
    pagination: Pagination;
  };
  message?: string;
}

export const solutionsService = {
  async getAll(params: any = {}): Promise<PaginatedSolutionsResponse> {
    const response = await api.get('/solutions', { params });
    return response.data;
  },

  async getById(id: number | string): Promise<{ success: boolean; data: Solution }> {
    const response = await api.get(`/solutions/${id}`);
    return response.data;
  },

  // Obtém soluções de um desafio específico (Dashboard da Empresa)
  async getByProblemId(problemId: number | string): Promise<{ success: boolean; data: Solution[] }> {
    const response = await api.get(`/problems/${problemId}/solutions`);
    return response.data;
  },

  // Obtém soluções do estudante logado
  async getMySolutions(): Promise<{ success: boolean; data: Solution[] }> {
    const response = await api.get('/solutions/student/me');
    return response.data;
  },

  // Atualiza/Avalia uma solução (Empresa avalia aluno)
  async review(id: number | string, reviewData: any): Promise<{ success: boolean; data: Solution }> {
    const response = await api.put(`/solutions/${id}`, reviewData);
    return response.data;
  },

  async create(solutionData: Partial<Solution>): Promise<{ success: boolean; data: Solution }> {
    const response = await api.post('/solutions', solutionData);
    return response.data;
  },

  async getStats(): Promise<{ success: boolean, data: { accepted: number } }> {
    const response = await api.get('/solutions/stats');
    return response.data;
  },

  async getTopSolutions(): Promise<{ success: boolean, data: Solution[] }> {
    const response = await api.get('/solutions/top');
    return response.data;
  }
};