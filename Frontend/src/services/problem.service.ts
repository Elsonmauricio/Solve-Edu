import api from './api';
import { Problem } from '../types';

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

interface PaginatedProblems {
    problems: Problem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export const problemsService = {
  // Obter todos os problemas (público ou filtrado)
  getAll: async (params?: any): Promise<ApiResponse<PaginatedProblems>> => {
    const response = await api.get('/problems', { params });
    return response.data;
  },

  // Obter problemas ativos
  getActive: async (params?: any): Promise<ApiResponse<PaginatedProblems>> => {
    const response = await api.get('/problems/active', { params });
    return response.data;
  },

  // Obter problemas em destaque
  getFeatured: async (params?: any): Promise<ApiResponse<PaginatedProblems>> => {
    const response = await api.get('/problems/featured', { params });
    return response.data;
  },

  // Obter um problema pelo ID
  getById: async (id: string | number): Promise<ApiResponse<Problem>> => {
    const response = await api.get(`/problems/${id}`);
    return response.data;
  },

  // Obter problemas da empresa logada (Requer Token)
  getMyProblems: async (token: string, params?: any): Promise<ApiResponse<PaginatedProblems>> => {
    const response = await api.get('/problems/company/my', { 
      params,
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Criar um novo problema (Requer Token de Empresa)
  create: async (problemData: Partial<Problem>, token: string): Promise<ApiResponse<Problem>> => {
    const response = await api.post('/problems', problemData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Atualizar um problema (Requer Token)
  update: async (id: string | number, problemData: Partial<Problem>, token: string): Promise<ApiResponse<Problem>> => {
    const response = await api.patch(`/problems/${id}`, problemData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Eliminar um problema (Requer Token)
  delete: async (id: string | number, token: string): Promise<ApiResponse<{}>> => {
    const response = await api.delete(`/problems/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};