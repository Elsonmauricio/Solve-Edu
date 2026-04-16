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
  // Aceita 'STUDENT' ou 'COMPANY' ou 'SCHOOL' como argumento
  const register = async (role: 'STUDENT' | 'COMPANY' | 'SCHOOL' ) => {
    try {
      // Guardar a intenção de role para o hook de inicialização enviar ao backend
      localStorage.setItem('intended_role', role);
      
      await loginWithRedirect({ 
        authorizationParams: { 
          screen_hint: 'signup',
          'x-intended-role': role, // Parâmetro personalizado para o backend
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