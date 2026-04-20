import axios from 'axios';

const api = axios.create({
  // Em produção, usamos o prefixo relativo para que o Vercel Rewrite funcione.
  // Em desenvolvimento, o Vite proxy ou o URL completo trata disso.
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export default api;