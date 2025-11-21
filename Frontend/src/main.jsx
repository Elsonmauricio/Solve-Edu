// Importa a biblioteca principal do React, essencial para criar componentes.
import React from 'react';
// Importa o 'ReactDOM' para interagir com a DOM (Document Object Model) do navegador.
// 'react-dom/client' é a API mais recente para renderização concorrente no React.
import ReactDOM from 'react-dom/client';
// --- IMPLEMENTAÇÃO AUTH0 ---
import { Auth0Provider } from '@auth0/auth0-react';
// Importa o componente principal da aplicação, o 'App'.
import App from './App.jsx';
// Importa os estilos globais da aplicação, que serão aplicados em todo o site.
import './styles/globals.css';

// --- IMPLEMENTAÇÃO AUTH0 ---
const domain = "dev-v203qjqv035ipllk.us.auth0.com";
const clientId = "6FMCXLGIc4uvUh4NkO3EVFEDYOrbbXWH";

// 'ReactDOM.createRoot()' cria uma "raiz" de renderização do React no elemento da DOM com o id 'root'.
// Este elemento 'root' geralmente está no arquivo 'index.html'.
// '.render()' é chamado na raiz para renderizar um componente React dentro dela.
ReactDOM.createRoot(document.getElementById('root')).render(
  // '<React.StrictMode>' é um componente especial que ajuda a detectar problemas potenciais na aplicação.
  // Ele ativa verificações e avisos adicionais para seus descendentes, mas não renderiza nenhuma UI visível.
  // Funciona apenas em modo de desenvolvimento.
  <React.StrictMode>
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{ redirect_uri: window.location.origin }}
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>,
);