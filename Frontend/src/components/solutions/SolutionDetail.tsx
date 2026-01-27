import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { solutionsService } from '../../services/solution.service';
import { 
  ArrowLeft, 
  Github, 
  ExternalLink, 
  Calendar, 
  User, 
  School,
  Star,
  MessageCircle,
  ThumbsUp,
  Share2,
  Bookmark,
  Award,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader,
  LucideIcon
} from 'lucide-react';

// Interfaces para tipagem
interface Solution {
  id: number;
  title: string;
  description: string;
  student: string;
  school: string;
  submittedAt: string;
  status: string;
  technologies: string[];
  githubUrl?: string;
  problemId: number;
}

interface Problem {
  id: number;
  title: string;
  description: string;
}

const SolutionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const context = useApp();
  const solutions = (context.solutions || []) as Solution[];
  const problems = (context.problems || []) as Problem[];
  const [solutionDetail, setSolutionDetail] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const solution = solutions.find((s: Solution) => s.id === parseInt(id || '0'));
  const problem = solution ? problems.find((p: Problem) => p.id === solution.problemId) : null;

  // Carregar detalhes da solução da API quando o id mudar
  useEffect(() => {
    const loadSolutionDetail = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const response = await solutionsService.getById(parseInt(id));
        if (response.success) {
          setSolutionDetail(response.data);
        }
      } catch (error) {
        console.error('Erro ao carregar detalhe da solução:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSolutionDetail();
  }, [id]);

  // Usar dados carregados da API ou do contexto
  const displaySolution = solutionDetail || solution;

  // Calcular estatísticas reais do estudante
  const studentSolutions = solutions.filter(s => {
    const studentName = typeof displaySolution?.student === 'string' ? displaySolution.student : (displaySolution?.student as any)?.user?.name;
    if (typeof s.student === 'string') {
      return s.student === studentName;
    }
    return (s.student as any)?.user?.name === studentName;
  });
  const totalSubmissions = studentSolutions.length;
  const acceptedSubmissions = studentSolutions.filter(s => s.status === 'Aceite' || s.status === 'Accepted').length;
  const ratings = studentSolutions.map(s => (s as any).rating || 0).filter(r => r > 0);
  const averageRating = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : "N/A";

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Aceite':
      case 'ACCEPTED': return 'text-green-600 bg-green-100';
      case 'Em Análise':
      case 'PENDING_REVIEW': return 'text-yellow-600 bg-yellow-100';
      case 'Rejeitada':
      case 'REJECTED': return 'text-red-600 bg-red-100';
      case 'Revisão Solicitada':
      case 'NEEDS_REVISION': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size={40} className="animate-spin text-solve-blue" />
      </div>
    );
  }

  if (!displaySolution) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Solução não encontrada</h2>
          <p className="text-gray-600 mb-6">A solução que procura não existe ou foi removida.</p>
          <Link to="/solutions" className="bg-solve-blue text-white px-6 py-3 rounded-xl font-medium hover:bg-solve-purple transition-colors">
            Voltar às Soluções
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Navigation */}
      <div className="mb-6">
        <Link
          to="/solutions"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 font-medium"
        >
          <ArrowLeft size={20} />
          <span>Voltar às soluções</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 mb-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-solve-teal to-solve-blue rounded-xl flex items-center justify-center">
                    <Award className="text-white" size={24} />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl font-black text-gray-900 mb-2">
                      {solution!.title}
                    </h1>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <User size={16} className="text-gray-400" />
                        <span className="text-gray-600 font-medium">{solution!.student}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <School size={16} className="text-gray-400" />
                        <span className="text-gray-600">{solution!.school}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="text-gray-500 text-sm">Submetida em {solution!.submittedAt}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center space-x-4 mb-6">
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(solution!.status)}`}>
                    {solution!.status}
                  </span>
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-xl text-gray-600 hover:border-gray-400 transition-colors">
                      <ThumbsUp size={16} />
                      <span>12</span>
                    </button>
                    <button className="p-2 border border-gray-300 rounded-xl text-gray-600 hover:border-gray-400 transition-colors">
                      <Bookmark size={16} />
                    </button>
                    <button className="p-2 border border-gray-300 rounded-xl text-gray-600 hover:border-gray-400 transition-colors">
                      <Share2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="prose max-w-none mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Descrição da Solução</h3>
              <p className="text-gray-700 leading-relaxed text-lg">
                {solution!.description}
              </p>
            </div>

            {/* Technologies Used */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Tecnologias Utilizadas</h3>
              <div className="flex flex-wrap gap-3">
                {solution!.technologies.map((tech: string) => (
                  <span key={tech} className="px-4 py-2 bg-blue-100 text-blue-800 rounded-xl font-medium">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Funcionalidades Principais</h3>
              <ul className="space-y-3">
                {[
                  "Interface intuitiva e responsiva",
                  "Integração com APIs externas", 
                  "Sistema de autenticação seguro",
                  "Relatórios e analytics em tempo real"
                ].map((feature: string, index: number) => (
                  <li key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Code Repository */}
            {solution!.githubUrl && (
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Repositório de Código</h3>
                <a
                  href={solution!.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-3 bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors"
                >
                  <Github size={20} />
                  <span>Ver no GitHub</span>
                  <ExternalLink size={16} />
                </a>
              </div>
            )}
          </div>
        </motion.div>

          {/* Comments Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Comentários e Feedback
            </h3>
            
            <div className="space-y-6">
              {/* Comment Form */}
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-solve-blue to-solve-purple rounded-full flex-shrink-0"></div>
                <div className="flex-1">
                  <textarea
                    placeholder="Partilhe a sua opinião sobre esta solução..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-solve-blue focus:border-transparent"
                  />
                  <div className="flex justify-end mt-2">
                    <button className="bg-solve-blue text-white px-6 py-2 rounded-xl font-medium hover:bg-solve-purple transition-colors">
                      Comentar
                    </button>
                  </div>
                </div>
              </div>

              {/* Sample Comments */}
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-semibold text-gray-900">Maria Silva</span>
                      <span className="text-gray-500 text-sm">• Empresa TechRetail</span>
                    </div>
                    <p className="text-gray-700">
                      Excelente trabalho! A solução proposta é muito inovadora e atende perfeitamente às nossas necessidades.
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>Há 2 dias</span>
                      <button className="hover:text-gray-700">Responder</button>
                      <button className="hover:text-gray-700">Gostei</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Problem Info */}
          {problem && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Problema Original</h3>
              
              <div className="space-y-3 mb-4">
                <h4 className="font-medium text-gray-900 line-clamp-2">
                  {problem.title}
                </h4>
                <p className="text-sm text-gray-600 line-clamp-3">
                  {problem.description}
                </p>
              </div>

              <Link
                to={`/problems/${problem.id}`}
                className="block w-full text-center bg-gray-100 text-gray-700 py-2 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Ver Problema
              </Link>
            </div>
            </motion.div>
          )}

          {/* Student Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sobre o Estudante</h3>
            
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-solve-blue to-solve-purple rounded-full flex items-center justify-center text-white font-bold">
                {solution!.student.split(' ').map((n: string) => n[0]).join('')}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{solution!.student}</h4>
                <p className="text-sm text-gray-600">{solution!.school}</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Soluções Submetidas</span>
                <span className="font-semibold">{totalSubmissions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Soluções Aceites</span>
                <span className="font-semibold text-green-600">{acceptedSubmissions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avaliação Média</span>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="font-semibold">{averageRating}/5</span>
                </div>
              </div>
            </div>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="bg-gradient-to-r from-solve-teal to-solve-blue rounded-2xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Gostou desta solução?</h3>
            <p className="text-blue-100 mb-6 text-sm">
              Mostre o seu apoio e deixe feedback construtivo
            </p>
            
            <div className="space-y-3">
              <button className="w-full bg-white text-solve-blue py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2">
                <ThumbsUp size={16} />
                <span>Apoiar Solução</span>
              </button>
              
              <button className="w-full bg-transparent border border-white text-white py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors flex items-center justify-center space-x-2">
                <MessageCircle size={16} />
                <span>Deixar Comentário</span>
              </button>
            </div>
          </div>
        </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SolutionDetail;