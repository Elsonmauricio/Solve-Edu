// Importa o hook 'useState' do React para gerenciar o estado do componente.
import { useState } from 'react';
// Importa componentes 'motion' e 'AnimatePresence' da biblioteca 'framer-motion' para animações.
import { motion, AnimatePresence } from 'framer-motion';
// Importa o componente de cabeçalho.
import { Header } from './components/layout/Header';
// Importa o componente de plano de fundo animado.
import QuantumBackground from './components/layout/QuantumBackground';
// Importa as diferentes interfaces (telas) da aplicação.
import { HomeInterface } from './components/interfaces/HomeInterface';
import { StudentInterface } from './components/interfaces/StudentInterface';
import { CompanyInterface } from './components/interfaces/CompanyInterface';
import { SchoolInterface } from './components/interfaces/SchoolInterface';
import { AdminInterface } from './components/interfaces/AdminInterface';
import { InitialInterface } from './components/interfaces/InitialInterface';
// Importa o hook customizado para efeitos visuais.
import { useQuantumEffects } from './hooks/useQuantumEffects';

// Define o componente principal da aplicação, chamado 'App'.
function App() {
  // Cria um estado chamado 'currentInterface' para controlar qual interface (tela) está sendo exibida.
  // O valor inicial é 'home'. 'setCurrentInterface' é a função para atualizar esse estado.
  const [currentInterface, setCurrentInterface] = useState('home');
  
  // Ativa os efeitos quânticos visuais em toda a aplicação usando o hook customizado.
  useQuantumEffects();

  // Função para renderizar a interface correta com base no valor do estado 'currentInterface'.
  const renderInterface = () => {
    // O 'switch' verifica o valor de 'currentInterface'.
    switch (currentInterface) {
      // Caso seja 'estudante', renderiza a interface do estudante.
      case 'estudante':
        return <StudentInterface onBack={() => setCurrentInterface('home')} />;
      // Caso seja 'empresa', renderiza a interface da empresa.
      case 'empresa':
        return <CompanyInterface onBack={() => setCurrentInterface('home')} />;
      // Caso seja 'escola', renderiza a interface da escola.
      case 'escola':
        return <SchoolInterface onBack={() => setCurrentInterface('home')} />;
      // Caso seja 'admin', renderiza a interface do administrador.
      case 'admin':
        return <AdminInterface onBack={() => setCurrentInterface('home')} />;
      // Caso seja 'inicial', renderiza a interface inicial.
      case 'inicial':
        return <InitialInterface onInterfaceChange={setCurrentInterface} />;
      // Por padrão (caso 'default'), renderiza a interface principal (Home).
      default:
        return <HomeInterface onInterfaceChange={setCurrentInterface} />;
    }
  };

  // O componente 'App' retorna o JSX (a estrutura visual) abaixo.
  return (
    // Container principal da aplicação com altura mínima da tela e fundo branco.
    // 'overflow-x-hidden' impede a rolagem horizontal.
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Renderiza o componente de plano de fundo animado. */}
      <QuantumBackground />
      {/* Renderiza o cabeçalho, passando o estado da interface atual e a função para alterá-la. */}
      <Header currentInterface={currentInterface} onInterfaceChange={setCurrentInterface} />
      
      {/* 'AnimatePresence' da framer-motion gerencia a animação de componentes que entram e saem da árvore de componentes. */}
      {/* 'mode="wait"' espera a animação de saída terminar antes de iniciar a de entrada. */}
      <AnimatePresence mode="wait">
        {/* 'motion.main' é o container principal do conteúdo que será animado. */}
        <motion.main
          // A 'key' é crucial. Quando a 'key' muda (aqui, 'currentInterface'), o AnimatePresence aciona as animações de saída e entrada.
          key={currentInterface}
          // Estado inicial da animação: invisível e 20px abaixo.
          initial={{ opacity: 0, y: 20 }}
          // Anima para: totalmente visível e na posição original (y:0).
          animate={{ opacity: 1, y: 0 }}
          // Animação de saída: fica invisível e 20px acima.
          exit={{ opacity: 0, y: -20 }}
          // Duração da transição da animação.
          transition={{ duration: 0.5 }}
        >
          {/* Chama a função para renderizar a interface correta, que será animada na troca. */}
          {renderInterface()}
        </motion.main>
      </AnimatePresence>
    </div>
  );
}

// Exporta o componente 'App' como o padrão deste arquivo.
export default App;