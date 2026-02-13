import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/admin.service';
import { problemsService } from '../../services/problems.service';
import { solutionsService } from '../../services/solution.service';
import StatsCard from '../ui/StatsCard';
import { Problem, Solution } from '../../types';
import { 
  Users, 
  Target, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  Eye,
  Settings,
  Shield,
  BarChart3,
  LucideIcon,
  Clock,
  FileText
} from 'lucide-react';

// Interfaces para tipagem
interface StatCard {
  title: string;
  value: string;
  change: number;
  icon: LucideIcon;
  color: string;
}

// Interface local baseada na resposta do admin.controller.js
interface DashboardData {
  users: { total: number; newToday: number };
  problems: { active: number; newToday: number };
  solutions: { total: number; newToday: number };
  platform: { acceptanceRate: number };
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingLists, setIsLoadingLists] = useState(true);
  const [recentProblems, setRecentProblems] = useState<Problem[]>([]);
  const [pendingSolutions, setPendingSolutions] = useState<Solution[]>([]);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setIsLoading(true);
        const response = await adminService.getDashboardStats();
        if (response.success) {
          setStats(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch admin stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchLists = async () => {
      try {
        setIsLoadingLists(true);
        const [problemsRes, solutionsRes] = await Promise.all([
          problemsService.getAll({ limit: 3, sortBy: 'createdAt', sortOrder: 'desc' }),
          solutionsService.getAll({ status: 'PENDING_REVIEW', limit: 5 })
        ]);

        if (problemsRes.success) {
          setRecentProblems(problemsRes.data.data || []);
        }
        if (solutionsRes.success) {
          setPendingSolutions(solutionsRes.data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch admin lists:", error);
      } finally {
        setIsLoadingLists(false);
      }
    };

    fetchAdminStats();
    fetchLists();
  }, []);

  const statCards: StatCard[] = stats ? [
    {
      title: "Total de Utilizadores",
      value: (stats.users?.total || 0).toString(),
      change: stats.users?.newToday ?? 0,
      icon: Users,
      color: "blue"
    },
    {
      title: "Desafios Ativos",
      value: (stats.problems?.active || 0).toString(),
      change: stats.problems?.newToday ?? 0,
      icon: Target,
      color: "green"
    },
    {
      title: "Soluções Submetidas",
      value: (stats.solutions?.total || 0).toString(),
      change: stats.solutions?.newToday ?? 0,
      icon: CheckCircle,
      color: "teal"
    },
    {
      title: "Taxa de Aceitação",
      value: `${(stats.platform?.acceptanceRate ?? 0).toFixed(1)}%`,
      change: 0,
      icon: TrendingUp,
      color: "orange"
    }
  ] : [
    // Fallback data using general context if full stats are not available
    { title: "Total de Utilizadores", value: isLoading ? "..." : "0", change: 0, icon: Users, color: "blue" },
    { title: "Desafios Ativos", value: isLoading ? "..." : "0", change: 0, icon: Target, color: "green" },
    { title: "Soluções Submetidas", value: isLoading ? "..." : "0", change: 0, icon: CheckCircle, color: "teal" },
    { title: "Taxa de Aceitação", value: isLoading ? "..." : "0%", change: 0, icon: TrendingUp, color: "orange" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
                Painel Administrativo
              </h1>
              <p className="text-lg text-gray-600">
                Monitorize e gerencie a plataforma SolveEdu
              </p>
            </div>
            <div className="flex space-x-3 mt-4 lg:mt-0">
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:border-gray-400 transition-colors">
                <BarChart3 size={20} />
                <span>Relatórios</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:border-gray-400 transition-colors">
                <Settings size={20} />
              </button>
            </div>
          </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map((stat, index) => (
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
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link to="/admin/users" className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 text-left group">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Gerir Utilizadores</h3>
                  <p className="text-gray-600 text-sm">Ver e gerir todos os utilizadores da plataforma</p>
                </Link>

                <Link to="/admin/content" className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 text-left group">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                    <Target className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Moderar Conteúdo</h3>
                  <p className="text-gray-600 text-sm">Rever desafios e soluções submetidas</p>
                </Link>

                <Link to="/admin/analytics" className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 text-left group">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Analytics</h3>
                  <p className="text-gray-600 text-sm">Estatísticas e métricas da plataforma</p>
                </Link>
              </div>
            </motion.div>

            {/* Recent Problems */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Desafios Recentes</h2>
                  <Link to="/problems" className="text-sm font-medium text-solve-blue hover:text-solve-purple">Ver todos</Link>
                </div>
                <div className="p-6">
                  {recentProblems && recentProblems.length > 0 ? (
                    <div className="space-y-4">
                      {recentProblems.map(problem => (
                        <div key={problem.id} className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Target className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-900 font-medium truncate">{problem.title}</p>
                            <p className="text-gray-500 text-sm">
                              {typeof problem.company === 'string' ? problem.company : problem.company?.companyName}
                            </p>
                          </div>
                          <Link to={`/problems/${problem.id}`} className="text-gray-400 hover:text-gray-600">
                            <Eye size={18} />
                          </Link>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">Nenhum desafio publicado recentemente.</p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* System Status */}
            <motion.div
              {...({ className: "bg-white rounded-2xl p-6 shadow-lg border border-gray-200" } as any)}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              {/* Nota: Os dados de 'Estado do Sistema' são estáticos. Requer um endpoint de health-check no backend. */}
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado do Sistema</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Servidor API</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    Online
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Base de Dados</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    Online
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Armazenamento</span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                    78% usado
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Último Backup</span>
                  <span className="text-gray-500 text-sm">Há 2 horas</span>
                </div>
              </div>
            </motion.div>

            {/* Pending Moderation */}
            <motion.div
              {...({ className: "bg-white rounded-2xl p-6 shadow-lg border border-orange-200" } as any)}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              <h3 className="text-lg font-semibold text-orange-800 mb-4">Moderação Pendente</h3>
              
              {pendingSolutions && pendingSolutions.length > 0 ? (
                <>
                  <div className="space-y-4">
                    {pendingSolutions.slice(0, 2).map(solution => (
                      <div key={solution.id} className="flex items-start space-x-3">
                        <FileText className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-800 text-sm">{solution.title}</p>
                          <p className="text-xs text-gray-500">
                            por {typeof solution.student === 'string' ? solution.student : solution.student?.user?.name}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {pendingSolutions.length > 2 && (
                    <p className="text-xs text-gray-500 mt-3">+ {pendingSolutions.length - 2} mais...</p>
                  )}
                  <Link
                    to="/admin/content"
                    className="w-full block text-center mt-4 bg-orange-500 text-white py-2 rounded-xl font-medium hover:bg-orange-600 transition-colors"
                  >
                    Rever {pendingSolutions.length} Itens
                  </Link>
                </>
              ) : (
                <div className="text-center py-4">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Nenhum item pendente de moderação.</p>
                </div>
              )}
            </motion.div>

            {/* Platform Metrics */}
            <motion.div
              {...({ className: "bg-gradient-to-r from-solve-blue to-solve-purple rounded-2xl p-6 text-white" } as any)}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.4 }}
            >
              {/* Nota: Métricas de plataforma são estáticas para demonstração. */}
              <h3 className="text-lg font-semibold mb-4">Métricas da Plataforma</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Taxa de Crescimento</span>
                    <span>+28%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="bg-white h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Engajamento</span>
                    <span>64%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="bg-white h-2 rounded-full" style={{ width: '64%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Satisfação</span>
                    <span>4.6/5</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="bg-white h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Security */}
            <motion.div
              {...({ className: "bg-white rounded-2xl p-6 shadow-lg border border-gray-200" } as any)}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.6 }}
            >
              {/* Nota: Secção de segurança é estática para demonstração. */}
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Segurança</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Autenticação</span>
                  <Shield className="w-4 h-4 text-green-600" />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">SSL/TLS</span>
                  <Shield className="w-4 h-4 text-green-600" />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Firewall</span>
                  <Shield className="w-4 h-4 text-green-600" />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Backups</span>
                  <Shield className="w-4 h-4 text-green-600" />
                </div>
              </div>
              
              <button className="w-full mt-4 bg-gray-900 text-white py-2 rounded-xl font-medium hover:bg-gray-800 transition-colors">
                Ver Logs de Segurança
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;