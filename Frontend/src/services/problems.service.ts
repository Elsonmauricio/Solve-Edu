import api from './api';
import { Problem, Pagination } from '../types';

interface PaginatedProblemsResponse {
  success: boolean;
  data: {
    data: Problem[];
    pagination: Pagination;
  };
  message?: string;
}

export const problemsService = {
  // Lista todos os desafios com filtros opcionais
  // Corresponde a: GET /api/problems
  async getAll(params: any = {}): Promise<PaginatedProblemsResponse> {
    const response = await api.get('/problems', { params });
    return response.data;
  },

  // Obtém detalhes de um desafio específico
  // Corresponde a: GET /api/problems/:id
  async getById(id: string | number): Promise<{ success: boolean; data: Problem }> {
    const response = await api.get(`/problems/${id}`);
    return response.data;
  },

  // Cria um novo desafio (apenas empresas)
  // Corresponde a: POST /api/problems
  async create(problemData: Partial<Problem>): Promise<{ success: boolean; data: Problem; message?: string }> {
    const response = await api.post('/problems', problemData);
    return response.data;
  },

  // Atualiza um desafio existente
  // Corresponde a: PUT /api/problems/:id
  async update(id: string | number, problemData: Partial<Problem>): Promise<{ success: boolean; data: Problem }> {
    const response = await api.put(`/problems/${id}`, problemData);
    return response.data;
  },

  // Remove um desafio
  // Corresponde a: DELETE /api/problems/:id
  async delete(id: string | number): Promise<{ success: boolean; data: {} }> {
    const response = await api.delete(`/problems/${id}`);
    return response.data;
  },

  // Busca desafios em destaque para a Home
  async getFeatured(): Promise<PaginatedProblemsResponse> {
    const response = await api.get('/problems/featured');
    return response.data;
  }
};