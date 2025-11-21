// Importa a biblioteca 'framer-motion' para criar animações fluidas.
import { motion } from 'framer-motion';

// Define o componente funcional 'AnimatedBackground'.
// Este componente é responsável por criar um plano de fundo animado e dinâmico.
const AnimatedBackground = () => {
  // O componente retorna um elemento 'div' animado pela framer-motion.
  return (
    <motion.div
      // Classes de CSS para estilização:
      // 'animated-bg': Uma classe personalizada que provavelmente define um gradiente ou imagem de fundo.
      // 'fixed': Mantém o plano de fundo fixo na tela, mesmo com a rolagem da página.
      // 'inset-0': Faz o elemento ocupar todo o espaço do seu container pai (neste caso, a viewport).
      // '-z-10': Coloca o plano de fundo atrás de todos os outros conteúdos da página (z-index negativo).
      className="animated-bg fixed inset-0 -z-10"
      
      // A propriedade 'animate' define a animação que será executada.
      animate={{
        // Anima a posição do plano de fundo ('backgroundPosition').
        // O array de valores cria um ciclo, movendo a posição do fundo através dos cantos da tela.
        // A sequência é: centro-esquerda -> topo-direita -> baixo-direita -> baixo-esquerda -> volta ao centro-esquerda.
        backgroundPosition: ['0% 50%', '100% 0%', '100% 100%', '0% 100%', '0% 50%']
      }}
      
      // A propriedade 'transition' configura como a animação se comporta.
      transition={{
        duration: 15,       // A animação completa leva 15 segundos para terminar um ciclo.
        repeat: Infinity,   // A animação se repetirá infinitamente.
        ease: "easeInOut"   // A função de aceleração 'easeInOut' torna o movimento suave no início e no fim.
      }}
    />
  );
};

// Exporta o componente para que possa ser usado em outras partes da aplicação.
export default AnimatedBackground;