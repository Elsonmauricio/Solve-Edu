// Importa a biblioteca 'framer-motion' para animações.
import { motion } from 'framer-motion';
// Importa componentes de UI personalizados.
import { MorphicCard } from '../ui/MorphicCard';
import { NeoButton } from '../ui/NeoButton';
import { QuantumText } from '../ui/QuantumText';

// Define o componente AdminInterface, que recebe uma função 'onBack' como propriedade.
export const AdminInterface = ({ onBack }) => {
  // Dados estáticos para as estatísticas globais do painel.
  const globalStats = [
    { icon: '👥', value: '1,247', label: 'Total Utilizadores Quânticos', color: 'gray' },
    { icon: '🎯', value: '127', label: 'Desafios Quânticos Ativos', color: 'gray' },
    { icon: '✅', value: '89', label: 'Projetos Quânticos Concluídos', color: 'gray' },
    { icon: '💰', value: '€45,600', label: 'Volume Total Quântico', color: 'gray' }
  ];

  // Dados estáticos para a atividade recente.
  const recentActivity = [
    {
      title: 'Nova empresa registada: TechStart Quântica Lda',
      time: 'Há 2 horas',
      type: 'new'
    },
    {
      title: 'Projeto concluído: Sistema de Inventário Quântico',
      time: 'Há 5 horas',
      type: 'completed'
    },
    {
      title: '15 novos estudantes quânticos registados',
      time: 'Hoje',
      type: 'registration'
    }
  ];

  // Dados estáticos para os alertas do sistema.
  const systemAlerts = [
    '3 desafios quânticos expiram em 24 horas',
    '2 utilizadores reportaram problemas técnicos quânticos',
    '1 empresa quântica pendente de aprovação'
  ];

  // Dados estáticos para as ações rápidas.
  const quickActions = [
    '👥 GERIR UTILIZADORES QUÂNTICOS',
    '🎯 MODERAR DESAFIOS QUÂNTICOS', 
    '📊 RELATÓRIOS QUÂNTICOS'
  ];

  // Retorna o JSX que define a estrutura e o conteúdo da interface do administrador.
  return (
    <main className="max-w-7xl mx-auto px-6 lg:px-8 py-24 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      {/* Cabeçalho da página do painel de administração. */}
      <motion.div 
        className="flex justify-between items-center mb-12"
        initial={{ opacity: 0, y: -50 }} // Animação inicial: invisível e acima.
        animate={{ opacity: 1, y: 0 }} // Anima para: visível e na posição original.
        transition={{ duration: 0.6 }} // Duração da animação.
      >
        <div>
          <h2 className="text-5xl font-black text-gray-700 mb-4">
            <QuantumText>⚙️ Painel Administrativo Quântico</QuantumText>
          </h2>
          <p className="text-gray-600 text-xl">Gestão Completa da Plataforma Quântica</p>
        </div>
        <NeoButton onClick={onBack}>← VOLTAR</NeoButton>
      </motion.div>

      {/* Seção de métricas globais. */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16"
        initial={{ opacity: 0 }} // Animação inicial: invisível.
        animate={{ opacity: 1 }} // Anima para: visível.
        transition={{ duration: 0.6, delay: 0.2 }} // Duração e atraso da animação.
      >
        {globalStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.8 }} // Animação inicial: invisível e menor.
            animate={{ opacity: 1, scale: 1 }} // Anima para: visível e no tamanho original.
            transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }} // Animação com atraso escalonado.
          >
            <MorphicCard className="p-8 text-center glow-effect">
              <div className="text-5xl mb-4">{stat.icon}</div>
              <div className="text-4xl font-black text-gray-700 quantum-text">
                {stat.value}
              </div>
              <div className="text-gray-600 font-medium text-lg mt-2">
                {stat.label}
              </div>
            </MorphicCard>
          </motion.div>
        ))}
      </motion.div>

      {/* Painel de administração com atividade recente e gestão rápida. */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        {/* Seção de atividade recente. */}
        <motion.div
          initial={{ opacity: 0, x: -30 }} // Animação inicial: invisível e à esquerda.
          animate={{ opacity: 1, x: 0 }} // Anima para: visível e na posição original.
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <MorphicCard className="p-10 glow-effect">
            <h3 className="text-4xl font-black mb-8 text-gray-900 quantum-text">
              📊 Atividade Quântica Recente
            </h3>
            
            <div className="space-y-6">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.title}
                  className="flex justify-between items-center p-6 bg-gray-50 rounded-2xl border-2 border-gray-200"
                  initial={{ opacity: 0, y: 20 }} // Animação inicial: invisível e abaixo.
                  animate={{ opacity: 1, y: 0 }} // Anima para: visível e na posição original.
                  transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }} // Atraso escalonado.
                >
                  <div>
                    <div className="font-bold text-xl text-gray-900">
                      {activity.title}
                    </div>
                    <div className="text-lg text-gray-600 mt-1">
                      {activity.time}
                    </div>
                  </div>
                  
                  <span className={`px-6 py-3 rounded-full text-lg font-bold text-white ${
                    activity.type === 'new' 
                      ? 'bg-green-500' 
                      : activity.type === 'completed'
                      ? 'bg-blue-500'
                      : 'bg-teal-500'
                  }`}>
                    {activity.type === 'new' ? 'Novo' : activity.type === 'completed' ? 'Concluído' : 'Registo'}
                  </span>
                </motion.div>
              ))}
            </div>
          </MorphicCard>
        </motion.div>

        {/* Seção de gestão rápida. */}
        <motion.div
          initial={{ opacity: 0, x: 30 }} // Animação inicial: invisível e à direita.
          animate={{ opacity: 1, x: 0 }} // Anima para: visível e na posição original.
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <MorphicCard className="p-10 text-center glow-effect liquid-animation">
            <h3 className="text-4xl font-black mb-8 quantum-text">
              🛠️ Gestão Quântica Rápida
            </h3>
            
            <div className="space-y-6">
              {quickActions.map((action, index) => (
                <motion.div
                  key={action}
                  initial={{ opacity: 0, scale: 0.9 }} // Animação inicial: invisível e menor.
                  animate={{ opacity: 1, scale: 1 }} // Anima para: visível e no tamanho original.
                  transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }} // Atraso escalonado.
                >
                  <NeoButton className="w-full justify-center">
                    {action}
                  </NeoButton>
                </motion.div>
              ))}
            </div>
          </MorphicCard>
        </motion.div>
      </motion.div>

      {/* Seção de alertas do sistema. */}
      <motion.div
        initial={{ opacity: 0, y: 30 }} // Animação inicial: invisível e abaixo.
        animate={{ opacity: 1, y: 0 }} // Anima para: visível e na posição original.
        transition={{ duration: 0.6, delay: 0.9 }}
      >
        <MorphicCard className="p-8 border-2 border-red-200 bg-red-50 glow-effect">
          <h3 className="text-3xl font-black text-red-800 mb-6 quantum-text">
            🚨 Alertas Quânticos do Sistema
          </h3>
          
          <div className="space-y-4 text-lg">
            {systemAlerts.map((alert, index) => (
              <motion.div
                key={alert}
                className="text-red-700 font-medium"
                initial={{ opacity: 0, x: -20 }} // Animação inicial: invisível e à esquerda.
                animate={{ opacity: 1, x: 0 }} // Anima para: visível e na posição original.
                transition={{ duration: 0.4, delay: 1.0 + index * 0.1 }} // Atraso escalonado.
              >
                • {alert}
              </motion.div>
            ))}
          </div>
        </MorphicCard>
      </motion.div>
    </main>
  );
};