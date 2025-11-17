// Importa a biblioteca 'framer-motion' para animações.
import { motion } from 'framer-motion';
// Importa componentes de UI personalizados.
import { MorphicCard } from '../ui/MorphicCard';
import { NeoButton } from '../ui/NeoButton';
import { QuantumText } from '../ui/QuantumText';

// Define o componente CompanyInterface, que recebe uma função 'onBack' como propriedade.
export const CompanyInterface = ({ onBack }) => {
  // Dados estáticos para as estatísticas da empresa.
  const stats = [
    { icon: '📋', value: '12', label: 'Desafios Quânticos Publicados', color: 'green' },
    { icon: '👥', value: '45', label: 'Candidaturas Recebidas', color: 'blue' },
    { icon: '✅', value: '8', label: 'Projetos Concluídos', color: 'teal' },
    { icon: '💰', value: '€3,500', label: 'Investimento Total', color: 'green' }
  ];

  // Dados estáticos para as candidaturas pendentes.
  const pendingApplications = [
    {
      name: 'Maria Santos',
      project: 'Sistema de Inventário Quântico',
      status: 'pending'
    },
    {
      name: 'João Silva',
      project: 'App Mobile Quântico',
      status: 'pending'
    }
  ];

  // Dados estáticos para os desafios da empresa.
  const myChallenges = [
    {
      title: 'Sistema de Gestão de Inventário Quântico',
      details: '12 candidaturas • €500 • 30 dias restantes',
      status: 'active'
    },
    {
      title: 'Redesign de Website Quântico',
      details: 'Concluído • €300 • João Silva',
      status: 'completed'
    }
  ];

  // Retorna o JSX que define a estrutura e o conteúdo da interface da empresa.
  return (
    <main className="max-w-7xl mx-auto px-6 lg:px-8 py-24 bg-gradient-to-b from-green-50 to-white min-h-screen">
      {/* Cabeçalho da página da empresa. */}
      <motion.div 
        className="flex justify-between items-center mb-12"
        initial={{ opacity: 0, y: -50 }} // Animação inicial: invisível e acima.
        animate={{ opacity: 1, y: 0 }} // Anima para: visível e na posição original.
        transition={{ duration: 0.6 }} // Duração da animação.
      >
        <div>
          <h2 className="text-5xl font-black text-green-600 mb-4">
            <QuantumText>🏢 Portal Quântico da Empresa</QuantumText>
          </h2>
          <p className="text-gray-600 text-xl">TechCorp Lda - Bem-vindos ao futuro!</p>
        </div>
        <NeoButton onClick={onBack}>← VOLTAR</NeoButton>
      </motion.div>

      {/* Seção de estatísticas. */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16"
        initial={{ opacity: 0 }} // Animação inicial: invisível.
        animate={{ opacity: 1 }} // Anima para: visível.
        transition={{ duration: 0.6, delay: 0.2 }} // Duração e atraso da animação.
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.8 }} // Animação inicial: invisível e menor.
            animate={{ opacity: 1, scale: 1 }} // Anima para: visível e no tamanho original.
            transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }} // Atraso escalonado.
          >
            <MorphicCard className="p-8 text-center glow-effect">
              <div className="text-5xl mb-4">{stat.icon}</div>
              <div className={`text-4xl font-black text-${stat.color}-600 quantum-text`}>
                {stat.value}
              </div>
              <div className="text-gray-600 font-medium text-lg mt-2">
                {stat.label}
              </div>
            </MorphicCard>
          </motion.div>
        ))}
      </motion.div>

      {/* Seção de ações rápidas. */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        {/* Card para criar um novo desafio. */}
        <motion.div
          initial={{ opacity: 0, x: -30 }} // Animação inicial: invisível e à esquerda.
          animate={{ opacity: 1, x: 0 }} // Anima para: visível e na posição original.
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <MorphicCard className="p-10 text-center glow-effect liquid-animation">
            <h3 className="text-4xl font-black mb-6 quantum-text">
              ✨ Publicar Novo Desafio Quântico
            </h3>
            <p className="mb-8 text-xl text-gray-700 leading-relaxed">
              Encontre estudantes talentosos para resolver os seus desafios empresariais revolucionários
            </p>
            <NeoButton>CRIAR DESAFIO QUÂNTICO</NeoButton>
          </MorphicCard>
        </motion.div>

        {/* Card de candidaturas pendentes. */}
        <motion.div
          initial={{ opacity: 0, x: 30 }} // Animação inicial: invisível e à direita.
          animate={{ opacity: 1, x: 0 }} // Anima para: visível e na posição original.
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <MorphicCard className="p-10 glow-effect">
            <h3 className="text-4xl font-black mb-8 text-gray-900 quantum-text">
              📊 Candidaturas Pendentes
            </h3>
            
            <div className="space-y-6">
              {pendingApplications.map((application, index) => (
                <motion.div
                  key={application.name}
                  className="flex justify-between items-center p-6 bg-gray-50 rounded-2xl border-2 border-gray-200"
                  initial={{ opacity: 0, y: 20 }} // Animação inicial: invisível e abaixo.
                  animate={{ opacity: 1, y: 0 }} // Anima para: visível e na posição original.
                  transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }} // Atraso escalonado.
                >
                  <div>
                    <div className="font-bold text-xl text-gray-900">
                      {application.name}
                    </div>
                    <div className="text-lg text-gray-600 mt-1">
                      {application.project}
                    </div>
                  </div>
                  <NeoButton>Avaliar</NeoButton>
                </motion.div>
              ))}
            </div>
          </MorphicCard>
        </motion.div>
      </motion.div>

      {/* Seção "Os Meus Desafios". */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <MorphicCard className="p-10 glow-effect">
          <h3 className="text-4xl font-black mb-10 text-gray-900 quantum-text">
            🎯 Os Meus Desafios Quânticos
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {myChallenges.map((challenge, index) => (
              <motion.div
                key={challenge.title}
                className={`p-8 rounded-2xl border-2 glow-effect ${
                  challenge.status === 'active' 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
                initial={{ opacity: 0, scale: 0.9 }} // Animação inicial: invisível e menor.
                animate={{ opacity: 1, scale: 1 }} // Anima para: visível e no tamanho original.
                transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }} // Atraso escalonado.
              >
                <h4 className="font-bold text-2xl mb-4 text-gray-900">
                  {challenge.title}
                </h4>
                <p className="text-lg text-gray-600 mb-6">
                  {challenge.details}
                </p>
                <span className={`px-6 py-3 rounded-full text-lg font-bold text-white ${
                  challenge.status === 'active' ? 'bg-green-500' : 'bg-blue-500'
                }`}>
                  {challenge.status === 'active' ? 'Ativo' : 'Concluído'}
                </span>
              </motion.div>
            ))}
          </div>
        </MorphicCard>
      </motion.div>
    </main>
  );
};