import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Target, Users, Trophy, Star, Zap, LucideIcon } from 'lucide-react';
import { solutionsService } from '../services/solution.service';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
}

interface Stat {
  number: string;
  label: string;
}

interface StatsResponse {
  success: boolean;
  data: {
    accepted: number;
  };
}

const Home: React.FC = () => {
  // Mapeamento de cores para classes Tailwind.
  // Isto garante que o compilador JIT do Tailwind deteta as classes completas.
  const colorClasses: { [key: string]: { bg: string; text: string } } = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
    teal: { bg: 'bg-teal-100', text: 'text-teal-600' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
  };

  const features: Feature[] = [
    {
      icon: Target,
      title: 'Desafios Reais',
      description: 'Problemas autênticos de empresas que precisam de soluções inovadoras',
      color: 'blue'
    },
    {
      icon: Trophy,
      title: 'Recompensas',
      description: 'Ganhe prémios, estágios ou reconhecimento pelas suas soluções',
      color: 'purple'
    },
    {
      icon: Users,
      title: 'Comunidade',
      description: 'Conecte-se com outros estudantes e empresas inovadoras',
      color: 'teal'
    },
    {
      icon: Star,
      title: 'PAP Validada',
      description: 'Transforme seu projeto académico em solução profissional',
      color: 'orange'
    }
  ];

  const [stats, setStats] = useState<Stat[]>([
    { number: '0+', label: 'Soluções Aceites' },
    { number: '200+', label: 'Empresas Parceiras' },
    { number: '10K+', label: 'Estudantes Ativos' },
    { number: '€50K+', label: 'Em Recompensas' }
  ]);

  useEffect(() => {
    const fetchStats = async (): Promise<void> => {
      try {
        const response: StatsResponse = await solutionsService.getStats();
        if (response.success) {
          setStats(prevStats => [
            { number: `${response.data.accepted}+`, label: 'Soluções Aceites' },
            ...prevStats.slice(1)
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Zap size={16} />
              <span>Plataforma de Inovação Académica</span>
            </motion.div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-6">
              Conectamos{' '}
              <span className="bg-gradient-to-r from-solve-blue to-solve-purple bg-clip-text text-transparent">
                Talentos
              </span>{' '}
              a{' '}
              <span className="bg-gradient-to-r from-solve-teal to-solve-blue bg-clip-text text-transparent">
                Desafios
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Transforme seu Projeto Académico em solução real para empresas. 
              Ganhe experiência, reconhecimento e recompensas enquanto desenvolve sua carreira.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/problems"
                className="group bg-gradient-to-r from-solve-blue to-solve-purple text-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-3"
              >
                <span>Explorar Desafios</span>
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </Link>
              <Link
                to="/how-it-works"
                className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl font-bold text-lg hover:border-solve-blue hover:text-solve-blue transition-all duration-300"
              >
                Como Funciona
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
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
              Por que escolher a{' '}
              <span className="bg-gradient-to-r from-solve-blue to-solve-purple bg-clip-text text-transparent">
                SolveEdu
              </span>
              ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Uma plataforma designed para conectar o talento académico às necessidades reais do mercado
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const colors = colorClasses[feature.color] || { bg: 'bg-gray-100', text: 'text-gray-600' };
              return (
                <motion.div
                  key={feature.title}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                >
                  <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center mb-6`}>
                    <Icon className={colors.text} size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-solve-blue to-solve-purple">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
              Pronto para fazer a diferença?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Junte-se à comunidade de inovação que está a transformar a educação e o mercado de trabalho
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/student-dashboard"
                className="bg-white text-solve-blue px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-xl transition-all duration-300"
              >
                Começar como Estudante
              </Link>
              <Link
                to="/company-dashboard"
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white hover:text-solve-blue transition-all duration-300"
              >
                Publicar Desafio
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;