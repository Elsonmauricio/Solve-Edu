// Importa a biblioteca principal do React, essencial para criar componentes.
import React from 'react';
// Importa o 'ReactDOM' para interagir com a DOM (Document Object Model) do navegador.
// 'react-dom/client' é a API mais recente para renderização concorrente no React.
import ReactDOM from 'react-dom/client';
// --- IMPLEMENTAÇÃO AUTH0 ---
import { Auth0Provider } from '@auth0/auth0-react';
// Importa o componente principal da aplicação, o 'App'.
import App from './App.jsx';
import { AppProvider } from './context/AppContext';
// Importa os estilos globais da aplicação, que serão aplicados em todo o site.
import './styles/globals.css';

// 'ReactDOM.createRoot()' cria uma "raiz" de renderização do React no elemento da DOM com o id 'root'.
// Este elemento 'root' geralmente está no arquivo 'index.html'.
// '.render()' é chamado na raiz para renderizar um componente React dentro dela.
ReactDOM.createRoot(document.getElementById('root')).render(
  // '<React.StrictMode>' é um componente especial que ajuda a detectar problemas potenciais na aplicação.
  // Ele ativa verificações e avisos adicionais para seus descendentes, mas não renderiza nenhuma UI visível.
  // Funciona apenas em modo de desenvolvimento.
  <React.StrictMode>
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: import.meta.env.VITE_AUTH0_AUDIENCE, // Adicionar Audience
      }}
    >
      <AppProvider>
        <App />
      </AppProvider>
    </Auth0Provider>
  </React.StrictMode>,
);