import api from './api';

interface DashboardStats {
  submittedCount: number;
  acceptedCount: number;
  ongoingCount: number;
  averageRating: number;
}

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export const studentService = {
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    const response = await api.get('/student/dashboard-stats');
    return response.data;
  }
};