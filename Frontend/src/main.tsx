// Importa a biblioteca principal do React, essencial para criar componentes.
import React from 'react';
// Importa o 'ReactDOM' para interagir com a DOM (Document Object Model) do navegador.
// 'react-dom/client' é a API mais recente para renderização concorrente no React.
import ReactDOM from 'react-dom/client';
// --- IMPLEMENTAÇÃO AUTH0 ---
import { Auth0Provider } from '@auth0/auth0-react';
// Importa o componente principal da aplicação, o 'App'.
import App from './App';
import { AppProvider } from './context/AppContext';
// Importa os estilos globais da aplicação, que serão aplicados em todo o site.
import './styles/globals.css';

const domain = import.meta.env.VITE_AUTH0_DOMAIN;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

if (!domain || !clientId) {
  console.error('Faltam variáveis de ambiente. Verifique o ficheiro .env na raiz do projeto Frontend.');
  throw new Error('As variáveis de ambiente VITE_AUTH0_DOMAIN e VITE_AUTH0_CLIENT_ID são obrigatórias.');
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

// 'ReactDOM.createRoot()' cria uma "raiz" de renderização do React no elemento da DOM com o id 'root'.
// Este elemento 'root' geralmente está no arquivo 'index.html'.
// '.render()' é chamado na raiz para renderizar um componente React dentro dela.
ReactDOM.createRoot(rootElement).render(
  // '<React.StrictMode>' é um componente especial que ajuda a detectar problemas potenciais na aplicação.
  // Ele ativa verificações e avisos adicionais para seus descendentes, mas não renderiza nenhuma UI visível.
  // Funciona apenas em modo de desenvolvimento.
  <React.StrictMode>
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        ...(audience ? { audience } : {}),
      }}
    >
      <AppProvider>
        <App />
      </AppProvider>
    </Auth0Provider>
  </React.StrictMode>,
);