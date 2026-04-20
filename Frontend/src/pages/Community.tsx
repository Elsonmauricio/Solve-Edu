import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import UserBadge from '../components/ui/UserBadge';
import { 
  Users, 
  MessageCircle, 
  TrendingUp, 
  Award,
  Calendar,
  Zap
} from 'lucide-react';
import { User } from '../types';
import StartChatButton from '../components/chat/StartChatButton';
import { useApiFetch } from '../hooks/useApiFetch';
import { useApp } from '../context/AppContext';

// Interfaces para tipar as respostas da API e evitar erros de "unknown"
interface StatsResponse {
  success: boolean;
  data: {
    accepted: number;
    totalCompanies: number;
    totalStudents: number;
    totalComments: number;
  };
}

interface TopSolutionsResponse {
  success: boolean;
  data: any[];
}

const Community = () => {
  const [communityStats, setCommunityStats] = useState({
    activeMembers: 0,
    activeDiscussions: 0,
    acceptedSolutions: 0
  });
  const [featuredCompanies, setFeaturedCompanies] = useState<any[]>([]);
  const [topStudents, setTopStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useApp();
  const { authenticatedFetch } = useApiFetch(); // Importa e desestrutura o hook

  const getDashboardLink = () => {
    if (!user) return '/';
    const role = (user.role || 'STUDENT').toUpperCase();
    if (role === 'ADMIN') return '/admin-dashboard';
    if (role === 'COMPANY') return '/company-dashboard';
    if (role === 'SCHOOL') return '/school-dashboard';
    return '/student-dashboard';
  };

  useEffect(() => {
    const fetchCommunityData = async () => {
      try {
        // Usamos allSettled para que se uma rota der 404, as outras ainda carreguem
        const results = await Promise.allSettled([
          authenticatedFetch('/api/solutions/stats'),
          authenticatedFetch('/api/student/ranking'),
          authenticatedFetch('/api/company/featured').catch(() => ({ success: false, data: [] }))
        ]);

        // Atualizar Estatísticas
        const statsRes = results[0].status === 'fulfilled' ? results[0].value as StatsResponse : null;
        if (statsRes?.success && statsRes.data) {
          setCommunityStats({
            activeMembers: (statsRes.data.totalStudents || 0) + (statsRes.data.totalCompanies || 0),
            activeDiscussions: statsRes.data.totalComments || 0,
            acceptedSolutions: statsRes.data.accepted || 0
          });
        }

        // Atualizar Ranking de Estudantes
        const rankingRes = results[1].status === 'fulfilled' ? results[1].value : null;
        if (rankingRes?.success && rankingRes.data) {
          setTopStudents(rankingRes.data);
        }

        // Atualizar Empresas Destaque
        const companiesRes = results[2].status === 'fulfilled' ? results[2].value : null;
        if (companiesRes?.success && companiesRes.data) {
          setFeaturedCompanies(companiesRes.data);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching community data:", error);
        setLoading(false);
      }
    };

    // CHAMAR a função fetchCommunityData
    fetchCommunityData(); 
  }, [authenticatedFetch]); // Adicionado authenticatedFetch ao array de dependências

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
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
            Comunidade Solve Edu
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Conecte-se com outros estudantes, empresas e mentores. Partilhe conhecimento e cresça em conjunto.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Community Stats */}
            <motion.div
             {...({ className: "grid grid-cols-1 md:grid-cols-3 gap-6", } as any)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 text-center">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900">{communityStats.activeMembers}</div>
                <div className="text-gray-600">Membros Ativos</div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 text-center">
                <MessageCircle className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900">{communityStats.activeDiscussions}</div>
                <div className="text-gray-600">Discussões Ativas</div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 text-center">
                <Award className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900">{communityStats.acceptedSolutions}</div>
                <div className="text-gray-600">Soluções Aceites</div>
              </div>
            </motion.div>

            {/* Top Students */}
            <motion.div
             {...({ className: "bg-white rounded-2xl shadow-lg border border-gray-200" } as any)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    🏆 Top Estudantes
                  </h2>
                  <Link
                    to="/solutions"
                    className="text-solve-blue hover:text-solve-purple font-medium"
                  >
                    Ver ranking completo
                  </Link>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {loading ? (
                    <div className="text-center text-gray-500 py-4">A carregar...</div>
                  ) : topStudents.length > 0 ? (
                    topStudents.map((student, index) => (
                      <div key={student.id} className="flex items-center gap-2">
                        <div className="flex-1"><UserBadge user={student} showStats={true} /></div>
                        <StartChatButton targetUserId={student.id} label="" className="p-3 bg-gray-100 text-solve-blue rounded-full hover:bg-solve-blue hover:text-white transition-colors" />
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4">Não foi possível carregar o ranking de estudantes.</p>
                  )}
                </div>
              </div>
            </motion.div>

            
              </div>
            

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Top Companies */}
            <motion.div
             {...({ className: "bg-white rounded-2xl p-6 shadow-lg border border-gray-200" } as any)}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                🏢 Empresas Destaque
              </h3>
              
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center text-gray-500 py-4">A carregar...</div>
                ) : featuredCompanies.length > 0 ? (
                  featuredCompanies.map((company) => (
                    <div key={company.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                      <img 
                        src={company.avatar || "https://ui-avatars.com/api/?name=" + company.name} 
                        alt={company.name} 
                        className="w-10 h-10 rounded-lg object-cover border border-gray-100"
                      />
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{company.name}</h4>
                        <p className="text-xs text-gray-500">{company.activeChallenges} desafios ativos</p>
                      </div>
                      <div className="flex items-center text-solve-blue">
                        <TrendingUp size={14} />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">Sem empresas em destaque no momento.</p>
                )}
              </div>
            </motion.div>

            {/* Community Guidelines */}
            <motion.div
             {...({ className: "bg-white rounded-2xl p-6 shadow-lg border border-gray-200" } as any)}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              <h3 className="text-lg font-semibold mb-4">📋 Diretrizes da Comunidade</h3>
              
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <Zap size={16} />
                  <span>Seja respeitoso e construtivo</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Zap size={16} />
                  <span>Partilhe conhecimento livremente</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Zap size={16} />
                  <span>Dê crédito onde é devido</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Zap size={16} />
                  <span>Reporte comportamentos inadequados</span>
                </li>
              </ul>
              
              <Link 
                to="/terms" 
                className="block w-full mt-4 bg-white text-solve-blue py-2 rounded-xl font-semibold hover:bg-gray-100 transition-colors text-center border border-solve-blue/20"
              >
                Ler Regras Completas
              </Link>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
             {...({ className: "bg-white rounded-2xl p-6 shadow-lg border border-gray-200" } as any)}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.4 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
              
              <div className="space-y-3">
                <Link to="/contact" className="w-full flex items-center space-x-3 p-3 border border-gray-200 rounded-xl hover:border-solve-blue hover:bg-blue-50 transition-colors">
                  <MessageCircle className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-700">Iniciar Discussão</span>
                </Link>
                
                <Link to="/mentorship" className="w-full flex items-center space-x-3 p-3 border border-gray-200 rounded-xl hover:border-solve-green hover:bg-green-50 transition-colors">
                  <Users className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-700">Encontrar Mentores</span>
                </Link>
                
                <Link to={getDashboardLink()} className="w-full flex items-center space-x-3 p-3 border border-gray-200 rounded-xl hover:border-solve-purple hover:bg-purple-50 transition-colors">
                  <TrendingUp className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-700">Ver Estatísticas</span>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;