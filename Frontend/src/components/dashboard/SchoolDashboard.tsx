import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { useApp } from '../../context/AppContext';
import StatsCard from '../ui/StatsCard';
import { schoolService } from '../../services/school.service';
import { notificationService } from '../../services/notification.service';
import SchoolSolutionsList from '../layout/SchoolSolutionsList'; // Importar o novo componente
import CertificateDocument from '../pdf/CertificateDocument'; // Importar o componente do PDF
import UserBadge from '../ui/UserBadge';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
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
  Search,
  X,
  Download
} from 'lucide-react';

const SchoolDashboard = () => {
  const { user } = useApp();
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeProjects: 0,
    completedPaps: 0,
    averageGrade: 0,
    acceptanceRate: 0,
    newStudentsToday: 0
  });
  const [students, setStudents] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const response = await schoolService.getDashboardStats();
        if (response.success) {
          setStats({
            totalStudents: response.data.totalStudents || 0,
            activeProjects: response.data.totalSolutions || 0,
            completedPaps: response.data.acceptedSolutions || 0,
            averageGrade: response.data.averageGrade || 0,
            acceptanceRate: response.data.acceptanceRate || 0,
            newStudentsToday: response.data.newStudentsToday || 0
          });
        }
      } catch (error) {
        console.error("Failed to fetch school stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchStudents = async () => {
      try {
        const response = await schoolService.getStudents();
        if (response.success) {
          setStudents(response.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch students:", error);
      }
    };

    const fetchNotifications = async () => {
      try {
        const response = await notificationService.getMyNotifications();
        if (response.success) {
          setNotifications(response.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    fetchStats();
    fetchStudents();
    fetchNotifications();
  }, [user]);

  const handleRegisterStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error('Por favor, preencha todos os campos.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await schoolService.registerStudent(formData);
      if (response.success) {
        toast.success(response.message || 'Aluno registado com sucesso!');
        setIsModalOpen(false);
        setFormData({ name: '', email: '' });
        // Aqui poderias recarregar as estatísticas se quisesses
      } else {
        toast.error(response.message || 'Erro ao registar aluno.');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao conectar com o servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportGrades = async () => {
    try {
      const response = await api.get('/solutions/export/grades', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `relatorio_turma_${new Date().getFullYear()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      toast.error('Erro ao gerar o relatório da turma.');
    }
  };

  // Filtrar alunos com base na pesquisa
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        value: isLoading ? '...' : (stats.totalStudents || 0).toString(),
        change: stats.newStudentsToday || 0,
        icon: Users,
        color: "blue"
      },
      {
        title: "PAPs em Curso",
        value: isLoading ? '...' : (stats.activeProjects || 0).toString(),
        change: 0, // Backend não fornece esta métrica de "hoje" ainda
        icon: BookOpen,
        color: "orange"
      },
      {
        title: "Projetos Concluídos",
        value: isLoading ? '...' : (stats.completedPaps || 0).toString(),
        change: 0, // Backend não fornece esta métrica de "hoje" ainda
        icon: GraduationCap,
        color: "green"
      },
      {
        title: "Média das Notas",
        value: isLoading ? '...' : (stats.averageGrade || 0).toFixed(1) + "/20",
        change: 0, // 'Change' não se aplica a uma média da mesma forma
        icon: Award,
        color: "purple"
      }
    ]
  };

  // Calcular métricas adicionais para o gráfico de barras
  const studentsWithProjectPercentage = stats.totalStudents > 0 ? (stats.activeProjects / stats.totalStudents) * 100 : 0;

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
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-solve-blue text-white px-6 py-3 rounded-xl font-semibold hover:bg-solve-purple transition-all duration-200 flex items-center space-x-2 shadow-lg shadow-blue-200"
              >
                <Plus size={20} />
                <span>Registar Aluno</span>
              </button>

              <Link to="/settings" className="flex items-center space-x-2 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:border-gray-400 transition-colors bg-white">
                <Settings size={20} />
              </Link>
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

            {/* Lista de Soluções para Validação de PAP */}
            <SchoolSolutionsList />

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
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Pesquisar aluno..." 
                    className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-solve-blue focus:border-transparent outline-none"
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.slice(0, 5).map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <img 
                          src={student.avatar || `https://ui-avatars.com/api/?name=${student.name}`} 
                          alt={student.name}
                          className="w-10 h-10 rounded-full object-cover bg-gray-200"
                        />
                        <div>
                          <h4 className="font-semibold text-gray-900">{student.name}</h4>
                          <p className="text-sm text-gray-500">
                            {student.course || 'Curso não definido'} • {student.year ? `${student.year}º Ano` : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <PDFDownloadLink
                          document={
                            <CertificateDocument
                              studentName={student.name}
                              courseName={student.course || 'Programação de Informática'}
                              schoolName={schoolStats.user.schoolName}
                              startDate="2023/2024" // Exemplo - idealmente viria do perfil do aluno
                              endDate="2025/2026"
                              city="Portugal" // Default dinâmico
                              currentDate={new Date().toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}
                              studentEmail={student.email}
                              studentPhone={student.phone || '+351000000000'} // Exemplo - adicionar campo no perfil
                            />
                          }
                          fileName={`Certificado_${student.name.replace(/\s/g, '_')}.pdf`}
                          className="inline-flex items-center space-x-2 px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-solve-teal hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-solve-teal"
                        >
                          <Download size={14} />
                          <span>Certificado</span>
                        </PDFDownloadLink>
                      </div>
                    </div>
                  ))
                  ) : (
                    <p className="text-center text-gray-500 py-4">Nenhum aluno encontrado.</p>
                  )}
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
              <div 
                onClick={handleExportGrades}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 group cursor-pointer"
              >
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
                {/* Taxa de Conclusão: Projetos Aceites / Projetos Totais */}
                {/* Se o backend não calcular, calculamos aqui em tempo real */}
                {(() => {
                  const realAcceptanceRate = stats.activeProjects > 0 ? (stats.completedPaps / stats.activeProjects) * 100 : 0;
                  return (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Taxa de Conclusão</span>
                        <span className="font-semibold text-gray-900">{stats.acceptanceRate.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min(stats.acceptanceRate, 100)}%` }}></div>
                      </div>
                    </div>
                  );
                })()}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Alunos com Projeto</span>
                    <span className="font-semibold text-gray-900">{studentsWithProjectPercentage.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min(studentsWithProjectPercentage, 100)}%` }}></div>
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
                {notifications.length > 0 ? (
                  notifications.slice(0, 3).map((notif) => (
                    <div key={notif.id} className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="text-sm text-blue-800 font-medium">{notif.title}</p>
                      <p className="text-xs text-blue-600 mt-1">{notif.message}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-center">
                    <p className="text-sm text-gray-500">Sem novos avisos.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Modal de Registo de Aluno */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            {...({ className:"bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"} as any)}
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Registar Novo Aluno</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleRegisterStudent} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-solve-blue focus:border-transparent outline-none transition-all"
                  placeholder="Ex: Maria Santos"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email do Aluno</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-solve-blue focus:border-transparent outline-none transition-all"
                  placeholder="aluno@exemplo.com"
                />
              </div>
              <div className="pt-4 flex space-x-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-solve-blue text-white rounded-xl hover:bg-solve-purple font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'A Registar...' : 'Confirmar Registo'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SchoolDashboard;
