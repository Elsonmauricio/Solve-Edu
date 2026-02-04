// c:\Users\maels\Documents\Solve Edu\Frontend\src\hooks\useUserInitialization.ts

import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useApp } from '../context/AppContext';
import { setAuthToken } from '../services/api';
import { userService } from '../services/user.service';
import { adminService } from '../services/admin.service';
import { User as AppUser } from '../types';

export const useUserInitialization = () => {
  const { getAccessTokenSilently, isAuthenticated, isLoading, user, logout } = useAuth0();
  const { dispatch } = useApp();
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    const initializeUser = async () => {
      if (isAuthenticated && user) {
        try {
          // 1. Obter e configurar o token de autenticação
          const token = await getAccessTokenSilently();
          setAuthToken(token);

          // 2. Sincronizar utilizador e obter perfil do backend
          const profileRes = await userService.getProfile();
          if (profileRes.success && profileRes.data) {
            const backendUser = profileRes.data as unknown as AppUser;
            
            // Atualizar o contexto com os dados do nosso backend
            dispatch({
              type: 'SET_USER',
              payload: {
                id: backendUser.id,
                name: backendUser.name,
                email: backendUser.email,
                avatar: backendUser.avatar,
                role: backendUser.role,
                isVerified: backendUser.isVerified,
                createdAt: backendUser.createdAt,
                updatedAt: backendUser.updatedAt,
                studentProfile: backendUser.studentProfile,
                companyProfile: backendUser.companyProfile,
              }
            });

            // 3. Carregar dados específicos do papel (se aplicável)
            if (backendUser.role === 'ADMIN') {
              const statsRes = await adminService.getDashboardStats();
              if (statsRes.success && statsRes.data) {
                dispatch({ type: 'SET_STATS', payload: statsRes.data as any });
              }
            }
          } else {
            console.error("[UserInit] Erro do Backend:", profileRes);
            throw new Error(profileRes.message || 'Falha ao carregar perfil do utilizador.');
          }
        } catch (error: any) {
          console.error("[UserInit] Erro Crítico:", error);
          // Se o erro for 401, o token é inválido/expirado
          if (error.response && error.response.status === 401) {
            logout({ logoutParams: { returnTo: window.location.origin } });
          } else {
            // Define um erro no estado global para que a UI possa mostrar uma mensagem amigável
            dispatch({ type: 'SET_ERROR', payload: 'Não foi possível carregar os dados do utilizador.' });
          }
        }
      } else {
        // Limpar token se não estiver autenticado
        setAuthToken(null);
        dispatch({ type: 'SET_USER', payload: null });
      }
      setIsDataLoading(false);
    };

    if (!isLoading && isAuthenticated) {
      initializeUser();
    } else if (!isLoading) {
      setIsDataLoading(false);
    }
  }, [isAuthenticated, isLoading, user, getAccessTokenSilently, dispatch, logout]);

  return { isDataLoading };
};
