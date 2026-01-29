import api from './api';

interface DashboardStats {
  activeProblems: number;
  totalSolutionsReceived: number;
  pendingReviews: number;
}

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export const companyService = {
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    const response = await api.get('/company/dashboard-stats');
    return response.data;
  }
};