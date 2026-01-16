import { useAuth0 } from '@auth0/auth0-react';
import { useApp } from '../context/AppContext';

export const useAuth = () => {
  const { user } = useApp();
  const { 
    loginWithRedirect, 
    logout: auth0Logout, 
    isLoading,
    error: auth0Error
  } = useAuth0();

  // Redireciona para a página de login do Auth0
  const login = () => loginWithRedirect();

  // Redireciona para a página de registo do Auth0
  const register = () => loginWithRedirect({ 
    authorizationParams: { screen_hint: 'signup' } 
  });

  // Realiza o logout e redireciona para a home
  const logout = () => {
    auth0Logout({ 
      logoutParams: { returnTo: window.location.origin } 
    });
  };

  return {
    user,
    loading: isLoading,
    error: auth0Error,
    login,
    logout,
    register,
    isAuthenticated: !!user
  };
};