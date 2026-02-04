import { useAuth0 } from '@auth0/auth0-react';
import { useApp } from '../context/AppContext';

export const useAuth = () => {
  const context = useApp();
  const appUser = context.user || undefined;
  const { 
    loginWithRedirect, 
    logout: auth0Logout, 
    isLoading,
    error: auth0Error
  } = useAuth0();

  // Redireciona para a página de login do Auth0
  const login = () => loginWithRedirect();

  // Redireciona para a página de registo do Auth0
  // Aceita 'STUDENT' ou 'COMPANY' como argumento
  const register = async (role: 'STUDENT' | 'COMPANY') => {
    try {
      // Guardar a intenção de role localmente para redundância
      sessionStorage.setItem('selected_role', role);
      
      await loginWithRedirect({ 
        authorizationParams: { 
          screen_hint: 'signup',
          user_type: role === 'COMPANY' ? 'company' : 'student'
        } 
      });
    } catch (error) {
      console.error("Erro ao tentar registar:", error);
    }
  };

  // Realiza o logout e redireciona para a home
  const logout = () => {
    auth0Logout({ 
      logoutParams: { returnTo: window.location.origin } 
    });
  };

  return {
    user: appUser,
    loading: isLoading,
    error: auth0Error,
    login,
    logout,
    register,
    isAuthenticated: !!appUser
  };
};