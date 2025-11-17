// Importa a biblioteca 'framer-motion' para animações.
import { motion } from 'framer-motion';

// Define o componente NeoButton, um botão com estilo "neomórfico" e animações.
// Aceita propriedades como 'children', 'onClick', 'className' e 'variant'.
export const NeoButton = ({ 
  children, 
  onClick, 
  className = '',
  variant = 'primary' // Define a variante do botão, com 'primary' como padrão.
}) => {
  // Define as classes CSS para as diferentes variantes do botão.
  const variants = {
    primary: 'neo-button', // Classe principal para o estilo neomórfico.
    secondary: 'px-8 py-3 text-sm font-bold transition-all duration-500 hover:bg-blue-50 rounded-2xl border-2 border-blue-200 hover:border-blue-400 font-mono uppercase tracking-wider glow-effect text-blue-500 hover:text-blue-400' // Estilo secundário.
  };

  // Retorna um componente 'motion.button' que é um botão HTML com animações.
  return (
    <motion.button
      // Concatena as classes da variante com quaisquer classes personalizadas.
      className={`${variants[variant]} ${className}`}
      // Animação ao passar o mouse por cima.
      whileHover={{ 
        y: -6, // Move o botão 6 pixels para cima.
        scale: 1.06 // Aumenta ligeiramente o tamanho.
      }}
      // Animação ao clicar no botão.
      whileTap={{ scale: 0.95 }} // Diminui ligeiramente o tamanho.
      onClick={onClick} // Associa a função de clique.
      // Configura a transição das animações, usando um efeito de "mola" (spring).
      transition={{ 
        type: "spring",
        stiffness: 400, // Rigidez da mola.
        damping: 17 // Amortecimento da mola.
      }}
    >
      {/* Renderiza o conteúdo (texto ou ícone) dentro do botão. */}
      {children}
    </motion.button>
  );
};