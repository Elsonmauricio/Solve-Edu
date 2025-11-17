// Importa a biblioteca 'framer-motion' para criar animações.
import { motion } from 'framer-motion';

// Define o componente DataVisualization, responsável por criar um efeito de linhas de dados animadas.
export const DataVisualization = () => {
  // Cria um array com 15 elementos para representar as linhas de dados.
  // Para cada linha, gera um objeto com um id, uma posição 'top' e 'left' aleatória, e um 'delay' aleatório para a animação.
  const lines = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    top: Math.random() * 100, // Posição vertical aleatória (0 a 100%).
    left: Math.random() * 100, // Posição horizontal aleatória (0 a 100%).
    delay: Math.random() * 3 // Atraso aleatório para a animação (0 a 3 segundos).
  }));

  // Retorna o JSX do componente.
  return (
    // Container principal para a visualização de dados.
    // 'absolute inset-0' faz com que ocupe todo o espaço do seu container pai.
    // 'pointer-events-none' permite que cliques do mouse passem através deste elemento.
    // 'z-2' define a ordem de empilhamento (stacking order).
    <div className="data-visualization absolute inset-0 pointer-events-none z-2">
      {/* Mapeia o array 'lines' para renderizar cada linha animada. */}
      {lines.map((line) => (
        <motion.div
          key={line.id} // Chave única para cada elemento na lista.
          className="data-line absolute rounded" // Classes de estilo.
          style={{
            top: `${line.top}%`, // Posição vertical definida aleatoriamente.
            left: `${line.left}%`, // Posição horizontal definida aleatoriamente.
            height: 3, // Altura fixa da linha.
            // Gradiente linear para dar a aparência de um rastro de luz.
            background: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.9), rgba(96, 165, 250, 0.8), rgba(147, 197, 253, 0.6), transparent)',
            // Sombra para criar um efeito de brilho (glow).
            boxShadow: '0 0 15px rgba(59, 130, 246, 0.6)'
          }}
          // Define a animação do elemento.
          animate={{
            width: [0, 200, 0], // A largura da linha anima de 0 para 200 e de volta para 0.
            opacity: [0, 1, 0], // A opacidade anima de 0 para 1 e de volta para 0.
            x: [0, 300, 300] // A posição X se move 300 pixels para a direita.
          }}
          // Configura a transição da animação.
          transition={{
            duration: 4, // A animação dura 4 segundos.
            delay: line.delay, // Atraso aleatório para cada linha.
            repeat: Infinity, // A animação se repete infinitamente.
            ease: "linear" // A animação progride a uma velocidade constante.
          }}
        />
      ))}
    </div>
  );
};