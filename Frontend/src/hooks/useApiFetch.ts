import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import { useCallback } from 'react';

export const useApiFetch = () => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  
  // Em produção no Vercel, se usarmos caminhos relativos para o mesmo domínio, 
  // evitamos problemas de CORS e de configuração de URL.
  const apiUrl = import.meta.env.VITE_API_URL || 
                 (import.meta.env.PROD ? window.location.origin : 'http://localhost:5000');

  const authenticatedFetch = useCallback(async (endpoint: string, options: any = {}) => {
    try {
      let headers = { ...options.headers };

      if (isAuthenticated) {
        const token = await getAccessTokenSilently();
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await axios({
        url: `${apiUrl}${endpoint}`,
        method: options.method || 'GET',
        ...options,
        headers
      });

      return response.data;
    } catch (error) {
      console.error(`Error in authenticatedFetch for ${endpoint}:`, error);
      throw error;
    }
  }, [getAccessTokenSilently, isAuthenticated, apiUrl]);

  return { authenticatedFetch };
};