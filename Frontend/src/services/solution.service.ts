import api from './api';
import { Solution } from '../types';

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

interface PaginatedSolutions {
    solutions: Solution[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export const solutionsService = {
  // Obter soluções (pode filtrar por problemId ou studentId)
  getAll: async (params?: any, token?: string | null): Promise<ApiResponse<PaginatedSolutions>> => {
    const config = token ? { params, headers: { Authorization: `Bearer ${token}` } } : { params };
    const response = await api.get('/solutions', config);
    return response.data;
  },

  // Obter detalhes de uma solução
  getById: async (id: string | number, token?: string | null): Promise<ApiResponse<Solution>> => {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await api.get(`/solutions/${id}`, config);
    return response.data;
  },

  // Submeter uma nova solução (Requer Token de Estudante)
  create: async (solutionData: Partial<Solution> | FormData, token: string): Promise<ApiResponse<Solution>> => {
    const isFormData = solutionData instanceof FormData;
    
    const response = await api.post('/solutions', solutionData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': isFormData ? 'multipart/form-data' : 'application/json'
      }
    });
    return response.data;
  },

  // Avaliar uma solução (Requer Token de Empresa/Admin)
  review: async (id: string | number, reviewData: any, token: string): Promise<ApiResponse<Solution>> => {
    const response = await api.patch(`/admin/solutions/${id}/review`, reviewData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  getStats: async (): Promise<ApiResponse<{ accepted: number }>> => {
    const response = await api.get('/solutions/stats'); // Assumindo que este endpoint existe
    return response.data;
  },

  getTopSolutions: async (): Promise<ApiResponse<Solution[]>> => {
    const response = await api.get('/solutions/top'); // Assumindo que este endpoint existe
    return response.data;
  },
};