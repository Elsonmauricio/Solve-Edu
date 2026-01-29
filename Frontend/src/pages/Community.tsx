import React, { useState, useEffect } from 'react';
import { solutionsService } from '../services/solution.service';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import UserBadge from '../components/ui/UserBadge';
import { 
  Users, 
  MessageCircle, 
  TrendingUp, 
  Award,
  Star,
  Zap,
  //Zap,
  Calendar,
  MapPin
} from 'lucide-react';
import { User, Solution } from '../types';

const Community = () => {
  const [communityStats, setCommunityStats] = useState({
    activeMembers: 2847,
    activeDiscussions: 156,
    acceptedSolutions: 0
  });
  const [topStudents, setTopStudents] = useState<User[]>([]);
  const [topCompanies, setTopCompanies] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommunityData = async () => {
      try {
        const [statsRes, topSolutionsRes] = await Promise.all([
          solutionsService.getStats(),
          solutionsService.getTopSolutions()
        ]);

        if (statsRes.success) {
          setCommunityStats(prev => ({
            ...prev,
            acceptedSolutions: statsRes.data.accepted
          }));
        }

        if (topSolutionsRes.success) {
          // Tipagem mais segura para o retorno da API
          const students: User[] = topSolutionsRes.data
            .filter((solution: any) => solution.student?.user)
            .map((solution: any) => {
              const studentData = solution.student;
              const userData = studentData.user;
              
              return {
                id: userData?.id || studentData?.id || "unknown",
                name: userData?.name || "Utilizador Desconhecido",
                avatar: userData?.avatar,
                role: "Estudante",
                school: studentData.school || "Escola não informada",
                level: "Nível " + (studentData.year || 1),
                isVerified: true,
                solutionsCount: (solution as any)._count?.solutions || 1, // Tenta ler contagem agregada do Prisma se existir
                rating: solution.rating || 0
              };
            });
          setTopStudents(students);
        } 
        setLoading(false);
      };

      fetchCommunityData();
    };
  }, []);

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
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
            Comunidade SolveEdu
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
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
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
              className="bg-white rounded-2xl shadow-lg border border-gray-200"
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
                  ) : (
                    topStudents.map((student, index) => (
                      <UserBadge key={student.name} user={student} showStats={true} />
                    ))
                  )}
                </div>
              </div>
            </motion.div>

            {/* Forum Topics */}
            <motion.div
              className="bg-white rounded-2xl shadow-lg border border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    💬 Tópicos do Fórum
                  </h2>
                  <button className="text-solve-blue hover:text-solve-purple font-medium">
                    Novo Tópico
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-700">Fórum em breve</h3>
                  <p>Estamos a trabalhar para trazer um espaço de discussão para a comunidade.</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Top Companies */}
            <motion.div
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
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
                ) : (
                  <p className="text-sm text-gray-500">Funcionalidade de ranking de empresas em desenvolvimento.</p>
                )}
              </div>
            </motion.div>

            {/* Upcoming Events */}
            <motion.div
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                📅 Próximos Eventos
              </h3>
              
              <div className="space-y-4">
                <div className="text-center py-4 text-gray-500">
                  <Calendar className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                  <h4 className="font-semibold text-gray-700">Nenhum evento agendado</h4>
                  <p className="text-sm">Fique atento para futuros workshops e meetups.</p>
                </div>
              </div>
            </motion.div>

            {/* Community Guidelines */}
            <motion.div
              className="bg-gradient-to-r from-solve-blue to-solve-purple rounded-2xl p-6 text-white"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              <h3 className="text-lg font-semibold mb-4">📋 Diretrizes da Comunidade</h3>
              
              <ul className="space-y-3 text-sm text-blue-100">
                <li className="flex items-center space-x-2">
                  <Zap className="w-4 h-4" />
                  <span>Seja respeitoso e construtivo</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Zap className="w-4 h-4" />
                  <span>Partilhe conhecimento livremente</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Zap className="w-4 h-4" />
                  <span>Dê crédito onde é devido</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Zap className="w-4 h-4" />
                  <span>Reporte comportamentos inadequados</span>
                </li>
              </ul>
              
              <button className="w-full mt-4 bg-white text-solve-blue py-2 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
                Ler Regras Completas
              </button>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.4 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
              
              <div className="space-y-3">
                <button className="w-full flex items-center space-x-3 p-3 border border-gray-200 rounded-xl hover:border-solve-blue hover:bg-blue-50 transition-colors">
                  <MessageCircle className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-700">Iniciar Discussão</span>
                </button>
                
                <button className="w-full flex items-center space-x-3 p-3 border border-gray-200 rounded-xl hover:border-solve-green hover:bg-green-50 transition-colors">
                  <Users className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-700">Encontrar Mentores</span>
                </button>
                
                <button className="w-full flex items-center space-x-3 p-3 border border-gray-200 rounded-xl hover:border-solve-purple hover:bg-purple-50 transition-colors">
                  <TrendingUp className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-700">Ver Estatísticas</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;