// Importa a biblioteca 'framer-motion' para criar animações.
import { motion } from 'framer-motion';

// Define o componente FloatingOrbs, que cria um efeito de orbes flutuantes e animados.
export const FloatingOrbs = () => {
  // Cria um array com 25 elementos para representar os orbes.
  // Para cada orbe, gera um objeto com um id, tamanho, posição, atraso e duração aleatórios.
  const orbs = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    size: Math.random() * 30 + 10, // Tamanho aleatório entre 10 e 40 pixels.
    left: Math.random() * 100, // Posição horizontal aleatória (0 a 100%).
    delay: Math.random() * 20, // Atraso aleatório para a animação (0 a 20 segundos).
    duration: Math.random() * 15 + 15 // Duração aleatória da animação (15 a 30 segundos).
  }));

  // Retorna o JSX do componente.
  return (
    // Container principal para os orbes flutuantes.
    // 'absolute inset-0' faz com que ocupe todo o espaço do seu container pai.
    // 'overflow-hidden' esconde qualquer parte dos orbes que saia dos limites do container.
    // 'z-1' define a ordem de empilhamento.
    <div className="floating-orbs absolute inset-0 overflow-hidden z-1">
      {/* Mapeia o array 'orbs' para renderizar cada orbe animado. */}
      {orbs.map((orb) => (
        <motion.div
          key={orb.id} // Chave única para cada elemento na lista.
          className="orb absolute rounded-full" // Classes de estilo.
          style={{
            width: orb.size, // Largura do orbe.
            height: orb.size, // Altura do orbe.
            left: `${orb.left}%`, // Posição horizontal aleatória.
            // Gradiente radial para criar a aparência de uma esfera iluminada.
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.5) 0%, rgba(37, 99, 235, 0.4) 30%, rgba(29, 78, 216, 0.3) 60%, rgba(30, 64, 175, 0.2) 80%, transparent 100%)',
            filter: 'blur(2px)', // Efeito de desfoque para suavizar as bordas.
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)' // Sombra para um efeito de brilho.
          }}
          // Define a animação do orbe.
          animate={{
            y: ['100vh', '-100px'], // Move-se verticalmente de baixo para cima da tela.
            x: [0, 200], // Move-se horizontalmente.
            scale: [0, 1, 0], // Aumenta e diminui de tamanho.
            rotate: [0, 360], // Gira 360 graus.
            opacity: [0, 1, 1, 0] // Aparece e desaparece gradualmente.
          }}
          // Configura a transição da animação.
          transition={{
            duration: orb.duration, // Duração aleatória.
            delay: orb.delay, // Atraso aleatório.
            repeat: Infinity, // A animação se repete infinitamente.
            ease: "linear" // Velocidade constante.
          }}
        />
      ))}
    </div>
  );
};