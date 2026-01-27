import api from './api';
import { User } from '../types';

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

interface UserProfile {
    id: string;
    user: User;
    stats: {
        solutions?: number;
        acceptedSolutions?: number;
        problems?: number;
        activeProblems?: number;
    };
}

export const userService = {
    // Obter perfil do utilizador logado
    getProfile: async (token?: string | null): Promise<ApiResponse<UserProfile>> => {
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const response = await api.get('/users/profile', config);
        return response.data;
    },

    // Obter todos os utilizadores (Admin apenas)
    getAll: async (params?: any, token?: string | null): Promise<ApiResponse<{ users: User[]; total: number }>> => {
        const config = token ? { params, headers: { Authorization: `Bearer ${token}` } } : { params };
        const response = await api.get('/users', config);
        return response.data;
    },

    // Obter utilizador por ID
    getById: async (id: string, token?: string | null): Promise<ApiResponse<User>> => {
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const response = await api.get(`/users/${id}`, config);
        return response.data;
    },

    // Atualizar perfil
    updateProfile: async (profileData: Partial<User>, token: string): Promise<ApiResponse<User>> => {
        const response = await api.patch('/users/profile', profileData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },
};
