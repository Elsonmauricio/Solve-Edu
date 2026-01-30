import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { solutionsService } from '../../services/solution.service';
import StatsCard from '../ui/StatsCard';
import { studentService } from '../../services/student.service'; // Assumindo que este serviço existe
import UserBadge from '../ui/UserBadge';
import { Solution, Problem } from '../../types';
import SolutionCard from '../ui/SolutionCard';
import { problemsService } from '../../services/problems.service';
import { 
  Target, 
  Award, 
  TrendingUp, 
  Clock,
  Plus,
  Eye,
  Star,
  Calendar,
  Bell,
  Settings,
  BookOpen
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useApp();
  const [stats, setStats] = useState({
    submittedCount: 0,
    acceptedCount: 0,
    ongoingCount: 0,
    averageRating: "0"
  });
  const [mySolutions, setMySolutions] = useState<Solution[]>([]);
  const [activeProblems, setActiveProblems] = useState<Problem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const response = await studentService.getDashboardStats();
        if (response.success) {
          setStats({
            submittedCount: response.data.submittedCount,
            acceptedCount: response.data.acceptedCount,
            ongoingCount: response.data.ongoingCount,
            averageRating: response.data.averageRating.toString()
          });
        }
      } catch (error) {
        console.error("Failed to fetch student dashboard stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchMySolutions = async () => {
      try {
        // O backend filtra automaticamente para o estudante logado
        const response = await solutionsService.getAll({ limit: 3, sortBy: 'submittedAt', sortOrder: 'desc' });
        if (response.success) {
          setMySolutions(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch student solutions:", error);
      }
    };

    const fetchRecommendedProblems = async () => {
      try {
        // Busca os problemas mais populares ou recentes como recomendação
        const response = await problemsService.getAll({ limit: 3, sortBy: 'views', sortOrder: 'desc' });
        if (response.success) {
          setActiveProblems(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch recommended problems:", error);
      }
    };

    fetchStats();
    fetchMySolutions();
    fetchRecommendedProblems();
  }, []);

  // Os dados do UserBadge agora vêm do `user` do contexto e das `stats` do estado
  const studentStats = {
    user: {
      id: user?.id || "unknown",
      name: user?.name || "Estudante",
      role: user?.role || "Estudante" as const,
      school: user?.school || "Escola não definida",
      level: user?.level || "Iniciante",
      isVerified: user?.isVerified,
      solutionsCount: stats.submittedCount,
      rating: parseFloat(stats.averageRating)
    },
    stats: [
      {
        title: "Soluções Submetidas",
        value: isLoading ? '...' : stats.submittedCount.toString(),
        change: 0,
        icon: Target,
        color: "blue"
      },
      {
        title: "Soluções Aceites",
        value: isLoading ? '...' : stats.acceptedCount.toString(),
        change: 0,
        icon: Award,
        color: "green"
      },
      {
        title: "Projetos em Curso",
        value: isLoading ? '...' : stats.ongoingCount.toString(),
        change: 0,
        icon: Clock,
        color: "orange"
      },
      {
        title: "Rating Médio",
        value: isLoading ? '...' : `${stats.averageRating}/5`,
        change: 0,
        icon: Star,
        color: "purple"
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          {...({ className: "mb-8" } as any)}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
                Dashboard do Estudante
              </h1>
              <p className="text-lg text-gray-600">
                Acompanhe o seu progresso e gerencie as suas soluções
              </p>
            </div>
            <div className="flex space-x-3 mt-4 lg:mt-0">
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:border-gray-400 transition-colors">
                <Bell size={20} />
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:border-gray-400 transition-colors">
                <Settings size={20} />
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Stats Grid */}
            <motion.div
              {...({ className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" } as any)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {studentStats.stats.map((stat, index) => (
                <StatsCard
                  key={stat.title}
                  title={stat.title}
                  value={stat.value}
                  change={stat.change}
                  icon={stat.icon}
                  color={stat.color as 'blue' | 'green' | 'orange' | 'purple' | 'teal'}
                  delay={index * 0.1}
                />
              ))}
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              {...({ className: "grid grid-cols-1 md:grid-cols-2 gap-6" } as any)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Link
                to="/problems"
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-solve-blue to-solve-purple rounded-xl flex items-center justify-center">
                    <Target className="text-white" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Explorar Desafios</h3>
                    <p className="text-gray-600 text-sm">Encontre novos problemas para resolver</p>
                  </div>
                  <Plus className="text-gray-400 group-hover:text-solve-blue transition-colors" size={20} />
                </div>
              </Link>

              <Link
                to="/solutions"
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-solve-teal to-solve-blue rounded-xl flex items-center justify-center">
                    <Eye className="text-white" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Ver Soluções</h3>
                    <p className="text-gray-600 text-sm">Inspire-se com soluções da comunidade</p>
                  </div>
                  <BookOpen className="text-gray-400 group-hover:text-solve-teal transition-colors" size={20} />
                </div>
              </Link>
            </motion.div>

            {/* My Solutions */}
            <motion.div
              {...({ className: "bg-white rounded-2xl shadow-lg border border-gray-200" } as any)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">As Minhas Soluções</h2>
                  <Link
                    to="/solutions"
                    className="text-solve-blue hover:text-solve-purple font-medium"
                  >
                    Ver todas
                  </Link>
                </div>
              </div>
              
              <div className="p-6">
                {mySolutions.length > 0 ? (
                  <div className="space-y-4">
                    {mySolutions.slice(0, 3).map((solution, index) => (
                      <SolutionCard key={solution.id} solution={solution} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Ainda não submeteu soluções
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Comece por explorar desafios e submeter a sua primeira solução.
                    </p>
                    <Link
                      to="/problems"
                      className="bg-solve-blue text-white px-6 py-3 rounded-xl font-medium hover:bg-solve-purple transition-colors"
                    >
                      Explorar Desafios
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Recommended Problems */}
            <motion.div
              {...({ className: "bg-white rounded-2xl shadow-lg border border-gray-200" } as any)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Desafios Recomendados</h2>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {activeProblems.map((problem, index) => (
                    <div
                      key={problem.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-solve-blue transition-colors group"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 group-hover:text-solve-blue transition-colors">
                          {problem.title}
                        </h4>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <span>{typeof problem.company === 'string' ? problem.company : problem.company?.companyName || "Confidencial"}</span>
                          <span>•</span>
                          <span>{problem.deadline || 'Sem limite'}</span>
                          {problem.reward && (
                            <>
                              <span>•</span>
                              <span className="text-green-600 font-medium">{problem.reward}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <Link
                        to={`/problems/${problem.id}`}
                        className="ml-4 px-4 py-2 bg-solve-blue text-white rounded-lg font-medium hover:bg-solve-purple transition-colors"
                      >
                        Ver
                      </Link>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 text-center">
                  <Link
                    to="/problems"
                    className="text-solve-blue hover:text-solve-purple font-medium"
                  >
                    Ver todos os desafios →
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Profile */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              <UserBadge user={studentStats.user} showStats={true} />
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              {...({ className: "bg-white rounded-2xl p-6 shadow-lg border border-gray-200" } as any)}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividade Recente</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Award className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">Solução aceite em "Sistema de Inventário"</p>
                    <p className="text-xs text-gray-500">Há 2 dias</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Plus className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">Nova solução submetida</p>
                    <p className="text-xs text-gray-500">Há 1 semana</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Star className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">Atingiu nível Avançado</p>
                    <p className="text-xs text-gray-500">Há 2 semanas</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Upcoming Deadlines */}
            <motion.div
              {...({ className: "bg-white rounded-2xl p-6 shadow-lg border border-gray-200" } as any)}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.4 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Prazos Próximos</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">App Mobile</p>
                    <p className="text-xs text-gray-600">5 dias restantes</p>
                  </div>
                  <Calendar className="w-4 h-4 text-orange-600" />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Website Redesign</p>
                    <p className="text-xs text-gray-600">12 dias restantes</p>
                  </div>
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
              </div>
            </motion.div>

            {/* Progress */}
            <motion.div
              {...({ className: "bg-gradient-to-r from-solve-blue to-solve-purple rounded-2xl p-6 text-white" } as any)}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.6 }}
            >
              <h3 className="text-lg font-semibold mb-2">Progresso do Perfil</h3>
              <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                <div className="bg-white h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
              <p className="text-blue-100 text-sm">75% completo - Continue a submissão de soluções!</p>
              
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Soluções Submetidas</span>
                  <span>8/10</span>
                </div>
                <div className="flex justify-between">
                  <span>Perfil Completo</span>
                  <span>100%</span>
                </div>
                <div className="flex justify-between">
                  <span>Skills Validadas</span>
                  <span>6/8</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;