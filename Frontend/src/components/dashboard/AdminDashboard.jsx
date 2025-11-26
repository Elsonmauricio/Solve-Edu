import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import StatsCard from '../ui/StatsCard';
import { 
  Users, 
  Target, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  Eye,
  Settings,
  Shield,
  BarChart3
} from 'lucide-react';

const AdminDashboard = () => {
  const { problems, solutions } = useApp();

  const adminStats = [
    {
      title: "Total de Utilizadores",
      value: "1,247",
      change: 8,
      icon: Users,
      color: "blue"
    },
    {
      title: "Desafios Ativos",
      value: "127",
      change: 12,
      icon: Target,
      color: "green"
    },
    {
      title: "Soluções Submetidas",
      value: "89",
      change: 15,
      icon: CheckCircle,
      color: "teal"
    },
    {
      title: "Problemas Reportados",
      value: "3",
      change: -2,
      icon: AlertTriangle,
      color: "orange"
    }
  ];

  const recentActivity = [
    {
      type: "user",
      message: "Novo estudante registado: Maria Santos",
      time: "Há 2 horas",
      color: "blue"
    },
    {
      type: "problem", 
      message: "Novo desafio publicado: Sistema de IoT",
      time: "Há 5 horas",
      color: "green"
    },
    {
      type: "solution",
      message: "Solução submetida para App Mobile",
      time: "Há 1 dia", 
      color: "teal"
    },
    {
      type: "report",
      message: "Problema reportado em comentário",
      time: "Há 2 dias",
      color: "orange"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
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
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Stats Grid */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {adminStats.map((stat, index) => (
                <StatsCard
                  key={stat.title}
                  title={stat.title}
                  value={stat.value}
                  change={stat.change}
                  icon={stat.icon}
                  color={stat.color}
                  delay={index * 0.1}
                />
              ))}
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <button className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 text-left group">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Gerir Utilizadores</h3>
                <p className="text-gray-600 text-sm">Ver e gerir todos os utilizadores da plataforma</p>
              </button>

              <button className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 text-left group">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Moderar Conteúdo</h3>
                <p className="text-gray-600 text-sm">Rever desafios e soluções submetidas</p>
              </button>

              <button className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 text-left group">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Analytics</h3>
                <p className="text-gray-600 text-sm">Estatísticas e métricas da plataforma</p>
              </button>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              className="bg-white rounded-2xl shadow-lg border border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Atividade Recente</h2>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-4 p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
                    >
                      <div className={`w-10 h-10 bg-${activity.color}-100 rounded-xl flex items-center justify-center flex-shrink-0`}>
                        {activity.type === 'user' && <Users className={`w-5 h-5 text-${activity.color}-600`} />}
                        {activity.type === 'problem' && <Target className={`w-5 h-5 text-${activity.color}-600`} />}
                        {activity.type === 'solution' && <CheckCircle className={`w-5 h-5 text-${activity.color}-600`} />}
                        {activity.type === 'report' && <AlertTriangle className={`w-5 h-5 text-${activity.color}-600`} />}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900 font-medium">{activity.message}</p>
                        <p className="text-gray-500 text-sm">{activity.time}</p>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600 transition-colors">
                        <Eye size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* System Status */}
            <motion.div
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
            >
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

            {/* Alerts */}
            <motion.div
              className="bg-white rounded-2xl p-6 shadow-lg border border-red-200"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              <h3 className="text-lg font-semibold text-red-800 mb-4">🚨 Alertas do Sistema</h3>
              
              <div className="space-y-3 text-sm">
                <div className="text-red-700">
                  • 3 desafios expiram em 24 horas
                </div>
                <div className="text-red-700">
                  • 2 utilizadores reportaram problemas
                </div>
                <div className="text-red-700">
                  • 1 empresa pendente de aprovação
                </div>
              </div>
              
              <button className="w-full mt-4 bg-red-600 text-white py-2 rounded-xl font-medium hover:bg-red-700 transition-colors">
                Resolver Alertas
              </button>
            </motion.div>

            {/* Platform Metrics */}
            <motion.div
              className="bg-gradient-to-r from-solve-blue to-solve-purple rounded-2xl p-6 text-white"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.4 }}
            >
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
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.6 }}
            >
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