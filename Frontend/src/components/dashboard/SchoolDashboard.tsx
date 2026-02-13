import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import StatsCard from '../ui/StatsCard';
import { schoolService } from '../../services/school.service';
import UserBadge from '../ui/UserBadge';
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  Award, 
  Plus, 
  Bell, 
  Settings, 
  FileText,
  TrendingUp,
  Search
} from 'lucide-react';

const SchoolDashboard = () => {
  const { user } = useApp();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeProjects: 0,
    completedPaps: 0,
    averageGrade: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const response = await schoolService.getDashboardStats();
        if (response.success) {
          setStats({
            totalStudents: response.data.totalStudents || 0,
            activeProjects: response.data.activeProjects || 0,
            completedPaps: response.data.completedPaps || 0,
            averageGrade: response.data.averageGrade || 0
          });
        }
      } catch (error) {
        console.error("Failed to fetch school stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const schoolStats = {
    user: {
      id: user?.id || "unknown",
      name: user?.name || "Escola",
      email: user?.email || "",
      role: user?.role || "SCHOOL",
      avatar: user?.avatar,
      schoolName: (user as any)?.schoolProfile?.schoolName || user?.name || "Nome da Escola",
      level: "Instituição",
      isVerified: user?.isVerified,
      createdAt: user?.createdAt || new Date().toISOString(),
      updatedAt: user?.updatedAt || new Date().toISOString(),
    } as any,
    stats: [
      {
        title: "Alunos Registados",
        value: isLoading ? '...' : stats.totalStudents.toString(),
        change: 0, 
        icon: Users,
        color: "blue"
      },
      {
        title: "PAPs em Curso",
        value: isLoading ? '...' : stats.activeProjects.toString(),
        change: 0,
        icon: BookOpen,
        color: "orange"
      },
      {
        title: "Projetos Concluídos",
        value: isLoading ? '...' : stats.completedPaps.toString(),
        change: 0,
        icon: GraduationCap,
        color: "green"
      },
      {
        title: "Média das Notas",
        value: isLoading ? '...' : (stats.averageGrade || 0).toFixed(1),
        change: 0,
        icon: Award,
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
                Painel da Escola
              </h1>
              <p className="text-lg text-gray-600">
                Acompanhe o progresso dos seus alunos e projetos PAP
              </p>
            </div>
            <div className="flex space-x-3 mt-4 lg:mt-0">
              <button className="bg-solve-blue text-white px-6 py-3 rounded-xl font-semibold hover:bg-solve-purple transition-all duration-200 flex items-center space-x-2 shadow-lg shadow-blue-200">
                <Plus size={20} />
                <span>Registar Aluno</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:border-gray-400 transition-colors bg-white">
                <Bell size={20} />
              </button>
              <button className="flex items-center space-x-2 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:border-gray-400 transition-colors bg-white">
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
              {schoolStats.stats.map((stat, index) => (
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

            {/* Recent Activity / Students Progress */}
            <motion.div
              {...({ className: "bg-white rounded-2xl shadow-lg border border-gray-200" } as any)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Progresso Recente dos Alunos</h2>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Pesquisar aluno..." 
                    className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-solve-blue focus:border-transparent outline-none"
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold">
                          A{item}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">João Silva</h4>
                          <p className="text-sm text-gray-500">Técnico de Informática • 12º Ano</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          PAP Submetida
                        </span>
                        <p className="text-xs text-gray-400 mt-1">Há 2 horas</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <button className="text-solve-blue hover:text-solve-purple font-medium text-sm">
                    Ver todos os alunos
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions Grid */}
            <motion.div
              {...({ className: "grid grid-cols-1 md:grid-cols-2 gap-6" } as any)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 group cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FileText className="text-blue-600" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Relatórios de Turma</h3>
                    <p className="text-gray-600 text-sm">Gerar pautas e estatísticas</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 group cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Award className="text-purple-600" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Certificados</h3>
                    <p className="text-gray-600 text-sm">Emitir certificados de conclusão</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Profile Badge */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <UserBadge user={schoolStats.user} showStats={false} />
            </motion.div>

            {/* Performance Metrics */}
            <motion.div
              {...({ className: "bg-white rounded-2xl p-6 shadow-lg border border-gray-200" } as any)}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Desempenho Global</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Taxa de Conclusão</span>
                    <span className="font-semibold text-gray-900">85%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Parcerias Ativas</span>
                    <span className="font-semibold text-gray-900">12</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Notifications */}
            <motion.div
              {...({ className: "bg-white rounded-2xl p-6 shadow-lg border border-gray-200" } as any)}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Avisos</h3>
              <div className="space-y-3">
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                  <p className="text-sm text-yellow-800 font-medium">Prazo de entrega PAP</p>
                  <p className="text-xs text-yellow-600 mt-1">Faltam 15 dias para o fim do prazo.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolDashboard;
