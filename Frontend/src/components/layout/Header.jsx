// Importa a biblioteca 'framer-motion' para animações.
import { motion } from 'framer-motion';
// Importa o componente de botão personalizado 'NeoButton'.
import { NeoButton } from '../ui/NeoButton';
// Importa o componente de texto personalizado 'QuantumText'.
import { QuantumText } from '../ui/QuantumText';

// Exporta o componente funcional 'Header'.
// Este componente recebe 'currentInterface' e 'onInterfaceChange' como propriedades (props), embora não estejam sendo usadas no código fornecido.
export const Header = ({ currentInterface, onInterfaceChange }) => {
  // O componente retorna um cabeçalho (header) animado.
  return (
    // O 'motion.header' é um elemento de cabeçalho HTML com superpoderes de animação da framer-motion.
    <motion.header 
      // Classes de CSS para estilização: Posição fixa no topo, largura total, alta ordem de empilhamento (z-index), e um estilo customizado 'holographic-interface'.
      className="fixed w-full z-50 holographic-interface"
      // Estado inicial da animação: O cabeçalho começa 100 pixels acima da tela.
      initial={{ y: -100 }}
      // Estado final da animação: O cabeçalho se move para a sua posição final em y=0.
      animate={{ y: 0 }}
      // Configurações da transição: Usa uma animação do tipo "spring" (mola) para um efeito mais natural.
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
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
            {/* Div para o logo que se transforma, com animações contínuas. */}
            <motion.div
              className="morphing-logo"
              // Define a animação:
              animate={{
                // A escala muda em uma sequência para criar um efeito de pulsação.
                scale: [1, 1.1, 0.9, 1.05, 1],
                // A rotação muda em 360 graus.
                rotate: [0, 90, 180, 270, 0],
                // O filtro de cor (hue-rotate) muda, criando um efeito de arco-íris.
                filter: [
                  'hue-rotate(0deg)',
                  'hue-rotate(90deg)',
                  'hue-rotate(180deg)',
                  'hue-rotate(270deg)',
                  'hue-rotate(0deg)'
                ]
              }}
              // Configurações da transição da animação:
              transition={{
                duration: 8, // A animação completa dura 8 segundos.
                repeat: Infinity, // A animação se repete infinitamente.
                ease: "easeInOut" // Aceleração e desaceleração suaves.
              }}
            >
              {/* Componente de texto customizado para o nome do site. */}
              <QuantumText size="lg">🌊 SOLVE EDU</QuantumText>
            </motion.div>
          </motion.div>

          {/* Seção de Navegação */}
          <div className="flex items-center space-x-8">
            {/* Botão para "ENTRAR", com um estilo secundário. */}
            <NeoButton variant="secondary">
              ENTRAR
            </NeoButton>
            {/* Botão para "REGISTAR", com o estilo padrão. */}
            <NeoButton>
              REGISTAR
            </NeoButton>
          </div>

          {/* Efeitos Visuais de Conexões Neurais */}
          {/* Primeira "conexão neural" animada. */}
          <motion.div
            // Classes de CSS para o efeito: 'neural-connection' e 'absolute' para posicionamento.
            className="neural-connection absolute"
            // Estilo em linha para posicionar o elemento a 15% da esquerda.
            style={{ left: '15%' }}
            // Define a animação:
            animate={{
              height: [0, 150, 0], // A altura cresce e depois diminui.
              opacity: [0, 1, 0],   // A opacidade aparece e desaparece.
              y: [0, 150, 0]        // A posição Y se move para baixo e depois volta.
            }}
            // Configurações da transição da animação:
            transition={{
              duration: 5,        // Duração de 5 segundos.
              repeat: Infinity,   // Repete infinitamente.
              ease: "easeInOut" // Aceleração e desaceleração suaves.
            }}
          />
          
          {/* Segunda "conexão neural" animada. */}
          <motion.div
            className="neural-connection absolute"
            // Posiciona o elemento a 85% da esquerda.
            style={{ left: '85%' }}
            // A mesma animação da primeira conexão.
            animate={{
              height: [0, 150, 0],
              opacity: [0, 1, 0],
              y: [0, 150, 0]
            }}
            // Configurações da transição, mas com um atraso (delay) de 2 segundos para não sincronizar com a primeira.
            transition={{
              duration: 5,
              delay: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
      </div>
    </motion.header>
  );
};