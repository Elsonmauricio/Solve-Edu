// Importa o hook 'useState' do React para gerenciar o estado do componente.
import { useState } from 'react';
// Importa componentes 'motion' e 'AnimatePresence' da biblioteca 'framer-motion' para animações.
import { motion, AnimatePresence } from 'framer-motion';
// --- IMPLEMENTAÇÃO AUTH0 ---
import { useAuth0 } from '@auth0/auth0-react';
// Importa o componente de cabeçalho.
import { Header } from './components/layout/Header';
// Importa o componente de plano de fundo animado.
import AnimatedBackground from './components/layout/AnimatedBackground';
// Importa as diferentes interfaces (telas) da aplicação.
import { HomeInterface } from './components/interfaces/HomeInterface';
import { StudentInterface } from './components/interfaces/StudentInterface';
import { CompanyInterface } from './components/interfaces/CompanyInterface';
import { SchoolInterface } from './components/interfaces/SchoolInterface';
import { AdminInterface } from './components/interfaces/AdminInterface';
import { LoginInterface } from './components/interfaces/LoginInterface';
// --- NOVAS PÁGINAS ---
import { ChallengeInterface } from './components/interfaces/ChallengeInterface';
import { PapSubmissionInterface } from './components/interfaces/PapSubmissionInterface';
import { UserProfileInterface } from './components/interfaces/UserProfileInterface';
// ---------------------

// Importa o hook customizado para efeitos visuais.
import { useGlitchEffect } from './hooks/useGlitchEffect';

// Define o componente principal da aplicação, chamado 'App'.
function App() {


  // Estado para a interface principal (ex: 'home', 'estudante', 'empresa').
  const [currentInterface, setCurrentInterface] = useState('home');
  // --- IMPLEMENTAÇÃO ---
  // Novo estado para gerenciar sub-páginas dentro de uma interface principal (ex: 'perfil', 'desafio').
  const [currentSubInterface, setCurrentSubInterface] = useState(null);
  
  // Ativa os efeitos de glitch visuais em toda a aplicação usando o hook customizado.
  useGlitchEffect();

  // Função para renderizar a interface correta com base no estado.
  const renderInterface = () => {
    // --- IMPLEMENTAÇÃO ---
    // Prioriza a renderização da sub-interface se uma estiver ativa.
    if (currentSubInterface) {
      const handleBack = () => setCurrentSubInterface(null);
      switch (currentSubInterface) {
        case 'desafio':
          return <ChallengeInterface onBack={handleBack} />;
        case 'submissao-pap':
          return <PapSubmissionInterface onBack={handleBack} />;
        case 'perfil':
          return <UserProfileInterface onBack={handleBack} />;
        default:
          setCurrentSubInterface(null); // Reseta se a sub-interface for inválida
      }
    }

    switch (currentInterface) {
      // Caso seja 'estudante', renderiza a interface do estudante.
      case 'estudante':
        return <StudentInterface onNavigate={setCurrentSubInterface} onBack={() => setCurrentInterface('home')} />;
      // Caso seja 'empresa', renderiza a interface da empresa.
      case 'empresa':
        return <CompanyInterface onNavigate={setCurrentSubInterface} onBack={() => setCurrentInterface('home')} />;
      // Caso seja 'escola', renderiza a interface da escola.
      case 'escola':
        return <SchoolInterface onNavigate={setCurrentSubInterface} onBack={() => setCurrentInterface('home')} />;
      // Caso seja 'admin', renderiza a interface do administrador.
      case 'admin':
        return <AdminInterface onNavigate={setCurrentSubInterface} onBack={() => setCurrentInterface('home')} />;
      // Por padrão (caso 'default'), renderiza a interface principal (Home).
      default:
        return <HomeInterface onNavigate={setCurrentSubInterface} onInterfaceChange={setCurrentInterface} />;
    }
  };

  // Componente Wrapper para proteger rotas
  const ProtectedInterface = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth0();

    // Enquanto o Auth0 verifica o estado, mostramos uma tela de carregamento.
    if (isLoading) {
      return <div className="min-h-screen flex items-center justify-center bg-white text-2xl font-bold">A carregar...</div>;
    }

    // Se o utilizador estiver autenticado, mostra o conteúdo protegido (o dashboard).
    if (isAuthenticated) {
      return children;
    }

    // Caso contrário, mostra a interface de login.
    return <LoginInterface />;
  };

  // O componente 'App' retorna o JSX (a estrutura visual) abaixo.
  return (
    // Container principal da aplicação com altura mínima da tela e fundo branco.
    // 'overflow-x-hidden' impede a rolagem horizontal.
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Renderiza o componente de plano de fundo animado. */}
      <AnimatedBackground />
      {/* Renderiza o cabeçalho, passando o estado da interface atual e a função para alterá-la. */}
      <Header currentInterface={currentInterface} onInterfaceChange={setCurrentInterface} />
      
      {/* 'AnimatePresence' da framer-motion gerencia a animação de componentes que entram e saem da árvore de componentes. */}
      {/* 'mode="wait"' espera a animação de saída terminar antes de iniciar a de entrada. */}
      <AnimatePresence mode="wait">
        {/* 'motion.main' é o container principal do conteúdo que será animado. */}
        <motion.main
          // A 'key' garante que a animação ocorra na troca de interface.
          key={currentSubInterface || currentInterface}
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
          {['estudante', 'empresa', 'escola', 'admin'].includes(currentInterface) ? (
            <ProtectedInterface>
              {renderInterface()}
            </ProtectedInterface>
          ) : (
            renderInterface()
          )}
        </motion.main>
      </AnimatePresence>
    </div>
  );
}

// Exporta o componente 'App' como o padrão deste arquivo.
export default App;