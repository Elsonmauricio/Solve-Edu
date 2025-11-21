// Importa a biblioteca 'framer-motion' para criar animações.
import { motion } from 'framer-motion';

// Define o componente FloatingParticles, que gera um efeito de partículas flutuantes animadas.
export const FloatingParticles = () => {
  // Cria um array com 40 elementos para representar as partículas.
  // Para cada partícula, gera um objeto com um id, posição, atraso e duração aleatórios.
  const particles = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    left: Math.random() * 100, // Posição horizontal aleatória (0 a 100%).
    delay: Math.random() * 15, // Atraso aleatório para a animação (0 a 15 segundos).
    duration: Math.random() * 10 + 10 // Duração aleatória da animação (10 a 20 segundos).
  }));

  // Retorna o JSX do componente.
  return (
    // Container principal para as partículas.
    // 'absolute inset-0' faz com que ocupe todo o espaço do seu container pai.
    // 'overflow-hidden' esconde as partículas que saem dos limites do container.
    <div className="floating-particles absolute inset-0 overflow-hidden">
      {/* Mapeia o array 'particles' para renderizar cada partícula animada. */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id} // Chave única para cada elemento na lista.
          className="particle absolute rounded-full" // Classes de estilo.
          style={{
            width: 6, // Largura fixa da partícula.
            height: 6, // Altura fixa da partícula.
            left: `${particle.left}%`, // Posição horizontal aleatória.
            // Gradiente radial para dar a aparência de uma partícula brilhante.
            background: 'radial-gradient(circle, rgba(76, 175, 80, 0.9) 0%, rgba(156, 39, 176, 0.7) 40%, rgba(255, 193, 7, 0.5) 70%, transparent 100%)',
            // Sombra para um efeito de brilho (glow).
            boxShadow: '0 0 10px rgba(76, 175, 80, 0.4)'
          }}
          // Define a animação da partícula.
          animate={{
            y: ['100vh', '-50px'], // Move-se verticalmente de baixo para cima da tela.
            x: [0, 100], // Move-se horizontalmente.
            scale: [0, 1, 1.5, 0], // Aumenta e diminui de tamanho.
            rotate: [0, 180, 360], // Gira 360 graus.
            opacity: [0, 1, 1, 0] // Aparece e desaparece gradualmente.
          }}
          // Configura a transição da animação.
          transition={{
            duration: particle.duration, // Duração aleatória.
            delay: particle.delay, // Atraso aleatório.
            repeat: Infinity, // A animação se repete infinitamente.
            ease: "linear" // Velocidade constante.
          }}
        />
      ))}
    </div>
  );
};