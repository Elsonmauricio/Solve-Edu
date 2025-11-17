// Importa a biblioteca 'framer-motion' para animações.
import { motion } from 'framer-motion';
// Importa componentes de UI personalizados.
import { MorphicCard } from '../ui/MorphicCard';
import { NeoButton } from '../ui/NeoButton';
import { QuantumText } from '../ui/QuantumText';

// Define o componente StudentInterface, que recebe uma função 'onBack' como propriedade.
export const StudentInterface = ({ onBack }) => {
  // Mapeamento de cores para classes de CSS, para uso dinâmico nos estilos.
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    teal: 'text-teal-600',
    gray: 'text-gray-600'
  };

  // Dados estáticos para as estatísticas do estudante.
  const stats = [
    { icon: '📚', value: '3', label: 'Projetos Quânticos Ativos', color: 'blue' },
    { icon: '✅', value: '7', label: 'Projetos Concluídos', color: 'green' },
    { icon: '⭐', value: '4.8', label: 'Avaliação Quântica', color: 'teal' },
    { icon: '🏆', value: '€1,200', label: 'Total Ganho', color: 'blue' }
  ];

  // Dados estáticos para os desafios recomendados ao estudante.
  const recommendedChallenges = [
    {
      category: '💻 Tecnologia Quântica',
      title: 'App de Gestão Escolar Quântica',
      description: 'Desenvolver uma aplicação revolucionária para gestão de horários e notas',
      price: '€400',
      status: 'active'
    },
    {
      category: '🌱 Sustentabilidade',
      title: 'Sistema de Reciclagem Quântica',
      description: 'Criar solução revolucionária para otimizar processos de reciclagem',
      price: 'Estágio',
      status: 'active'
    }
  ];

  // Dados estáticos para os projetos do estudante.
  const myProjects = [
    {
      title: 'Sistema de Reservas Online Quântico',
      client: 'Hotel Central - Em Progresso Quântico (75%)',
      status: 'active'
    },
    {
      title: 'App de Delivery Quântico',
      client: 'DeliveryFast - Concluído com Sucesso',
      status: 'completed'
    }
  ];

  // Retorna o JSX que define a estrutura e o conteúdo da interface do estudante.
  return (
    <main className="max-w-7xl mx-auto px-6 lg:px-8 py-24 bg-gradient-to-b from-blue-50 to-white min-h-screen">
      {/* Cabeçalho da página do estudante. */}
      <motion.div 
        className="flex justify-between items-center mb-12"
        initial={{ opacity: 0, y: -50 }} // Animação inicial: invisível e acima.
        animate={{ opacity: 1, y: 0 }} // Anima para: visível e na posição original.
        transition={{ duration: 0.6 }} // Duração da animação.
      >
        <div>
          <h2 className="text-5xl font-black text-blue-600 mb-4">
            <QuantumText>🎓 Dashboard Quântico do Estudante</QuantumText>
          </h2>
          <p className="text-gray-600 text-xl">Bem-vindo ao futuro, João Silva!</p>
        </div>
        <NeoButton onClick={onBack}>← VOLTAR</NeoButton>
      </motion.div>

      {/* Seção de estatísticas. */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }} // Atraso escalonado.
          >
            <MorphicCard className="p-8 text-center glow-effect">
              <div className="text-5xl mb-4">{stat.icon}</div>
              <div className={`text-4xl font-black ${colorClasses[stat.color]} quantum-text`}>
                {stat.value}
              </div>
              <div className="text-gray-600 font-medium text-lg mt-2">
                {stat.label}
              </div>
            </MorphicCard>
          </motion.div>
        ))}
      </motion.div>

      {/* Seção de desafios recomendados. */}
      <motion.div 
        className="mb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <h3 className="text-4xl font-black text-gray-900 mb-10">
          <QuantumText>🎯 Desafios Quânticos Recomendados</QuantumText>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recommendedChallenges.map((challenge, index) => (
            <motion.div
              key={challenge.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }} // Atraso escalonado.
            >
              <MorphicCard className="p-8 glow-effect">
                <span className="bg-blue-100 text-blue-800 text-sm font-bold px-4 py-2 rounded-full">
                  {challenge.category}
                </span>
                
                <h4 className="text-2xl font-bold mt-6 mb-4 text-gray-900">
                  {challenge.title}
                </h4>
                
                <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                  {challenge.description}
                </p>
                
                <div className="flex justify-between items-center">
                  <span className="text-green-600 font-black text-xl">
                    {challenge.price}
                  </span>
                  <NeoButton>Candidatar</NeoButton>
                </div>
              </MorphicCard>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Seção "Os Meus Projetos". */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <MorphicCard className="p-10 glow-effect">
          <h3 className="text-4xl font-black mb-10 text-gray-900">
            <QuantumText>📋 Os Meus Projetos Quânticos</QuantumText>
          </h3>
          
          <div className="space-y-6">
            {myProjects.map((project, index) => (
              <motion.div
                key={project.title}
                className={`flex justify-between items-center p-6 rounded-2xl border-2 ${
                  project.status === 'active' 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'bg-green-50 border-green-200'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }} // Atraso escalonado.
              >
                <div>
                  <div className="font-bold text-xl text-gray-900">
                    {project.title}
                  </div>
                  <div className="text-lg text-gray-600 mt-1">
                    {project.client}
                  </div>
                </div>
                
                <span className={`px-6 py-3 rounded-full text-lg font-bold text-white ${
                  project.status === 'active' ? 'bg-blue-500' : 'bg-green-500'
                }`}>
                  {project.status === 'active' ? 'Ativo' : 'Concluído'}
                </span>
              </motion.div>
            ))}
          </div>
        </MorphicCard>
      </motion.div>
    </main>
  );
};