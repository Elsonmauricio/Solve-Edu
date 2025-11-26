import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Target, 
  Upload, 
  Users, 
  Award, 
  CheckCircle, 
  Star,
  ArrowRight,
  GraduationCap,
  Building
} from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: Target,
      title: "1. Encontre Desafios",
      description: "Explore problemas reais publicados por empresas. Filtre por categoria, dificuldade ou recompensa.",
      color: "blue"
    },
    {
      icon: Upload,
      title: "2. Submeta Soluções", 
      description: "Desenvolva e submeta a sua solução. Inclua código, documentação e demonstrações.",
      color: "green"
    },
    {
      icon: Users,
      title: "3. Receba Feedback",
      description: "Empresas avaliam a sua solução e fornecem feedback construtivo para melhoria.",
      color: "purple"
    },
    {
      icon: Award,
      title: "4. Ganhe Reconhecimento",
      description: "Soluções aceites recebem recompensas, certificados e oportunidades de carreira.",
      color: "orange"
    }
  ];

  const benefits = [
    {
      icon: GraduationCap,
      title: "PAP Validada",
      description: "Transforme o seu projeto académico numa solução real com validação profissional.",
      color: "teal"
    },
    {
      icon: Building,
      title: "Conexões Empresariais",
      description: "Estabeleça contactos com empresas e aumente as suas oportunidades de emprego.",
      color: "blue"
    },
    {
      icon: Star,
      title: "Portfólio Profissional",
      description: "Construa um portfólio impressionante com projetos reais e soluções implementadas.",
      color: "purple"
    },
    {
      icon: CheckCircle,
      title: "Skills Comprovadas",
      description: "Demonstre as suas competências técnicas através de desafios do mundo real.",
      color: "green"
    }
  ];

  return (
    <div className="min-h-screen bg-white pt-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6">
              Como Funciona a{' '}
              <span className="bg-gradient-to-r from-solve-blue to-solve-purple bg-clip-text text-transparent">
                SolveEdu
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8">
              Conectamos o talento académico aos desafios do mercado real. 
              Transforme a sua educação em experiência profissional.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6">
              O Processo em 4 Passos
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Do desafio à solução - um caminho simples para transformar ideias em realidade
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  className="text-center"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className={`w-20 h-20 bg-${step.color}-100 rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                    <Icon className={`w-10 h-10 text-${step.color}-600`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6">
              Por que Participar?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Benefícios exclusivos para estudantes que transformam a sua educação em carreira
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={benefit.title}
                  className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                >
                  <div className={`w-16 h-16 bg-${benefit.color}-100 rounded-xl flex items-center justify-center mb-6`}>
                    <Icon className={`w-8 h-8 text-${benefit.color}-600`} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    {benefit.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* For Companies Section */}
      <section className="py-20 bg-gradient-to-r from-solve-blue to-solve-purple">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center text-white"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-black mb-6">
              E para as Empresas?
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              Aceda a talento jovem e inovador, resolva desafios reais e construa relações 
              com a próxima geração de profissionais
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto text-left">
              <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <h3 className="text-xl font-bold mb-3">Talentos Frescos</h3>
                <p className="text-blue-100">
                  Encontre estudantes com ideias inovadoras e abordagens criativas
                </p>
              </div>
              
              <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <h3 className="text-xl font-bold mb-3">Soluções Eficientes</h3>
                <p className="text-blue-100">
                  Resolva desafios específicos com soluções personalizadas e de qualidade
                </p>
              </div>
              
              <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <h3 className="text-xl font-bold mb-3">Recrutamento</h3>
                <p className="text-blue-100">
                  Identifique e recrute os melhores talentos antes da concorrência
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6">
              Pronto para Começar?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Junte-se a milhares de estudantes e empresas que já estão a transformar a educação e o mercado
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/student-dashboard"
                className="bg-gradient-to-r from-solve-blue to-solve-purple text-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-3"
              >
                <span>Começar como Estudante</span>
                <ArrowRight size={20} />
              </Link>
              <Link
                to="/company-dashboard"
                className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl font-bold text-lg hover:border-solve-blue hover:text-solve-blue transition-all duration-300"
              >
                Sou Empresa
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;