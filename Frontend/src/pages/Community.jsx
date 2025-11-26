import React from 'react';
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
  Calendar,
  MapPin
} from 'lucide-react';

const Community = () => {
  const topStudents = [
    {
      name: "Maria Santos",
      role: "Estudante",
      school: "Universidade do Porto",
      level: "Expert",
      isVerified: true,
      solutionsCount: 15,
      rating: 4.9
    },
    {
      name: "João Silva", 
      role: "Estudante",
      school: "Instituto Superior Técnico",
      level: "Avançado",
      isVerified: true,
      solutionsCount: 12,
      rating: 4.8
    },
    {
      name: "Ana Costa",
      role: "Estudante", 
      school: "Universidade de Coimbra",
      level: "Avançado",
      isVerified: true,
      solutionsCount: 10,
      rating: 4.7
    }
  ];

  const topCompanies = [
    {
      name: "TechRetail Lda",
      role: "Empresa",
      company: "TechRetail Lda", 
      level: "Parceiro Platinum",
      isVerified: true,
      problemsPosted: 25,
      solutionsAccepted: 18
    },
    {
      name: "EcoSolutions SA",
      role: "Empresa",
      company: "EcoSolutions SA",
      level: "Parceiro Ouro", 
      isVerified: true,
      problemsPosted: 18,
      solutionsAccepted: 12
    },
    {
      name: "HealthInnovate",
      role: "Empresa",
      company: "HealthInnovate",
      level: "Parceiro Ouro",
      isVerified: true,
      problemsPosted: 15, 
      solutionsAccepted: 10
    }
  ];

  const events = [
    {
      title: "Workshop: Machine Learning para Iniciantes",
      date: "15 Jan 2024",
      time: "14:00 - 17:00",
      location: "Online",
      type: "workshop",
      attendees: 45
    },
    {
      title: "Demo Day: Apresentação de Soluções",
      date: "22 Jan 2024", 
      time: "10:00 - 13:00",
      location: "Lisboa",
      type: "event",
      attendees: 32
    },
    {
      title: "Mentoria 1:1 com Empresas Parceiras",
      date: "30 Jan 2024",
      time: "09:00 - 18:00", 
      location: "Porto",
      type: "mentoring",
      attendees: 28
    }
  ];

  const forumTopics = [
    {
      title: "Como estruturar uma boa documentação de projeto?",
      author: "Maria Santos",
      replies: 24,
      views: 156,
      lastActivity: "Há 2 horas"
    },
    {
      title: "Dúvidas sobre integração com APIs REST",
      author: "João Silva", 
      replies: 18,
      views: 89,
      lastActivity: "Há 5 horas"
    },
    {
      title: "Melhores práticas para desenvolvimento mobile",
      author: "Ana Costa",
      replies: 31,
      views: 203,
      lastActivity: "Há 1 dia"
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
                <div className="text-2xl font-bold text-gray-900">2,847</div>
                <div className="text-gray-600">Membros Ativos</div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 text-center">
                <MessageCircle className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900">156</div>
                <div className="text-gray-600">Discussões Ativas</div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 text-center">
                <Award className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900">89</div>
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
                  {topStudents.map((student, index) => (
                    <UserBadge key={student.name} user={student} showStats={true} />
                  ))}
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
                <div className="space-y-6">
                  {forumTopics.map((topic, index) => (
                    <div
                      key={topic.title}
                      className="flex items-start space-x-4 p-4 border border-gray-200 rounded-xl hover:border-solve-blue transition-colors cursor-pointer"
                    >
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <MessageCircle className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {topic.title}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>Por {topic.author}</span>
                          <span>{topic.replies} respostas</span>
                          <span>{topic.views} visualizações</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {topic.lastActivity}
                      </div>
                    </div>
                  ))}
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
                {topCompanies.map((company, index) => (
                  <UserBadge key={company.name} user={company} showStats={true} />
                ))}
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
                {events.map((event, index) => (
                  <div
                    key={event.title}
                    className="p-4 border border-gray-200 rounded-xl hover:border-solve-blue transition-colors"
                  >
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {event.title}
                    </h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>{event.date} • {event.time}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4" />
                        <span>{event.attendees} participantes</span>
                      </div>
                    </div>
                    <button className="w-full mt-3 bg-solve-blue text-white py-2 rounded-lg font-medium hover:bg-solve-purple transition-colors">
                      Inscrever-me
                    </button>
                  </div>
                ))}
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