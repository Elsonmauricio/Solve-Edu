import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import StatsCard from '../ui/StatsCard';
import UserBadge from '../ui/UserBadge';
import { problemsService } from '../../services/problems.service';
import { solutionsService } from '../../services/solution.service';
import { companyService } from '../../services/company.service';
import { notificationService } from '../../services/notification.service';
import CompanySolutions from '../layout/CompanySolutions'; // Importar o novo componente
import ProblemCard from '../ui/ProblemCard';
import NotificationsDropdown from '../layout/NotificationsDropdown';
import { Problem, Solution } from '../../types';
import { 
  Target, 
  Users, 
  Star,
  Plus,
  Eye,
  Bell,
  CheckCircle,
  Settings,
} from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: any;
}

const CompanyDashboard = () => {
  const { user } = useApp();
  const [stats, setStats] = useState({
    activeProblems: 0,
    totalSolutions: 0,
    acceptedSolutions: 0,
    acceptanceRate: 0,
    averageSolutionRating: 0,
    expiredProblems: 0,
    newProblemsToday: 0,
    newSolutionsToday: 0,
    newlyAcceptedSolutionsToday: 0,
    expiredRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [myProblems, setMyProblems] = useState<Problem[]>([]);
  const [recentSolutions, setRecentSolutions] = useState<Solution[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.companyProfile?.id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Executar todas as chamadas de API em paralelo para um carregamento mais rápido
        const [statsRes, problemsRes, solutionsRes, notificationsRes] = await Promise.all([
          companyService.getDashboardStats(),
          problemsService.getAll({ limit: 4, sortBy: 'createdAt', sortOrder: 'desc' }),
          solutionsService.getAll({
            companyId: user.companyProfile.id,
            limit: 5,
            sortBy: 'submittedAt',
            sortOrder: 'desc'
          }),
          notificationService.getMyNotifications()
        ]);

        // Processar e definir os estados com os dados recebidos
        if (statsRes.success) {
          setStats(statsRes.data);
        }
        if (problemsRes.success) {
          setMyProblems(problemsRes.data.data || []);
        }
        if (solutionsRes.success) {
          setRecentSolutions(solutionsRes.data.data || []);
        }
        if (notificationsRes.success) {
          setNotifications(notificationsRes.data);
        }

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        // Poderia adicionar um toast de erro aqui
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // Gerar atividades recentes combinando problemas e candidaturas
  const recentActivity = [
    ...myProblems.map(p => ({
      id: p.id,
      type: 'PROBLEM',
      title: p.title,
      date: p.createdAt,
      desc: 'Novo desafio publicado'
    })),
    ...recentSolutions.map(s => ({
      id: s.id,
      type: 'SOLUTION',
      title: s.title,
      date: s.submittedAt,
      desc: `Nova candidatura de ${(s.student as any)?.user?.name || 'um estudante'}`
    })),
  ]
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  .slice(0, 5);


  const companyStats = {
    user: {
      id: user?.id || "unknown",
      name: user?.name || "Empresa",
      email: user?.email || "",
      role: user?.role || "COMPANY",
      avatar: user?.avatar,
      companyName: user?.companyProfile?.companyName || user?.name || "Empresa",
      level: (user as any)?.level || "Parceiro",
      isVerified: user?.isVerified,
      createdAt: user?.createdAt || new Date().toISOString(),
      updatedAt: user?.updatedAt || new Date().toISOString(),
      problemsPosted: stats.activeProblems,
      solutionsAccepted: stats.acceptedSolutions,
    } as any,
    stats: [
      {
        title: "Desafios Publicados",
        value: isLoading ? '...' : (stats.activeProblems || 0).toString(),
        change: stats.newProblemsToday || 0,
        icon: Target,
        color: "blue"
      },
      {
        title: "Candidaturas Recebidas",
        value: isLoading ? '...' : (stats.totalSolutions || 0).toString(),
        change: stats.newSolutionsToday || 0,
        icon: Users,
        color: "green"
      },
      {
        title: "Soluções Aceites",
        value: isLoading ? '...' : (stats.acceptedSolutions || 0).toString(),
        change: stats.newlyAcceptedSolutionsToday || 0,
        icon: CheckCircle,
        color: "teal"
      },
      {
        title: "Avaliação Média",
        value: isLoading ? '...' : (stats.averageSolutionRating || 0).toFixed(1),
        change: 0, // 'Change' não se aplica a uma média da mesma forma
        icon: Star,
        color: "purple"
      }
    ]
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleToggleNotifications = async () => {
    setIsNotificationsOpen(prev => !prev);
    if (!isNotificationsOpen && unreadCount > 0) {
      // Marcar como lidas no backend
      await notificationService.markAsRead();
      // Atualizar UI
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          {...({ className: "mb-8" } as any)}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
                Dashboard da Empresa
              </h1>
              <p className="text-lg text-gray-600">
                Gerencie os seus desafios e acompanhe as candidaturas
              </p>
            </div>
            <div className="flex space-x-3 mt-4 lg:mt-0">
              <Link
                to="/create-problem"
                className="bg-gradient-to-r from-solve-blue to-solve-purple text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
              >
                <Plus size={20} />
                <span>Novo Desafio</span>
              </Link>
              <Link
                to="/settings"
                className="flex items-center space-x-2 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:border-gray-400 transition-colors bg-white"
                title="Configurações do Perfil"
              >
                <Settings size={20} />
              </Link>
              <div className="relative">
                <button 
                  onClick={handleToggleNotifications}
                  className="flex items-center space-x-2 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:border-gray-400 transition-colors bg-white"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                  )}
                </button>
                <NotificationsDropdown notifications={notifications} isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
              </div>
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
              {companyStats.stats.map((stat, index) => (
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

            {/* Tabela de Soluções da Empresa */}
            <motion.div
              {...({ className: "bg-white rounded-2xl shadow-lg border border-gray-200" } as any)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <CompanySolutions />
            </motion.div>

            {/* My Problems */}
            <motion.div
              {...({ className: "bg-white rounded-2xl shadow-lg border border-gray-200" } as any)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Os Meus Desafios</h2>
                  <Link
                    to="/problems"
                    className="text-solve-blue hover:text-solve-purple font-medium"
                  >
                    Ver todos
                  </Link>
                </div>
              </div>
              
              <div className="p-6">
                {myProblems && myProblems.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myProblems.slice(0, 4).map((problem, index) => (
                      <ProblemCard key={problem.id} problem={problem} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Ainda não publicou desafios
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Comece por publicar o seu primeiro desafio para a comunidade.
                    </p>
                    <Link
                      to="/create-problem"
                      className="bg-solve-blue text-white px-6 py-3 rounded-xl font-medium hover:bg-solve-purple transition-colors"
                    >
                      Criar Primeiro Desafio
                    </Link>
                  </div>
                )}
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
              <UserBadge user={companyStats.user} showStats={true} />
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              {...({ className: "bg-white rounded-2xl p-6 shadow-lg border border-gray-200" } as any)}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
              
              <div className="space-y-3">
                <Link
                  to="/create-problem"
                  className="flex items-center space-x-3 p-3 border border-gray-200 rounded-xl hover:border-solve-blue hover:bg-blue-50 transition-colors group"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Plus className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-gray-700 group-hover:text-solve-blue font-medium">
                    Novo Desafio
                  </span>
                </Link>
                
                <Link
                  to="/solutions"
                  className="flex items-center space-x-3 p-3 border border-gray-200 rounded-xl hover:border-solve-teal hover:bg-teal-50 transition-colors group"
                >
                  <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                    <Eye className="w-4 h-4 text-teal-600" />
                  </div>
                  <span className="text-gray-700 group-hover:text-solve-teal font-medium">
                    Ver Candidaturas
                  </span>
                </Link>
                
                <Link
                  to="/company/team"
                  className="flex items-center space-x-3 p-3 border border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-colors group w-full text-left"
                >
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-gray-700 group-hover:text-purple-600 font-medium">Gerir Equipa</span>
                </Link>
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              {...({ className: "bg-white rounded-2xl p-6 shadow-lg border border-gray-200" } as any)}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.4 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividade Recente</h3>
              
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, idx) => (
                    <div key={activity.id} className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activity.type === 'PROBLEM' ? 'bg-blue-100' : 'bg-orange-100'}`}>
                        {activity.type === 'PROBLEM' ? (
                          <Plus className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Users className="w-4 h-4 text-orange-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-700">{activity.desc}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[200px]">{activity.title}</p>
                        <p className="text-[10px] text-gray-400">{new Date(activity.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">Sem atividade recente.</p>
                )}
              </div>
            </motion.div>

            {/* Performance Metrics */}
            <motion.div
              {...({ className: "bg-gradient-to-r from-solve-teal to-solve-blue rounded-2xl p-6 text-white" } as any)}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.6 }}
            >
              <h3 className="text-lg font-semibold mb-4">Métricas de Performance</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Taxa de Aceitação</span>
                    <span>{stats.acceptanceRate.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="bg-white h-2 rounded-full" style={{ width: `${Math.min(stats.acceptanceRate, 100)}%` }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Desafios Expirados</span>
                    <span>{stats.expiredProblems}</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="bg-white h-2 rounded-full" style={{ width: `${stats.expiredRate.toFixed(0)}%` }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Satisfação dos Estudantes</span>
                    <span>{stats.averageSolutionRating.toFixed(1)}/5</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="bg-white h-2 rounded-full" style={{ width: `${(stats.averageSolutionRating / 5) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;