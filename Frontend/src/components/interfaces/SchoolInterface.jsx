// Importa a biblioteca 'framer-motion' para animações.
import { motion } from 'framer-motion';
// Importa componentes de UI personalizados.
import { MorphicCard } from '../ui/MorphicCard';
import { NeoButton } from '../ui/NeoButton';
import { QuantumText } from '../ui/QuantumText';

// Define o componente SchoolInterface, que recebe uma função 'onBack' como propriedade.
export const SchoolInterface = ({ onBack }) => {
  // Dados estáticos para as estatísticas da escola.
  const stats = [
    { icon: '👨‍🎓', value: '156', label: 'Estudantes Quânticos Ativos', color: 'teal' },
    { icon: '📚', value: '89', label: 'PAPs Quânticos em Curso', color: 'blue' },
    { icon: '🤝', value: '23', label: 'Parcerias Quânticas Ativas', color: 'green' },
    { icon: '🏆', value: '94%', label: 'Taxa de Sucesso Quântico', color: 'teal' }
  ];

  // Dados estáticos para os estudantes recentes.
  const recentStudents = [
    {
      name: 'João Silva',
      project: 'Projeto: Sistema de Reservas Quântico - Em Progresso',
      status: 'active'
    },
    {
      name: 'Maria Santos',
      project: 'Projeto: App Mobile Quântico - Concluído',
      status: 'completed'
    }
  ];

  // Dados estáticos para os PAPs (Provas de Aptidão Profissional) em destaque.
  const featuredPAPs = [
    {
      title: 'Sistema de Gestão Escolar Quântico',
      student: 'Ana Costa - 12º Ano',
      company: 'Empresa: EduTech Solutions Quântica',
      color: 'teal'
    },
    {
      title: 'App de Sustentabilidade Quântica',
      student: 'Pedro Oliveira - 12º Ano',
      company: 'Empresa: GreenTech Quântica',
      color: 'blue'
    },
    {
      title: 'Plataforma E-commerce Quântica',
      student: 'Sofia Martins - 12º Ano',
      company: 'Empresa: ShopOnline Quântica',
      color: 'green'
    }
  ];

  // Retorna o JSX que define a estrutura e o conteúdo da interface da escola.
  return (
    <main className="max-w-7xl mx-auto px-6 lg:px-8 py-24 bg-gradient-to-b from-teal-50 to-white min-h-screen">
      {/* Cabeçalho da página da escola. */}
      <motion.div 
        className="flex justify-between items-center mb-12"
        initial={{ opacity: 0, y: -50 }} // Animação inicial: invisível e acima.
        animate={{ opacity: 1, y: 0 }} // Anima para: visível e na posição original.
        transition={{ duration: 0.6 }} // Duração da animação.
      >
        <div>
          <h2 className="text-5xl font-black text-teal-600 mb-4">
            <QuantumText>🏫 Portal Quântico da Escola</QuantumText>
          </h2>
          <p className="text-gray-600 text-xl">Escola Secundária de Tecnologia Quântica</p>
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

      {/* Seção de gestão de estudantes e parcerias. */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        {/* Card de estudantes recentes. */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <MorphicCard className="p-10 glow-effect">
            <h3 className="text-4xl font-black mb-8 text-gray-900 quantum-text">
              👥 Estudantes Quânticos Recentes
            </h3>
            
            <div className="space-y-6">
              {recentStudents.map((student, index) => (
                <motion.div
                  key={student.name}
                  className={`flex justify-between items-center p-6 rounded-2xl border-2 ${
                    student.status === 'active' 
                      ? 'bg-teal-50 border-teal-200' 
                      : 'bg-blue-50 border-blue-200'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }} // Atraso escalonado.
                >
                  <div>
                    <div className="font-bold text-xl text-gray-900">
                      {student.name}
                    </div>
                    <div className="text-lg text-gray-600 mt-1">
                      {student.project}
                    </div>
                  </div>
                  
                  <span className={`px-6 py-3 rounded-full text-lg font-bold text-white ${
                    student.status === 'active' ? 'bg-teal-500' : 'bg-blue-500'
                  }`}>
                    {student.status === 'active' ? 'Ativo' : 'Concluído'}
                  </span>
                </motion.div>
              ))}
            </div>
          </MorphicCard>
        </motion.div>

        {/* Card para novas parcerias. */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <MorphicCard className="p-10 text-center glow-effect liquid-animation">
            <h3 className="text-4xl font-black mb-6 quantum-text">
              🤝 Novas Parcerias Quânticas
            </h3>
            <p className="mb-8 text-xl text-gray-700 leading-relaxed">
              Conecte os seus estudantes com empresas parceiras do futuro
            </p>
            <NeoButton>EXPLORAR PARCERIAS QUÂNTICAS</NeoButton>
          </MorphicCard>
        </motion.div>
      </motion.div>

      {/* Seção de PAPs em destaque. */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <MorphicCard className="p-10 glow-effect">
          <h3 className="text-4xl font-black mb-10 text-gray-900 quantum-text">
            🌟 PAPs Quânticos em Destaque
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredPAPs.map((pap, index) => (
              <motion.div
                key={pap.title}
                className={`p-8 rounded-2xl border-2 glow-effect ${
                  pap.color === 'teal' 
                    ? 'bg-teal-50 border-teal-200'
                    : pap.color === 'blue'
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-green-50 border-green-200'
                }`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }} // Atraso escalonado.
              >
                <h4 className="font-bold text-2xl mb-4 text-gray-900">
                  {pap.title}
                </h4>
                <p className="text-lg text-gray-600 mb-2">
                  {pap.student}
                </p>
                <p className="text-lg text-gray-600">
                  {pap.company}
                </p>
              </motion.div>
            ))}
          </div>
        </MorphicCard>
      </motion.div>
    </main>
  );
};