// Importa a biblioteca 'framer-motion' para animações.
import { motion } from 'framer-motion';
// Importa componentes de UI personalizados.
import { MorphicCard } from '../ui/MorphicCard';
import { NeoButton } from '../ui/NeoButton';
import { GradientText } from '../ui/GradientText';

// Define o componente HomeInterface, que recebe uma função 'onInterfaceChange' como propriedade.
export const HomeInterface = ({ onInterfaceChange, onNavigate }) => {
  
  // --- IMPLEMENTAÇÃO ---
  // Agora os dados dos cartões estão aqui. Em um projeto real, isso viria de uma API.
  const accessCards = [
    { id: 'estudante', title: 'Estudante', description: 'Encontre desafios, desenvolva suas habilidades e construa seu futuro.', buttonText: 'Entrar como Estudante', color: 'blue' },
    { id: 'empresa', title: 'Empresa', description: 'Publique desafios, encontre talentos e impulsione a inovação.', buttonText: 'Entrar como Empresa', color: 'green' },
    { id: 'escola', title: 'Escola', description: 'Acompanhe seus alunos, gerencie parcerias e promova o sucesso.', buttonText: 'Entrar como Escola', color: 'teal' },
    { id: 'admin', title: 'Admin', description: 'Gerencie a plataforma, visualize estatísticas e controle tudo.', buttonText: 'Acessar Painel', color: 'gray' }
  ];

  const features = [
    {  title: 'Inovação Aberta', description: 'Conecte problemas reais a soluções criativas de estudantes talentosos.', color: 'blue' },
    {  title: 'Desenvolvimento', description: 'Ganhe experiência prática e construa um portfólio impressionante.', color: 'green' },
    {  title: 'Parcerias', description: 'Crie pontes entre o mundo acadêmico e o mercado de trabalho.', color: 'teal' }
  ];
  // --------------------

  // Retorna o JSX que define a estrutura e o conteúdo da página inicial.
  return (
    <section className="animated-bg text-gray-900 py-40 pt-48 relative overflow-hidden min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center relative z-10">
        <motion.div 
          className="space-y-12"
          initial={{ opacity: 0, y: 50 }} // Animação inicial: invisível e abaixo.
          animate={{ opacity: 1, y: 0 }} // Anima para: visível e na posição original.
          transition={{ duration: 0.8 }} // Duração da animação.
        >
          {/* Título principal (Hero Title). */}
          <h2 
            className="text-7xl md:text-9xl font-black leading-tight mb-16"
          >
            <GradientText>CONECTAMOS</GradientText>
            <span 
              className="block text-transparent bg-clip-text bg-gradient-to-r from-green-500 via-blue-500 to-teal-500"
            >
              O FUTURO
            </span>
          </h2>

          {/* Descrição principal (Hero Description). */}
          <motion.p 
            className="text-3xl md:text-5xl mb-20 font-light max-w-6xl mx-auto text-gray-700 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <span className="text-green-500 font-bold"></span> TRANSFORME SEUS PAPs EM SOLUÇÕES REVOLUCIONÁRIAS 
            <span className="block mt-6">
              <span className="text-blue-500 font-bold"></span> CONECTE TALENTO COM INOVAÇÃO
            </span>
          </motion.p>

          {/* Cartões de acesso para diferentes tipos de usuários. */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 max-w-8xl mx-auto mb-24"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {accessCards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }} // Atraso escalonado.
              >
                <MorphicCard 
                  className="p-12 cursor-pointer group relative liquid-animation text-center"
                  onClick={() => onInterfaceChange(card.id)} // Muda a interface ao clicar.
                  glow
                  liquid
                >
                  <motion.div 
                    className="text-9xl mb-10 gradient-text"
                    whileHover={{ scale: 1.25 }} // Aumenta o tamanho do emoji ao passar o mouse.
                    transition={{ duration: 0.7 }}
                  >
                    {card.emoji}
                  </motion.div>
                  
                  <h3 className={`text-4xl font-black mb-8 text-${card.color}-600 font-mono uppercase tracking-wider`}>
                    {card.title}
                  </h3>
                  
                  <p className="text-gray-700 mb-10 font-medium text-xl leading-relaxed">
                    {card.description}
                  </p>
                  
                  <NeoButton className="w-full text-center">
                    {card.buttonText}
                  </NeoButton>

                  {/* Indicadores visuais. */}
                  <motion.div
                    className={`absolute top-6 right-6 w-6 h-6 bg-${card.color}-500 rounded-full glow-effect`}
                    animate={{ opacity: [0.3, 1, 0.3] }} // Animação de pulsar.
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  
                  <motion.div
                    className={`absolute bottom-6 left-6 w-4 h-4 bg-${card.color === 'blue' ? 'green' : card.color === 'green' ? 'teal' : 'blue'}-500 rounded-full glow-effect`}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 2, delay: 0.5, repeat: Infinity }}
                  />
                </MorphicCard>
              </motion.div>
            ))}
          </motion.div>

          {/* Seção de funcionalidades. */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-7xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 1.2 + index * 0.1 }} // Atraso escalonado.
              >
                <MorphicCard className="p-10 relative group glow-effect text-center">
                  <motion.div 
                    className="text-8xl mb-8 gradient-text"
                    whileHover={{ scale: 1.25 }} // Aumenta o tamanho ao passar o mouse.
                    transition={{ duration: 0.5 }}
                  >
                    {feature.emoji}
                  </motion.div>
                  
                  <h3 className={`text-3xl font-black mb-6 text-${feature.color}-600 font-mono uppercase`}>
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-700 font-medium text-lg">
                    {feature.description}
                  </p>

                  <motion.div
                    className={`absolute top-4 right-4 w-4 h-4 bg-${feature.color}-500 rounded-full glow-effect`}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 2, delay: index * 0.3, repeat: Infinity }}
                  />
                </MorphicCard>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};