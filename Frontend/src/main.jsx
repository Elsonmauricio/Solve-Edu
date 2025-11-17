// Importa a biblioteca principal do React, essencial para criar componentes.
import React from 'react';
// Importa o 'ReactDOM' para interagir com a DOM (Document Object Model) do navegador.
// 'react-dom/client' é a API mais recente para renderização concorrente no React.
import ReactDOM from 'react-dom/client';
// Importa o componente principal da aplicação, o 'App'.
import App from './App.jsx';
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
    {/* Renderiza o componente 'App', que é o ponto de partida de toda a interface da aplicação. */}
    <App />
  </React.StrictMode>,
);
