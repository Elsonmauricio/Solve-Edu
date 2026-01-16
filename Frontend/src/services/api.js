import axios from 'axios';

// Cria uma instância do axios com a URL base da API
// VITE_API_URL deve ser definido no arquivo .env (ex: http://localhost:3000/api)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Função auxiliar para definir o token JWT nos cabeçalhos
// Deve ser chamada após o login/obtenção do token via Auth0
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Interceptor para tratamento de erros global
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default api;