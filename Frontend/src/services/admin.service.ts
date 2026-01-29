import api from './api';

export interface DashboardData {
  users: { total: number; newToday: number };
  problems: { active: number; newToday: number };
  solutions: { total: number; newToday: number };
  platform: { acceptanceRate: number };
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const adminService = {
  async getDashboardStats(): Promise<ApiResponse<DashboardData>> {
    const response = await api.get('/admin/dashboard-stats');
    return response.data;
  }
};