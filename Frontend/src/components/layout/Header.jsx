// Importa a biblioteca 'framer-motion' para animações.
import { motion } from 'framer-motion';
// --- IMPLEMENTAÇÃO AUTH0 ---
import { useAuth0 } from '@auth0/auth0-react';
// Importa o componente de botão personalizado 'NeoButton'.
import { NeoButton } from '../ui/NeoButton';
// Importa o componente de texto personalizado 'QuantumText'.
import { QuantumText } from '../ui/QuantumText';

// Exporta o componente funcional 'Header'.
export const Header = ({ currentInterface, onInterfaceChange }) => {
  // --- IMPLEMENTAÇÃO AUTH0 ---
  // Obtém as funções de login e logout, e o estado de autenticação.
  const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();

  // O componente retorna um cabeçalho (header) estático.
  return (
    // O 'header' é um elemento de cabeçalho HTML estilizado.
    <header 
      // Classes de CSS para estilização: Posição fixa no topo, largura total, alta ordem de empilhamento (z-index), e um estilo customizado 'holographic-interface'.
      className="fixed w-full z-50 holographic-interface"
    >
      {/* Div para um efeito de grade quântica no fundo do cabeçalho. */}
      <div className="quantum-grid" />
      
      {/* Container principal do conteúdo do cabeçalho, com largura máxima e preenchimento (padding). */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Container flexível para alinhar os itens do cabeçalho (logo e navegação). */}
        <div className="flex justify-between items-center h-24 relative">
          
          {/* Seção do Logo */}
          <motion.div 
            // Container para o logo, usando flexbox para alinhar itens.
            className="flex items-center"
            // Animação ao passar o mouse: Aumenta a escala do logo em 5%.
            whileHover={{ scale: 1.05 }}
          >
            {/* Div para o logo que se transforma, sem animações contínuas. */}
            <div
              className="morphing-logo"
            >
              {/* Componente de texto customizado para o nome do site. */}
              <QuantumText size="lg">🌊 SOLVE EDU</QuantumText>
            </div>
          </motion.div>

          {/* Seção de Navegação */}
          {/* Mostra botões diferentes dependendo se o utilizador está autenticado ou não. */}
          {isAuthenticated ? (
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                {/* Exibe a imagem de perfil do utilizador */}
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-12 h-12 rounded-full border-2 border-blue-300 object-cover"
                />
                {/* Exibe o nome do utilizador */}
                <span className="text-lg font-semibold text-gray-700 hidden md:block">
                  {user.name}
                </span>
              </div>
              <NeoButton variant="secondary" onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
                SAIR
              </NeoButton>
            </div>
          ) : (
            <div className="flex items-center space-x-8">
              {/* Botão para "ENTRAR", com um estilo secundário. */}
              <NeoButton variant="secondary" onClick={() => loginWithRedirect()}>
                ENTRAR
              </NeoButton>
              {/* Botão para "REGISTAR", que leva diretamente para a tela de registo. */}
              <NeoButton onClick={() => loginWithRedirect({ screen_hint: 'signup' })}>
                REGISTAR
              </NeoButton>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};