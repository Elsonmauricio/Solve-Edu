// Importa a biblioteca 'framer-motion' para animações e o React.
import { motion } from 'framer-motion';
import React from 'react';

// Define o componente MorphicCard, que é um cartão com efeitos visuais "mórficos".
// Aceita propriedades como 'children' (conteúdo do cartão), 'className', 'onClick', e booleanos para 'glow' e 'liquid'.
export const MorphicCard = ({ 
  children, 
  className = '', 
  onClick,
  glow = false, // Ativa o efeito de brilho (glow).
  liquid = false // Ativa o efeito de líquido.
}) => {
  // Retorna um componente 'motion.div' que serve como o container do cartão.
  return (
    <motion.div
      // Constrói a string de classes CSS dinamicamente.
      className={`
        morphic-card 
        ${glow ? 'glow-effect animate-glow-pulse' : ''} // Adiciona classes de brilho se 'glow' for verdadeiro.
        ${liquid ? 'liquid-animation animate-liquid-flow' : ''} // Adiciona classes de líquido se 'liquid' for verdadeiro.
        ${className} // Adiciona quaisquer classes personalizadas passadas via props.
      `}
      // Define a animação que ocorre quando o mouse passa por cima do cartão.
      whileHover={{ 
        y: -20, // Move o cartão 20 pixels para cima.
        scale: 1.03, // Aumenta ligeiramente o tamanho do cartão.
        rotateX: 5, // Rotaciona ligeiramente no eixo X.
        rotateY: 5 // Rotaciona ligeiramente no eixo Y.
      }}
      // Define a animação que ocorre quando o cartão é clicado.
      whileTap={{ scale: 0.98 }} // Diminui ligeiramente o tamanho do cartão.
      // Configura a transição para as animações, usando um efeito de "mola" (spring).
      transition={{ 
        type: "spring",
        stiffness: 300, // Rigidez da mola.
        damping: 20 // Amortecimento da mola.
      }}
      onClick={onClick} // Associa a função de clique passada como propriedade.
    >
      {/* Renderiza o conteúdo (children) passado para o cartão. */}
      {children}
    </motion.div>
  );
};