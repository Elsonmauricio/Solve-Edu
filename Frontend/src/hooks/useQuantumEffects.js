// Importa o hook 'useEffect' do React, que permite executar efeitos colaterais em componentes funcionais.
import { useEffect } from 'react';

// Define o hook customizado 'useQuantumEffects'.
// Hooks customizados são uma forma de reutilizar lógica com estado em múltiplos componentes.
export const useQuantumEffects = () => {
  // 'useEffect' é usado para executar o código de efeito após o componente ser renderizado.
  // O array vazio `[]` como segundo argumento garante que o efeito seja executado apenas uma vez,
  // semelhante ao 'componentDidMount' em componentes de classe.
  useEffect(() => {
    // Log para o console para indicar que os efeitos foram ativados.
    console.log('🌌 Efeitos quânticos ativados!');
    
    // Efeito de "glitch" (falha) no texto.
    // 'setInterval' executa uma função repetidamente a cada X milissegundos (neste caso, 2000ms ou 2s).
    const interval = setInterval(() => {
      // Seleciona todos os elementos no documento que têm a classe '.quantum-text'.
      const elements = document.querySelectorAll('.quantum-text');
      // Itera sobre cada elemento encontrado.
      elements.forEach(el => {
        // Com uma probabilidade de 10% (Math.random() < 0.1), aplica o efeito de glitch.
        if (Math.random() < 0.1) {
          // Move o elemento horizontalmente por um valor aleatório entre -2px e 2px.
          el.style.transform = `translateX(${Math.random() * 4 - 2}px)`;
          // 'setTimeout' agenda a remoção do efeito após 100ms, fazendo o glitch ser rápido.
          setTimeout(() => {
            el.style.transform = ''; // Reseta a transformação, retornando o texto à sua posição original.
          }, 100);
        }
      });
    }, 2000); // O intervalo para tentar aplicar o glitch é de 2 segundos.

    // A função de limpeza do 'useEffect'.
    // Ela é executada quando o componente que usa o hook é desmontado (removido da tela).
    // 'clearInterval' para o 'setInterval', prevenindo vazamentos de memória e a execução
    // desnecessária do efeito quando o componente não está mais visível.
    return () => clearInterval(interval);
  }, []); // O array de dependências vazio significa que o efeito não depende de nenhuma prop ou estado.
};