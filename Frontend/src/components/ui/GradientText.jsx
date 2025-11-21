// Importa a biblioteca 'framer-motion' para animações.
import { motion } from 'framer-motion';

// Define o componente GradientText, que aplica um efeito de texto "gradiente" animado.
// Aceita propriedades como 'children' (o texto a ser exibido), 'className' e 'size'.
export const GradientText = ({ 
  children, 
  className = '',
  size = 'lg' // Define o tamanho do texto, com 'lg' como padrão.
}) => {
  // Mapeia os tamanhos para as classes de CSS correspondentes do Tailwind.
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-5xl',
    xl: 'text-7xl',
    '2xl': 'text-9xl'
  };

  // Retorna um componente 'motion.span' que envolve o texto.
  return (
    <motion.span
      // Constrói a string de classes CSS dinamicamente.
      className={`
        gradient-text // Classe base para o estilo do texto.
        ${sizeClasses[size]} // Classe de tamanho baseada na propriedade 'size'.
        ${className} // Classes personalizadas passadas via props.
        animate-gradient-text-flow // Classe que pode conter animações CSS adicionais.
      `}
      // Define a animação do componente.
      animate={{
        // Anima a posição do fundo (backgroundPosition) para criar um efeito de fluxo no gradiente.
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
      }}
      // Configura a transição da animação.
      transition={{
        duration: 6, // A animação dura 6 segundos.
        repeat: Infinity, // A animação se repete infinitamente.
        ease: "easeInOut" // Aceleração e desaceleração suaves.
      }}
    >
      {/* Renderiza o texto passado como 'children'. */}
      {children}
    </motion.span>
  );
};