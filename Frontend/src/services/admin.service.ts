import api from './api';

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface AdminStats {
    users: {
        total: number;
        students: number;
        companies: number;
        newToday: number;
    };
    problems: {
        total: number;
        active: number;
        newToday: number;
    };
    solutions: {
        total: number;
        pending: number;
    };
    platform: {
        acceptanceRate: number;
        avgSolutionRating: { _avg: { rating: number | null } };
    };
}

export const adminService = {
    // Obter estatísticas do dashboard
    getDashboardStats: async (token?: string | null): Promise<ApiResponse<AdminStats>> => {
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const response = await api.get('/admin/dashboard-stats', config);
        return response.data;
    },

    // Obter utilizadores pendentes
    getAllUsers: async (params?: any, token?: string | null): Promise<ApiResponse<any>> => {
        const config = token ? { params, headers: { Authorization: `Bearer ${token}` } } : { params };
        const response = await api.get('/admin/users', config);
        return response.data;
    },

    // Obter soluções pendentes de revisão
    getPendingSolutions: async (params?: any, token?: string | null): Promise<ApiResponse<any>> => {
        const config = token ? { params, headers: { Authorization: `Bearer ${token}` } } : { params };
        const response = await api.get('/admin/solutions/pending', config);
        return response.data;
    },

    // Obter desafios pendentes
    getPendingProblems: async (params?: any, token?: string | null): Promise<ApiResponse<any>> => {
        const config = token ? { params, headers: { Authorization: `Bearer ${token}` } } : { params };
        const response = await api.get('/admin/problems/pending', config);
        return response.data;
    },

    // Revisar solução
    reviewSolution: async (solutionId: string, reviewData: any, token: string): Promise<ApiResponse<any>> => {
        const response = await api.patch(`/admin/solutions/${solutionId}/review`, reviewData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    // Verificar utilizador
    verifyUser: async (userId: string, token: string): Promise<ApiResponse<any>> => {
        const response = await api.patch(`/admin/users/${userId}/verify`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },
};
